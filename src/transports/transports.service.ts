import {
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StripeService } from "../stripe/stripe.service";
import { NotificationsService } from "../notifications/notifications.service";
import { PromoCodesService } from "../promo-codes/promo-codes.service";
import { ConfigService } from "@nestjs/config";
import { CreateTransportDto, PaymentMethod } from "./dto/create-transport.dto";
import {
  UpdatePositionDto,
  PositionUpdateEventDto,
} from "./dto/update-position.dto";
import { StatutTransport, Prisma, StatutChauffeur } from "@prisma/client";
import {
  Client as GoogleMapsClient,
  TravelMode,
} from "@googlemaps/google-maps-services-js";
import { TransportGateway } from "./transport.gateway";
import { PositionTrackingService } from "./position-tracking.service";

@Injectable()
export class TransportsService {
  private googleMapsClient: GoogleMapsClient;
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private notificationsService: NotificationsService,
    private promoCodesService: PromoCodesService,
    private configService: ConfigService,
    @Inject(forwardRef(() => TransportGateway))
    private transportGateway: TransportGateway,
    @Inject(forwardRef(() => PositionTrackingService))
    private positionTrackingService: PositionTrackingService
  ) {
    this.googleMapsClient = new GoogleMapsClient({});
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TransportWhereUniqueInput;
    where?: Prisma.TransportWhereInput;
    orderBy?: Prisma.TransportOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;

    const [items, count] = await Promise.all([
      this.prisma.transport.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {
          client: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              telephone: true,
            },
          },
          vehicule: {
            select: {
              id: true,
              marque: true,
              modele: true,
              immatriculation: true,
              type: true,
              categorie: true,
            },
          },
          chauffeur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              telephone: true,
              photoUrl: true,
            },
          },
        },
      }),
      this.prisma.transport.count({ where }),
    ]);

    return {
      items,
      meta: {
        total: count,
        skip,
        take,
      },
    };
  }

  async findOne(id: number) {
    const transport = await this.prisma.transport.findUnique({
      where: { id },
      include: {
        client: true,
        vehicule: true,
        chauffeur: true,
        Message: {
          include: {
            client: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
            chauffeur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                photoUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!transport) {
      throw new NotFoundException(`Transport avec l'ID ${id} non trouvé`);
    }

    return transport;
  }

  async create(createTransportDto: CreateTransportDto) {
    const { promoCode, ...transportData } = createTransportDto;

    const client = await this.prisma.client.findUnique({
      where: { id: createTransportDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(
        `Client avec l'ID ${createTransportDto.clientId} non trouvé`
      );
    }

    // Déterminer le mode de paiement (STRIPE par défaut si non spécifié)
    const paymentMethod =
      createTransportDto.paymentMethod || PaymentMethod.STRIPE;

    // Vérifier si le client a un Stripe Customer ID, seulement pour les paiements STRIPE
    if (paymentMethod === PaymentMethod.STRIPE && !client.stripeCustomerId) {
      const stripeCustomer = await this.stripeService.createCustomer(
        `${client.prenom} ${client.nom}`,
        client.email
      );
      await this.prisma.client.update({
        where: { id: client.id },
        data: { stripeCustomerId: stripeCustomer.id },
      });
      client.stripeCustomerId = stripeCustomer.id;
    }

    const vehicule = await this.prisma.vehicule.findUnique({
      where: { id: createTransportDto.vehiculeId },
      include: {
        chauffeurs: {
          where: {
            statutActivite: "ACTIF",
          },
          take: 1,
        },
      },
    });

    if (!vehicule) {
      throw new NotFoundException(
        `Véhicule avec l'ID ${createTransportDto.vehiculeId} non trouvé`
      );
    }

    if (vehicule.statut !== "DISPONIBLE") {
      throw new BadRequestException("Le véhicule n'est pas disponible");
    }

    if (!vehicule.chauffeurs || vehicule.chauffeurs.length === 0) {
      throw new BadRequestException(
        "Aucun chauffeur actif assigné à ce véhicule"
      );
    }

    const chauffeur = vehicule.chauffeurs[0];

    // Calculer la distance et la durée avec Google Maps
    const { distance: distanceEstimee, duration: dureeEstimee } =
      await this.calculerDistanceEtDuree(
        {
          lat: createTransportDto.departLatitude,
          lng: createTransportDto.departLongitude,
        },
        {
          lat: createTransportDto.destinationLatitude,
          lng: createTransportDto.destinationLongitude,
        }
      );

    // Calculer le montant estimé
    const montantEstime = this.calculerMontantEstime(
      distanceEstimee,
      dureeEstimee,
      vehicule.tarifHoraire
    );

    // Gestion du code promo
    let montantReduction = 0;
    let promoCodeRecord = null;

    if (promoCode) {
      try {
        promoCodeRecord = await this.promoCodesService.validateAndGetCode(
          promoCode,
          montantEstime
        );
        montantReduction = this.promoCodesService.calculateDiscount(
          promoCodeRecord,
          montantEstime
        );
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    const transport = await this.prisma.transport.create({
      data: {
        clientId: createTransportDto.clientId,
        vehiculeId: createTransportDto.vehiculeId,
        chauffeurId: chauffeur.id, // Auto-assignation du chauffeur
        adresseDepart: createTransportDto.adresseDepart,
        adresseDestination: createTransportDto.adresseDestination,
        departLatitude: createTransportDto.departLatitude,
        departLongitude: createTransportDto.departLongitude,
        destinationLatitude: createTransportDto.destinationLatitude,
        destinationLongitude: createTransportDto.destinationLongitude,
        distanceEstimee,
        dureeEstimee,
        montantEstime,
        montantReduction,
        promoCodeId: promoCodeRecord?.id,
        tarifHoraireApplique: vehicule.tarifHoraire,
        paymentMethod: createTransportDto.paymentMethod || "STRIPE",

        cashPaymentStatus:
          createTransportDto.paymentMethod === "CASH" ? "PENDING" : null,
      },
    });

    // Mettre à jour le statut du véhicule (réservé mais pas encore assigné)
    await this.prisma.vehicule.update({
      where: { id: vehicule.id },
      data: { statut: "ASSIGNE" },
    });

    // Logique différente selon le mode de paiement
    if (paymentMethod === PaymentMethod.STRIPE) {
      // URLs de redirection après configuration du moyen de paiement
      const baseUrl = this.configService.get<string>("BASE_URL") || "mema://";
      const successUrl = `${baseUrl}(protected)/payment/SuccessPayment`;
      const cancelUrl = `${baseUrl}(protected)/payment/FailedPayment`;

      // Créer une session Stripe pour configurer le moyen de paiement
      const setupSession = await this.stripeService.createSetupSession(
        client.stripeCustomerId,
        successUrl,
        cancelUrl,
        { transportId: transport.id.toString() }
      );

      console.log("successUrl", successUrl);
      console.log("cancelUrl", cancelUrl);

      return {
        transport: {
          client,
          vehicule,
          ...transport,
        },
        paymentMethod,
        setupUrl: setupSession.url,
        sessionId: setupSession.id,
      };
    } else {
      // Pour le paiement CASH, pas besoin de configuration Stripe
      // Le transport est directement prêt à être validé par un chauffeur
      await this.notificationsService.createSystemNotification(
        null,
        transport.clientId,
        null,
        "Transport créé avec paiement en espèces",
        "Votre demande de transport a été créée. Le paiement se fera en espèces à la fin du trajet."
      );

      return {
        transport,
        paymentMethod,
        message:
          "Transport créé avec succès. Paiement en espèces à la fin du trajet.",
      };
    }
  }

  private async calculerDistanceEtDuree(
    depart: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) {
    const apiKey = this.configService.get<string>("GOOGLE_MAPS_API_KEY");

    if (!apiKey) {
      throw new Error("Clé API Google Maps non définie");
    }

    try {
      const response = await this.googleMapsClient.directions({
        params: {
          origin: `${depart.lat},${depart.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          mode: TravelMode.driving,
          key: apiKey,
        },
        timeout: 10000, // facultatif : timeout personnalisé
      });

      const routes = response.data.routes;

      if (
        !routes ||
        routes.length === 0 ||
        !routes[0].legs ||
        routes[0].legs.length === 0
      ) {
        throw new Error("Aucun itinéraire trouvé");
      }

      const route = routes[0].legs[0];

      return {
        distance: route.distance.value / 1000, // km
        duration: Math.ceil(route.duration.value / 60), // minutes
      };
    } catch (error: any) {
      console.error("Erreur Google Maps API:", error);
      throw new BadRequestException("Impossible de calculer l'itinéraire");
    }
  }

  private calculerMontantEstime(
    distance: number,
    duree: number,
    tarifHoraire: number
  ): number {
    // Prix de base
    const prixBase = 10;
    // Prix au kilomètre
    const prixKm = 2;
    // Prix à la minute (basé sur le tarif horaire)
    const prixMinute = tarifHoraire / 60;

    return prixBase + distance * prixKm + duree * prixMinute;
  }

  private calculerMontantFinal(transport: any): number {
    // Si pas d'heure de départ ou d'arrivée, retourner le montant estimé moins la réduction
    if (!transport.heureDepart || !transport.heureArrivee) {
      const montantBrut = transport.montantEstime;
      const montantReduction = transport.montantReduction || 0;
      return Math.max(0, montantBrut - montantReduction);
    }

    const tarifHoraire =
      transport.tarifHoraireApplique || transport.vehicule.tarifHoraire;
    if (!tarifHoraire) {
      throw new Error("Aucun tarif horaire défini pour ce véhicule");
    }

    // Calculer la durée réelle en heures
    const dureeMs =
      transport.heureArrivee.getTime() - transport.heureDepart.getTime();
    const dureeHeures = dureeMs / (1000 * 60 * 60); // Convertir ms en heures

    let montantBrut;

    // Si la durée est inférieure à 1 heure, appliquer le tarif minimum (1 heure)
    if (dureeHeures <= 1) {
      montantBrut = tarifHoraire;
    } else {
      // Sinon, calculer le montant au prorata des heures
      montantBrut = tarifHoraire * dureeHeures;
    }

    // Appliquer la réduction
    const montantReduction = transport.montantReduction || 0;
    const montantFinal = Math.max(0, montantBrut - montantReduction);

    return Math.round(montantFinal * 100) / 100; // Arrondir à 2 décimales
  }

  /**
   * Valide un code promo et retourne les informations de réduction
   */
  async validatePromoCode(code: string, montantCourse: number) {
    return this.promoCodesService.validatePromoCode(code, montantCourse);
  }

  async validerTransport(id: number, chauffeurId: number) {
    const transport = await this.prisma.transport.findUnique({
      where: { id },
      include: {
        client: true,
        vehicule: true,
        course: true,
      },
    });

    if (!transport) {
      throw new NotFoundException(`Transport avec l'ID ${id} non trouvé`);
    }

    // Déterminer le mode de paiement depuis la course
    const paymentMethod =
      (transport.paymentMethod?.toUpperCase() as PaymentMethod) ||
      PaymentMethod.STRIPE;

    // Vérifications différentes selon le mode de paiement
    if (paymentMethod === PaymentMethod.STRIPE) {
      // Vérification plus souple du statut de paiement pour Stripe
      // On vérifie simplement que l'intention de paiement existe

      const paymentIntent = await this.stripeService.retrievePaymentIntent(
        transport.stripePaymentIntentId
      );

      if (!paymentIntent) {
        throw new BadRequestException(
          "Aucune intention de paiement n'est associée à ce transport"
        );
      }
      // Nous acceptons tous les statuts de paiement à ce stade
      // Le paiement sera effectivement capturé à la fin du trajet
    } else if (paymentMethod === PaymentMethod.CASH) {
      // Pour le paiement CASH, pas de vérification de paiement nécessaire
      // Le transport peut être validé directement
      console.log("Transport avec paiement en espèces - validation directe");
    }

    const updatedTransport = await this.prisma.transport.update({
      where: { id },
      data: {
        chauffeurId,
        status: StatutTransport.VALIDE,
      },
    });

    const paymentInfo =
      paymentMethod === PaymentMethod.CASH
        ? "Le paiement se fera en espèces à la fin du trajet."
        : "";

    await this.notificationsService.createSystemNotification(
      null,
      transport.clientId,
      null,
      "Transport validé",
      `Votre demande de transport a été validée par un chauffeur. ${paymentInfo}`
    );

    return updatedTransport;
  }
  async updatePosition(
    id: number,
    latitude: number,
    longitude: number,
    statusInfo?: string
  ) {
    const transport = await this.prisma.transport.findUnique({
      where: { id },
      include: {
        chauffeur: true,
        client: true,
      },
    });

    if (!transport) {
      throw new NotFoundException(`Transport avec l'ID ${id} non trouvé`);
    }

    if (!transport.chauffeurId) {
      throw new BadRequestException("Aucun chauffeur assigné à ce transport");
    }

    const position = { lat: latitude, lng: longitude };
    const timestamp = new Date();

    // Mettre à jour la position dans la base de données
    const updatedTransport = await this.prisma.transport.update({
      where: { id },
      data: {
        positionActuelle: position,
        updatedAt: timestamp,
      },
      include: {
        chauffeur: true,
        client: true,
      },
    });

    // Créer l'événement de mise à jour de position
    const positionUpdateEvent: PositionUpdateEventDto = {
      transportId: id,
      chauffeurId: transport.chauffeurId,
      position: position,
      timestamp: timestamp,
      statusInfo: statusInfo,
    };

    // Émettre l'événement WebSocket en temps réel
    await this.transportGateway.emitPositionUpdate(id, positionUpdateEvent);

    // Calculer et émettre l'ETA si possible
    if (
      transport.status === "EN_ROUTE_RAMASSAGE" ||
      transport.status === "EN_COURSE"
    ) {
      await this.calculateAndEmitETA(id, position, transport);
    }

    // Détecter les déviations de route
    await this.positionTrackingService.detectRouteDeviation(id, position);

    // Créer une notification système pour informer le client
    await this.notificationsService.createSystemNotification(
      null,
      transport.clientId,
      transport.chauffeurId,
      "Position mise à jour",
      statusInfo ||
        `Le chauffeur ${transport.chauffeur?.prenom} ${transport.chauffeur?.nom} a mis à jour sa position`
    );

    return {
      transport: updatedTransport,
      position: position,
      timestamp: timestamp,
      message: "Position mise à jour avec succès",
    };
  }

  async updateStatus(id: number, newStatus: StatutTransport) {
    const transport = await this.prisma.transport.findUnique({
      where: { id },
      include: {
        client: true,
        chauffeur: true,
        vehicule: true,
        course: true,
      },
    });

    if (!transport) {
      throw new NotFoundException(`Transport avec l'ID ${id} non trouvé`);
    }

    // Vérifier les transitions de statut valides
    await this.validateStatusTransition(transport.status, newStatus, transport);

    // Mapping des statuts de transport vers les statuts de course
    const courseStatus = {
      EN_ATTENTE: "EN_ATTENTE",
      VALIDE: "EN_ATTENTE",
      EN_ROUTE_RAMASSAGE: "EN_COURS",
      ARRIVE_RAMASSAGE: "EN_COURS",
      EN_COURSE: "EN_COURS",
      TERMINE: "TERMINEE",
      ANNULE: "ANNULEE",
    }[newStatus];

    // Actions spécifiques selon le nouveau statut
    switch (newStatus) {
      case StatutTransport.EN_ROUTE_RAMASSAGE:
        if (!transport.chauffeurId) {
          throw new BadRequestException(
            "Le transport doit avoir un chauffeur assigné"
          );
        }
        break;

      case StatutTransport.EN_COURSE:
        if (transport.status !== StatutTransport.ARRIVE_RAMASSAGE) {
          throw new BadRequestException(
            "Le chauffeur doit d'abord être arrivé au point de ramassage"
          );
        }
        break;

      case StatutTransport.TERMINE:
        await this.handleTransportCompletion(transport);
        break;
    }

    const updateData: any = {
      status: newStatus,
    };

    // Mise à jour des heures de début et de fin pour la course
    if (newStatus === StatutTransport.EN_COURSE) {
      const now = new Date();
      updateData.heureDepart = now;
      updateData.course.update.startTime = now;
    } else if (newStatus === StatutTransport.TERMINE) {
      const now = new Date();
      updateData.heureArrivee = now;
      updateData.course.update.endTime = now;
    }

    const updatedTransport = await this.prisma.transport.update({
      where: { id },
      data: updateData,
    });

    await this.notificationsService.createSystemNotification(
      null,
      transport.clientId,
      transport.chauffeurId,
      "Statut du transport mis à jour",
      `Le statut de votre transport est maintenant : ${newStatus}`
    );

    return updatedTransport;
  }

  private async validateStatusTransition(
    currentStatus: StatutTransport,
    newStatus: StatutTransport,
    transport: any
  ) {
    const validTransitions = {
      [StatutTransport.EN_ATTENTE]: [
        StatutTransport.VALIDE,
        StatutTransport.ANNULE,
      ],
      [StatutTransport.VALIDE]: [
        StatutTransport.EN_ROUTE_RAMASSAGE,
        StatutTransport.ANNULE,
      ],
      [StatutTransport.EN_ROUTE_RAMASSAGE]: [
        StatutTransport.ARRIVE_RAMASSAGE,
        StatutTransport.ANNULE,
      ],
      [StatutTransport.ARRIVE_RAMASSAGE]: [
        StatutTransport.EN_COURSE,
        StatutTransport.ANNULE,
      ],
      [StatutTransport.EN_COURSE]: [
        StatutTransport.TERMINE,
        StatutTransport.ANNULE,
      ],
      [StatutTransport.TERMINE]: [],
      [StatutTransport.ANNULE]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Impossible de passer du statut ${currentStatus} à ${newStatus}`
      );
    }
  }

  private async handleTransportCompletion(transport: any) {
    // Déterminer le mode de paiement
    const paymentMethod =
      (transport.course?.paymentMethod?.toUpperCase() as PaymentMethod) ||
      PaymentMethod.STRIPE;

    if (paymentMethod === PaymentMethod.STRIPE) {
      // Vérifier le statut du paiement Stripe
      const paymentIntent = await this.stripeService.retrievePaymentIntent(
        transport.stripePaymentIntentId
      );
      console.log("Payment Intent Status:", paymentIntent);

      // Vérifier les différents états possibles de l'intention de paiement
      switch (paymentIntent.status) {
        case "requires_capture":
          // État normal après une pré-autorisation, on peut capturer le paiement
          await this.stripeService.capturePaymentIntent(
            transport.stripePaymentIntentId
          );
          break;

        case "requires_payment_method":
          // Le client n'a pas encore fourni de moyen de paiement
          throw new BadRequestException(
            "Le client n'a pas encore fourni de moyen de paiement. Impossible de terminer le transport."
          );

        case "requires_confirmation":
          // Le moyen de paiement a été fourni mais nécessite une confirmation
          throw new BadRequestException(
            "Le paiement nécessite une confirmation du client avant de pouvoir terminer le transport."
          );

        case "succeeded":
          // Le paiement a déjà été capturé
          break;

        default:
          throw new BadRequestException(
            `Le paiement ne peut pas être capturé dans son état actuel (${paymentIntent.status})`
          );
      }
    } else if (paymentMethod === PaymentMethod.CASH) {
      // Pour le paiement CASH, pas de traitement de paiement nécessaire
      // Le paiement sera effectué physiquement entre le client et le chauffeur
      console.log(
        "Transport avec paiement en espèces - pas de traitement de paiement électronique"
      );

      // Optionnel: Créer une notification pour rappeler le paiement en espèces
      await this.notificationsService.createSystemNotification(
        null,
        transport.clientId,
        transport.chauffeurId,
        "Paiement en espèces",
        `Montant à payer en espèces: ${
          transport.montantFinal || transport.montantEstime
        }€`
      );
    }

    // Libérer le véhicule (commun aux deux modes de paiement)
    await this.prisma.vehicule.update({
      where: { id: transport.vehiculeId },
      data: { statut: "DISPONIBLE" },
    });
  }

  private async checkPaymentStatus(paymentIntentId: string): Promise<string> {
    const paymentIntent = await this.stripeService.retrievePaymentIntent(
      paymentIntentId
    );
    return paymentIntent.status;
  }

  async evaluerTransport(id: number, evaluation: number, commentaire?: string) {
    const transport = await this.prisma.transport.findUnique({
      where: { id },
    });

    if (!transport) {
      throw new NotFoundException(`Transport avec l'ID ${id} non trouvé`);
    }

    if (transport.status !== "TERMINE") {
      throw new BadRequestException(
        "Le transport doit être terminé pour pouvoir être évalué"
      );
    }

    return this.prisma.transport.update({
      where: { id },
      data: {
        evaluation,
        commentaire,
      },
    });
  }

  async confirmPayment(id: number) {
    const transport = await this.prisma.transport.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });

    if (!transport) {
      throw new NotFoundException(`Transport avec l'ID ${id} non trouvé`);
    }

    if (transport.status !== "EN_ATTENTE") {
      throw new BadRequestException(
        "Le transport n'est plus en attente de paiement"
      );
    }

    // Vérifier le statut du paiement
    const paymentIntent = await this.stripeService.retrievePaymentIntent(
      transport.stripePaymentIntentId
    );

    if (paymentIntent.status === "requires_payment_method") {
      throw new BadRequestException("Le paiement n'a pas encore été initié");
    }

    if (paymentIntent.status === "requires_capture") {
      // Le paiement a été autorisé avec succès
      await this.prisma.transport.update({
        where: { id },
        data: {
          status: "VALIDE",
        },
      });

      await this.notificationsService.createSystemNotification(
        null,
        transport.clientId,
        null,
        "Paiement confirmé",
        "Votre paiement a été confirmé. Un chauffeur peut maintenant accepter votre demande de transport."
      );

      return {
        message: "Paiement confirmé avec succès",
        status: "VALIDE",
      };
    }

    throw new BadRequestException(
      `Le paiement est dans un état inattendu : ${paymentIntent.status}`
    );
  }

  async finalizeTransportAfterPaymentSetup(
    transportId: number,
    sessionId: string
  ) {
    const transport = await this.prisma.transport.findUnique({
      where: { id: transportId },
      include: { client: true },
    });

    if (!transport) {
      throw new NotFoundException(
        `Transport avec l'ID ${transportId} non trouvé`
      );
    }

    // Vérifier que la session Stripe est complétée
    const session = await this.stripeService.retrieveCheckoutSession(sessionId);
    if (session.status !== "complete") {
      throw new BadRequestException(
        "La configuration du moyen de paiement n'est pas encore terminée"
      );
    }

    // Récupérer l'intention de configuration (setupIntent) depuis la session
    const setupIntent = await this.stripeService.retrieveSetupIntent(
      session.setup_intent as string
    );
    if (!setupIntent.payment_method) {
      throw new BadRequestException(
        "Aucun moyen de paiement n'a été configuré"
      );
    }

    const paymentMethodId =
      typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent.payment_method.id;

    try {
      // 1. Créer l'intention de paiement sans confirmation
      const paymentIntent = await this.stripeService.createPaymentIntent(
        Math.round(transport.montantEstime * 100),
        "eur",
        transport.client.stripeCustomerId,
        { transportId: transport.id.toString() }
      );

      // 2. Mettre à jour avec le moyen de paiement
      await this.stripeService.updatePaymentIntent(paymentIntent.id, {
        payment_method: paymentMethodId,
      });

      // 3. Confirmer le paiement
      await this.stripeService.confirmPaymentIntent(
        paymentIntent.id,
        paymentMethodId
      );

      // 4. Mettre à jour le transport
      const updatedTransport = await this.prisma.transport.update({
        where: { id: transportId },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          status: StatutTransport.EN_ATTENTE,
        },
      });

      await this.notificationsService.createSystemNotification(
        null,
        transport.clientId,
        null,
        "Moyen de paiement configuré",
        "Votre moyen de paiement a été configuré avec succès. Votre transport est maintenant en attente."
      );

      return {
        transport: updatedTransport,
        paymentStatus: paymentIntent.status,
      };
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de la configuration du paiement : ${error.message}`
      );
    }
  }
  async startTransport(id: number) {
    const transport = await this.prisma.transport.findUnique({
      where: { id },
      include: { vehicule: true },
    });

    if (!transport) {
      throw new NotFoundException(`Transport avec l'ID ${id} non trouvé`);
    }

    const updatedTransport = await this.prisma.transport.update({
      where: { id },
      data: {
        heureDepart: new Date(),
        tarifHoraireApplique: transport.vehicule.tarifHoraire,
        status: StatutTransport.EN_COURSE,
      },
    });

    // Démarrer automatiquement le suivi en temps réel
    await this.startAutomaticTracking(id);

    // Notifier le client que le transport a commencé
    await this.notificationsService.createSystemNotification(
      null,
      transport.clientId,
      transport.chauffeurId,
      "Transport démarré",
      "Votre transport a commencé. Vous pouvez maintenant suivre votre chauffeur en temps réel."
    );

    return updatedTransport;
  }
  async endTransport(id: number) {
    const transport = await this.prisma.transport.findUnique({
      where: { id },
      include: {
        vehicule: true,
      },
    });

    if (!transport) {
      throw new NotFoundException(`Transport avec l'ID ${id} non trouvé`);
    }

    const heureArrivee = new Date();
    const dureeMs =
      heureArrivee.getTime() - (transport.heureDepart?.getTime() || 0);
    const dureeMinutes = Math.round(dureeMs / (1000 * 60));

    const updatedTransport = await this.prisma.transport.update({
      where: { id },
      data: {
        heureArrivee,
        dureeReelle: dureeMinutes,
        status: StatutTransport.TERMINE,
      },
      include: { vehicule: true },
    });

    const montantFinal = this.calculerMontantFinal(updatedTransport);

    // Arrêter le suivi automatique
    await this.stopAutomaticTracking(id);

    // Notifier que le transport est terminé
    await this.notificationsService.createSystemNotification(
      null,
      transport.clientId,
      transport.chauffeurId,
      "Transport terminé",
      `Votre transport est terminé. Durée: ${dureeMinutes} minutes. Montant final: ${montantFinal}€`
    );

    await this.prisma.vehicule.update({
      where: { id: transport.vehiculeId },
      data: { statut: "DISPONIBLE" },
    });

    // Incrémenter l'usage du code promo si utilisé
    const transportAny = transport as any;
    if (transportAny.promoCodeId) {
      await this.promoCodesService.incrementUsage(transportAny.promoCodeId);
    }

    return this.prisma.transport.update({
      where: { id },
      data: {
        montantFinal,
      },
    });
  }

  async getCurrentPosition(id: number) {
    const transport = await this.prisma.transport.findUnique({
      where: { id },
      select: {
        id: true,
        positionActuelle: true,
        status: true,
        chauffeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        updatedAt: true,
      },
    });

    if (!transport) {
      throw new NotFoundException(`Transport avec l'ID ${id} non trouvé`);
    }

    return {
      transportId: id,
      position: transport.positionActuelle,
      status: transport.status,
      chauffeur: transport.chauffeur,
      lastUpdate: transport.updatedAt,
    };
  }
  async trackTransportRealTime(id: number, chauffeurId: number) {
    const transport = await this.prisma.transport.findUnique({
      where: { id },
      include: {
        chauffeur: true,
        client: true,
      },
    });

    if (!transport) {
      throw new NotFoundException(`Transport avec l'ID ${id} non trouvé`);
    }

    if (transport.chauffeurId !== chauffeurId) {
      throw new BadRequestException(
        "Vous n'êtes pas autorisé à suivre ce transport"
      );
    }

    // Activer le suivi en temps réel
    await this.transportGateway.startRealTimeTracking(id);

    // Retourner les informations de suivi
    return {
      transportId: id,
      isTrackingEnabled: true,
      currentPosition: transport.positionActuelle,
      status: transport.status,
      client: {
        nom: transport.client.nom,
        prenom: transport.client.prenom,
      },
      websocketNamespace: "/transport",
      message: "Suivi temps réel activé pour ce transport",
    };
  }

  // Calculer et émettre l'ETA (Estimated Time of Arrival)
  private async calculateAndEmitETA(
    transportId: number,
    currentPosition: { lat: number; lng: number },
    transport: any
  ) {
    try {
      let destination: { lat: number; lng: number };

      // Déterminer la destination en fonction du statut
      if (transport.status === "EN_ROUTE_RAMASSAGE") {
        destination = {
          lat: transport.departLatitude,
          lng: transport.departLongitude,
        };
      } else if (transport.status === "EN_COURSE") {
        destination = {
          lat: transport.destinationLatitude,
          lng: transport.destinationLongitude,
        };
      } else {
        return; // Pas de calcul d'ETA nécessaire pour les autres statuts
      }

      const route = await this.calculerDistanceEtDuree(
        currentPosition,
        destination
      );

      const estimatedArrival = new Date();
      estimatedArrival.setMinutes(
        estimatedArrival.getMinutes() + route.duration
      );

      const etaData = {
        estimatedArrival,
        distanceRemaining: route.distance,
        durationRemaining: route.duration,
      };

      // Émettre la mise à jour d'ETA via WebSocket
      await this.transportGateway.emitETAUpdate(transportId, etaData);

      this.logger.log(`ETA calculé pour le transport ${transportId}:`, etaData);
    } catch (error) {
      this.logger.error(
        `Erreur lors du calcul de l'ETA pour le transport ${transportId}:`,
        error.message
      );
    }
  }
  // Démarrer le suivi automatique pour un transport
  async startAutomaticTracking(transportId: number) {
    await this.transportGateway.startRealTimeTracking(transportId);

    // Démarrer le suivi automatique avec le service dédié
    await this.positionTrackingService.startAutoTracking(transportId, 30000); // 30 secondes

    // Notifier tous les participants
    await this.transportGateway.notifyTransportParticipants(
      transportId,
      "Le suivi automatique a été activé pour ce transport"
    );

    return {
      message: "Suivi automatique démarré",
      transportId,
      interval: 30000,
      timestamp: new Date(),
    };
  }

  // Arrêter le suivi automatique pour un transport
  async stopAutomaticTracking(transportId: number) {
    await this.transportGateway.stopRealTimeTracking(transportId);

    // Arrêter le suivi automatique avec le service dédié
    this.positionTrackingService.stopAutoTracking(transportId);

    // Notifier tous les participants
    await this.transportGateway.notifyTransportParticipants(
      transportId,
      "Le suivi automatique a été désactivé pour ce transport"
    );

    return {
      message: "Suivi automatique arrêté",
      transportId,
      timestamp: new Date(),
    };
  }
  // Obtenir l'historique des positions pour un transport
  async getPositionHistory(transportId: number, limit: number = 50) {
    // Cette fonctionnalité nécessiterait une table d'historique des positions
    // Pour le moment, nous retournons la position actuelle
    const transport = await this.prisma.transport.findUnique({
      where: { id: transportId },
      select: {
        id: true,
        positionActuelle: true,
        updatedAt: true,
        status: true,
      },
    });

    if (!transport) {
      throw new NotFoundException(
        `Transport avec l'ID ${transportId} non trouvé`
      );
    }

    return {
      transportId,
      positions: transport.positionActuelle
        ? [
            {
              position: transport.positionActuelle,
              timestamp: transport.updatedAt,
              status: transport.status,
            },
          ]
        : [],
      message:
        "Historique des positions récupéré (position actuelle uniquement)",
    };
  }

  // Obtenir les statistiques de suivi en temps réel
  async getTrackingStatistics() {
    const trackingStats = this.positionTrackingService.getTrackingStats();

    // Obtenir les transports en cours
    const activeTransports = await this.prisma.transport.findMany({
      where: {
        status: {
          in: ["EN_ROUTE_RAMASSAGE", "EN_COURSE", "ARRIVE_RAMASSAGE"],
        },
      },
      select: {
        id: true,
        status: true,
        positionActuelle: true,
        updatedAt: true,
        chauffeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return {
      trackingStats,
      activeTransports: activeTransports.length,
      transportsDetails: activeTransports,
      timestamp: new Date(),
    };
  }

  // Nettoyer les ressources de suivi (à appeler lors de l'arrêt de l'application)
  async cleanup() {
    this.positionTrackingService.cleanup();
    this.logger.log("Services de suivi nettoyés");
  }

  // === MÉTHODES POUR LE CHAT TRANSPORT ===

  /**
   * Créer un message dans le contexte d'un transport
   * @param transportId ID du transport
   * @param contenu Contenu du message
   * @param expediteurType Type d'expéditeur (CLIENT ou CHAUFFEUR)
   * @param expediteurId ID de l'expéditeur (clientId ou chauffeurId)
   */
  async createTransportMessage(
    transportId: number,
    contenu: string,
    expediteurType: "CLIENT" | "CHAUFFEUR",
    expediteurId: number
  ) {
    // Vérifier que le transport existe et que l'expéditeur est autorisé
    const transport = await this.prisma.transport.findUnique({
      where: { id: transportId },
      include: {
        client: true,
        chauffeur: true,
      },
    });

    if (!transport) {
      throw new NotFoundException(
        `Transport avec l'ID ${transportId} non trouvé`
      );
    }

    // Vérifier que l'expéditeur est bien associé au transport
    if (expediteurType === "CLIENT" && transport.clientId !== expediteurId) {
      throw new BadRequestException(
        "Ce client n'est pas associé à ce transport"
      );
    }

    if (
      expediteurType === "CHAUFFEUR" &&
      transport.chauffeurId !== expediteurId
    ) {
      throw new BadRequestException(
        "Ce chauffeur n'est pas associé à ce transport"
      );
    }

    // Créer le message
    const message = await this.prisma.message.create({
      data: {
        contenu,
        transportId,
        clientId: expediteurType === "CLIENT" ? expediteurId : null,
        chauffeurId: expediteurType === "CHAUFFEUR" ? expediteurId : null,
        expediteurType,
        lu: false,
      },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoUrl: true,
          },
        },
        chauffeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoUrl: true,
          },
        },
        transport: {
          select: {
            id: true,
            adresseDepart: true,
            adresseDestination: true,
            status: true,
          },
        },
      },
    });

    // Créer une notification pour le destinataire
    const destinataireId =
      expediteurType === "CLIENT" ? transport.chauffeurId : transport.clientId;
    const expediteurNom =
      expediteurType === "CLIENT"
        ? `${transport.client.prenom} ${transport.client.nom}`
        : `${transport.chauffeur?.prenom} ${transport.chauffeur?.nom}`;

    if (destinataireId) {
      await this.notificationsService.createSystemNotification(
        expediteurType === "CLIENT" ? null : destinataireId,
        expediteurType === "CLIENT" ? destinataireId : null,
        expediteurType === "CHAUFFEUR" ? expediteurId : null,
        `Nouveau message de ${expediteurNom}`,
        contenu.length > 50 ? `${contenu.substring(0, 50)}...` : contenu
      );
    }

    return message;
  }

  /**
   * Récupérer les messages d'un transport avec pagination
   * @param transportId ID du transport
   * @param userId ID de l'utilisateur (pour marquer comme lu)
   * @param userType Type d'utilisateur (CLIENT ou CHAUFFEUR)
   * @param skip Nombre d'éléments à ignorer
   * @param take Nombre d'éléments à récupérer
   */
  async getTransportMessages(
    transportId: number,
    userId: number,
    userType: "CLIENT" | "CHAUFFEUR",
    skip: number = 0,
    take: number = 50
  ) {
    // Vérifier que le transport existe et que l'utilisateur est autorisé
    const transport = await this.prisma.transport.findUnique({
      where: { id: transportId },
      include: {
        client: true,
        chauffeur: true,
      },
    });

    if (!transport) {
      throw new NotFoundException(
        `Transport avec l'ID ${transportId} non trouvé`
      );
    }

    // Vérifier que l'utilisateur est autorisé à voir ces messages
    if (userType === "CLIENT" && transport.clientId !== userId) {
      throw new BadRequestException(
        "Ce client n'est pas autorisé à voir ces messages"
      );
    }

    if (userType === "CHAUFFEUR" && transport.chauffeurId !== userId) {
      throw new BadRequestException(
        "Ce chauffeur n'est pas autorisé à voir ces messages"
      );
    }

    // Récupérer les messages
    const messages = await this.prisma.message.findMany({
      where: {
        transportId,
      },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoUrl: true,
          },
        },
        chauffeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      skip,
      take,
    });

    // Marquer comme lus les messages reçus par l'utilisateur
    const messagesToMarkAsRead = messages.filter(
      (msg) =>
        (userType === "CLIENT" &&
          msg.expediteurType === "CHAUFFEUR" &&
          !msg.lu) ||
        (userType === "CHAUFFEUR" && msg.expediteurType === "CLIENT" && !msg.lu)
    );

    if (messagesToMarkAsRead.length > 0) {
      await this.prisma.message.updateMany({
        where: {
          id: { in: messagesToMarkAsRead.map((m) => m.id) },
        },
        data: {
          lu: true,
        },
      });
    }

    return {
      messages,
      transport: {
        id: transport.id,
        adresseDepart: transport.adresseDepart,
        adresseDestination: transport.adresseDestination,
        status: transport.status,
        client: transport.client,
        chauffeur: transport.chauffeur,
      },
      pagination: {
        skip,
        take,
        total: messages.length,
      },
    };
  }

  /**
   * Obtenir le nombre de messages non lus pour un transport
   * @param transportId ID du transport
   * @param userId ID de l'utilisateur
   * @param userType Type d'utilisateur
   */
  async getTransportUnreadCount(
    transportId: number,
    userId: number,
    userType: "CLIENT" | "CHAUFFEUR"
  ) {
    // Vérifier que le transport existe et que l'utilisateur est autorisé
    const transport = await this.prisma.transport.findUnique({
      where: { id: transportId },
    });

    if (!transport) {
      throw new NotFoundException(
        `Transport avec l'ID ${transportId} non trouvé`
      );
    }

    // Vérifier que l'utilisateur est autorisé
    if (userType === "CLIENT" && transport.clientId !== userId) {
      throw new BadRequestException(
        "Ce client n'est pas autorisé à voir ces informations"
      );
    }

    if (userType === "CHAUFFEUR" && transport.chauffeurId !== userId) {
      throw new BadRequestException(
        "Ce chauffeur n'est pas autorisé à voir ces informations"
      );
    }

    // Compter les messages non lus envoyés par l'autre partie
    const unreadCount = await this.prisma.message.count({
      where: {
        transportId,
        lu: false,
        expediteurType: userType === "CLIENT" ? "CHAUFFEUR" : "CLIENT",
      },
    });

    return { count: unreadCount, transportId };
  }

  /**
   * Marquer tous les messages d'un transport comme lus pour un utilisateur
   * @param transportId ID du transport
   * @param userId ID de l'utilisateur
   * @param userType Type d'utilisateur (CLIENT ou CHAUFFEUR)
   */
  async markAllMessagesAsRead(
    transportId: number,
    userId: number,
    userType: "CLIENT" | "CHAUFFEUR"
  ) {
    // Vérifier que le transport existe et que l'utilisateur est autorisé
    const transport = await this.prisma.transport.findUnique({
      where: { id: transportId },
    });

    if (!transport) {
      throw new NotFoundException(
        `Transport avec l'ID ${transportId} non trouvé`
      );
    }

    // Vérifier que l'utilisateur est autorisé
    if (userType === "CLIENT" && transport.clientId !== userId) {
      throw new BadRequestException(
        "Ce client n'est pas autorisé à accéder à ce transport"
      );
    }

    if (userType === "CHAUFFEUR" && transport.chauffeurId !== userId) {
      throw new BadRequestException(
        "Ce chauffeur n'est pas autorisé à accéder à ce transport"
      );
    }

    // Marquer comme lus tous les messages non lus de l'autre partie
    await this.prisma.message.updateMany({
      where: {
        transportId,
        lu: false,
        expediteurType: userType === "CLIENT" ? "CHAUFFEUR" : "CLIENT",
      },
      data: {
        lu: true,
      },
    });

    return { success: true, message: "Messages marqués comme lus" };
  }

  /**
   * Obtenir le nombre total de messages non lus pour un utilisateur sur tous ses transports
   * @param userId ID de l'utilisateur
   * @param userType Type d'utilisateur (CLIENT ou CHAUFFEUR)
   */
  async getTotalUnreadMessagesCount(
    userId: number,
    userType: "CLIENT" | "CHAUFFEUR"
  ) {
    const whereCondition =
      userType === "CLIENT" ? { clientId: userId } : { chauffeurId: userId };

    const transports = await this.prisma.transport.findMany({
      where: whereCondition,
      select: { id: true },
    });

    const transportIds = transports.map((t) => t.id);

    const unreadCount = await this.prisma.message.count({
      where: {
        transportId: { in: transportIds },
        lu: false,
        expediteurType: userType === "CLIENT" ? "CHAUFFEUR" : "CLIENT",
      },
    });

    return { count: unreadCount };
  }

  /**
   * Obtenir les conversations de transport avec le nombre de messages non lus
   * @param userId ID de l'utilisateur
   * @param userType Type d'utilisateur (CLIENT ou CHAUFFEUR)
   */
  async getTransportConversations(
    userId: number,
    userType: "CLIENT" | "CHAUFFEUR"
  ) {
    const whereCondition =
      userType === "CLIENT" ? { clientId: userId } : { chauffeurId: userId };

    const transports = await this.prisma.transport.findMany({
      where: whereCondition,
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        chauffeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
        messages: {
          select: {
            id: true,
            contenu: true,
            expediteurType: true,
            createdAt: true,
            updatedAt: true,
            lu: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                lu: false,
                expediteurType: userType === "CLIENT" ? "CHAUFFEUR" : "CLIENT",
              },
            },
          },
        },
      },
    });

    // ✨ Tri par activité la plus récente (création ou modification de message)
    const sortedTransports = transports.sort((a, b) => {
      const getLastActivity = (transport) => {
        if (!transport.messages[0]) {
          // Pas de message, on utilise la date de création du transport
          return new Date(transport.createdAt);
        }

        const msg = transport.messages[0];
        // On prend la plus récente entre création et modification du message
        return new Date(
          Math.max(new Date(msg.createdAt).getTime(), new Date(msg.updatedAt).getTime())
        );
      };

      return getLastActivity(b).getTime() - getLastActivity(a).getTime();
    });

    // ✨ Mapping amélioré avec gestion des cas edge
    return sortedTransports.map((transport) => ({
      id: transport.id,
      adresseDepart: transport.adresseDepart,
      adresseDestination: transport.adresseDestination,
      status: transport.status,
      dateReservation: transport.dateReservation,
      client: transport.client,
      chauffeur: transport.chauffeur,
      lastMessage: transport.messages[0] || null,
      unreadCount: transport._count.messages,
      // ✨ Informations utiles supplémentaires
      hasMessages: transport.messages.length > 0,
      lastActivity: transport.messages[0]
        ? new Date(
            Math.max(
              new Date(transport.messages[0].createdAt).getTime(),
              new Date(transport.messages[0].updatedAt).getTime()
            )
          )
        : new Date(transport.createdAt),
    }));
  }

  /**
   * Envoyer un message rapide prédéfini
   * @param transportId ID du transport
   * @param expediteurType Type d'expéditeur
   * @param expediteurId ID de l'expéditeur
   * @param messageType Type de message rapide
   */
  async sendQuickMessage(
    transportId: number,
    expediteurType: "CLIENT" | "CHAUFFEUR",
    expediteurId: number,
    messageType: "ARRIVED" | "DELAYED" | "STARTED" | "FINISHED"
  ) {
    const quickMessages = {
      ARRIVED:
        expediteurType === "CHAUFFEUR"
          ? "Je suis arrivé au point de ramassage"
          : "Je suis prêt pour le départ",
      DELAYED:
        expediteurType === "CHAUFFEUR"
          ? "Je vais être en retard de quelques minutes"
          : "Je vais être en retard",
      STARTED:
        expediteurType === "CHAUFFEUR"
          ? "Nous démarrons le transport"
          : "Nous pouvons partir",
      FINISHED:
        expediteurType === "CHAUFFEUR"
          ? "Transport terminé, merci !"
          : "Merci pour le transport !",
    };

    const contenu = quickMessages[messageType];

    return this.createTransportMessage(
      transportId,
      contenu,
      expediteurType,
      expediteurId
    );
  }

  /**
   * Confirmer le paiement en espèces pour un transport
   * @param transportId ID du transport
   * @param chauffeurId ID du chauffeur qui confirme le paiement
   * @param montantRecu Montant reçu en espèces
   */
  async confirmCashPayment(
    transportId: number,
    chauffeurId: number,
    montantRecu: number
  ) {
    const transport = await this.prisma.transport.findUnique({
      where: { id: transportId },
      include: {
        client: true,
        chauffeur: true,
        course: true,
      },
    });

    if (!transport) {
      throw new NotFoundException(
        `Transport avec l'ID ${transportId} non trouvé`
      );
    }

    // Vérifier que le transport est terminé
    if (transport.status !== StatutTransport.TERMINE) {
      throw new BadRequestException(
        "Le transport doit être terminé pour confirmer le paiement"
      );
    }

    // Vérifier que c'est bien un paiement CASH
    const paymentMethod =
      transport.course?.paymentMethod?.toUpperCase() as PaymentMethod;
    if (paymentMethod !== PaymentMethod.CASH) {
      throw new BadRequestException(
        "Cette méthode est uniquement pour les paiements en espèces"
      );
    }

    // Vérifier que c'est bien le chauffeur du transport
    if (transport.chauffeurId !== chauffeurId) {
      throw new BadRequestException(
        "Seul le chauffeur du transport peut confirmer le paiement"
      );
    }

    // Mettre à jour le transport avec les informations de paiement
    const updatedTransport = await this.prisma.transport.update({
      where: { id: transportId },
      data: {
        montantFinal: montantRecu,
        // TODO: Ajouter des champs pour le statut de paiement CASH
      },
    });

    // Mettre à jour la course
    await this.prisma.course.update({
      where: { id: transport.course.id },
      data: {
        finalPrice: montantRecu,
        status: "TERMINEE",
      },
    });

    // Créer des notifications
    await this.notificationsService.createSystemNotification(
      null,
      transport.clientId,
      chauffeurId,
      "Paiement en espèces confirmé",
      `Le chauffeur a confirmé avoir reçu ${montantRecu}€ en espèces`
    );

    return {
      transport: updatedTransport,
      paymentMethod: PaymentMethod.CASH,
      montantRecu,
      message: "Paiement en espèces confirmé avec succès",
    };
  }

  private logger = new Logger("TransportsService");
}
