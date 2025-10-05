"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_service_1 = require("../stripe/stripe.service");
const notifications_service_1 = require("../notifications/notifications.service");
const promo_codes_service_1 = require("../promo-codes/promo-codes.service");
const config_1 = require("@nestjs/config");
const create_transport_dto_1 = require("./dto/create-transport.dto");
const client_1 = require("@prisma/client");
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const transport_gateway_1 = require("./transport.gateway");
const position_tracking_service_1 = require("./position-tracking.service");
let TransportsService = class TransportsService {
    constructor(prisma, stripeService, notificationsService, promoCodesService, configService, transportGateway, positionTrackingService) {
        this.prisma = prisma;
        this.stripeService = stripeService;
        this.notificationsService = notificationsService;
        this.promoCodesService = promoCodesService;
        this.configService = configService;
        this.transportGateway = transportGateway;
        this.positionTrackingService = positionTrackingService;
        this.logger = new common_1.Logger("TransportsService");
        this.googleMapsClient = new google_maps_services_js_1.Client({});
    }
    async findAll(params) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Transport avec l'ID ${id} non trouvé`);
        }
        return transport;
    }
    async create(createTransportDto) {
        const { promoCode, ...transportData } = createTransportDto;
        const client = await this.prisma.client.findUnique({
            where: { id: createTransportDto.clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'ID ${createTransportDto.clientId} non trouvé`);
        }
        const paymentMethod = createTransportDto.paymentMethod || create_transport_dto_1.PaymentMethod.STRIPE;
        if (paymentMethod === create_transport_dto_1.PaymentMethod.STRIPE && !client.stripeCustomerId) {
            const stripeCustomer = await this.stripeService.createCustomer(`${client.prenom} ${client.nom}`, client.email);
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
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${createTransportDto.vehiculeId} non trouvé`);
        }
        if (vehicule.statut !== "DISPONIBLE") {
            throw new common_1.BadRequestException("Le véhicule n'est pas disponible");
        }
        if (!vehicule.chauffeurs || vehicule.chauffeurs.length === 0) {
            throw new common_1.BadRequestException("Aucun chauffeur actif assigné à ce véhicule");
        }
        const chauffeur = vehicule.chauffeurs[0];
        const { distance: distanceEstimee, duration: dureeEstimee } = await this.calculerDistanceEtDuree({
            lat: createTransportDto.departLatitude,
            lng: createTransportDto.departLongitude,
        }, {
            lat: createTransportDto.destinationLatitude,
            lng: createTransportDto.destinationLongitude,
        });
        const montantEstime = this.calculerMontantEstime(distanceEstimee, dureeEstimee, vehicule.tarifHoraire);
        let montantReduction = 0;
        let promoCodeRecord = null;
        if (promoCode) {
            try {
                promoCodeRecord = await this.promoCodesService.validateAndGetCode(promoCode, montantEstime);
                montantReduction = this.promoCodesService.calculateDiscount(promoCodeRecord, montantEstime);
            }
            catch (error) {
                throw new common_1.BadRequestException(error.message);
            }
        }
        const transport = await this.prisma.transport.create({
            data: {
                clientId: createTransportDto.clientId,
                vehiculeId: createTransportDto.vehiculeId,
                chauffeurId: chauffeur.id,
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
                cashPaymentStatus: createTransportDto.paymentMethod === "CASH" ? "PENDING" : null,
            },
        });
        await this.prisma.vehicule.update({
            where: { id: vehicule.id },
            data: { statut: "ASSIGNE" },
        });
        if (paymentMethod === create_transport_dto_1.PaymentMethod.STRIPE) {
            const baseUrl = this.configService.get("BASE_URL") || "mema://";
            const successUrl = `${baseUrl}(protected)/payment/SuccessPayment`;
            const cancelUrl = `${baseUrl}(protected)/payment/FailedPayment`;
            const setupSession = await this.stripeService.createSetupSession(client.stripeCustomerId, successUrl, cancelUrl, { transportId: transport.id.toString() });
            console.log("successUrl", successUrl);
            console.log("cancelUrl", cancelUrl);
            return {
                transport,
                paymentMethod,
                setupUrl: setupSession.url,
                sessionId: setupSession.id,
            };
        }
        else {
            await this.notificationsService.createSystemNotification(null, transport.clientId, null, "Transport créé avec paiement en espèces", "Votre demande de transport a été créée. Le paiement se fera en espèces à la fin du trajet.");
            return {
                transport,
                paymentMethod,
                message: "Transport créé avec succès. Paiement en espèces à la fin du trajet.",
            };
        }
    }
    async calculerDistanceEtDuree(depart, destination) {
        const apiKey = this.configService.get("GOOGLE_MAPS_API_KEY");
        if (!apiKey) {
            throw new Error("Clé API Google Maps non définie");
        }
        try {
            const response = await this.googleMapsClient.directions({
                params: {
                    origin: `${depart.lat},${depart.lng}`,
                    destination: `${destination.lat},${destination.lng}`,
                    mode: google_maps_services_js_1.TravelMode.driving,
                    key: apiKey,
                },
                timeout: 10000,
            });
            const routes = response.data.routes;
            if (!routes ||
                routes.length === 0 ||
                !routes[0].legs ||
                routes[0].legs.length === 0) {
                throw new Error("Aucun itinéraire trouvé");
            }
            const route = routes[0].legs[0];
            return {
                distance: route.distance.value / 1000,
                duration: Math.ceil(route.duration.value / 60),
            };
        }
        catch (error) {
            console.error("Erreur Google Maps API:", error);
            throw new common_1.BadRequestException("Impossible de calculer l'itinéraire");
        }
    }
    calculerMontantEstime(distance, duree, tarifHoraire) {
        const prixBase = 10;
        const prixKm = 2;
        const prixMinute = tarifHoraire / 60;
        return prixBase + distance * prixKm + duree * prixMinute;
    }
    calculerMontantFinal(transport) {
        if (!transport.heureDepart || !transport.heureArrivee) {
            const montantBrut = transport.montantEstime;
            const montantReduction = transport.montantReduction || 0;
            return Math.max(0, montantBrut - montantReduction);
        }
        const tarifHoraire = transport.tarifHoraireApplique || transport.vehicule.tarifHoraire;
        if (!tarifHoraire) {
            throw new Error("Aucun tarif horaire défini pour ce véhicule");
        }
        const dureeMs = transport.heureArrivee.getTime() - transport.heureDepart.getTime();
        const dureeHeures = dureeMs / (1000 * 60 * 60);
        let montantBrut;
        if (dureeHeures <= 1) {
            montantBrut = tarifHoraire;
        }
        else {
            montantBrut = tarifHoraire * dureeHeures;
        }
        const montantReduction = transport.montantReduction || 0;
        const montantFinal = Math.max(0, montantBrut - montantReduction);
        return Math.round(montantFinal * 100) / 100;
    }
    async validatePromoCode(code, montantCourse) {
        return this.promoCodesService.validatePromoCode(code, montantCourse);
    }
    async validerTransport(id, chauffeurId) {
        const transport = await this.prisma.transport.findUnique({
            where: { id },
            include: {
                client: true,
                vehicule: true,
                course: true,
            },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${id} non trouvé`);
        }
        const paymentMethod = transport.paymentMethod?.toUpperCase() ||
            create_transport_dto_1.PaymentMethod.STRIPE;
        if (paymentMethod === create_transport_dto_1.PaymentMethod.STRIPE) {
            const paymentIntent = await this.stripeService.retrievePaymentIntent(transport.stripePaymentIntentId);
            if (!paymentIntent) {
                throw new common_1.BadRequestException("Aucune intention de paiement n'est associée à ce transport");
            }
        }
        else if (paymentMethod === create_transport_dto_1.PaymentMethod.CASH) {
            console.log("Transport avec paiement en espèces - validation directe");
        }
        const updatedTransport = await this.prisma.transport.update({
            where: { id },
            data: {
                chauffeurId,
                status: client_1.StatutTransport.VALIDE,
            },
        });
        const paymentInfo = paymentMethod === create_transport_dto_1.PaymentMethod.CASH
            ? "Le paiement se fera en espèces à la fin du trajet."
            : "";
        await this.notificationsService.createSystemNotification(null, transport.clientId, null, "Transport validé", `Votre demande de transport a été validée par un chauffeur. ${paymentInfo}`);
        return updatedTransport;
    }
    async updatePosition(id, latitude, longitude, statusInfo) {
        const transport = await this.prisma.transport.findUnique({
            where: { id },
            include: {
                chauffeur: true,
                client: true,
            },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${id} non trouvé`);
        }
        if (!transport.chauffeurId) {
            throw new common_1.BadRequestException("Aucun chauffeur assigné à ce transport");
        }
        const position = { lat: latitude, lng: longitude };
        const timestamp = new Date();
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
        const positionUpdateEvent = {
            transportId: id,
            chauffeurId: transport.chauffeurId,
            position: position,
            timestamp: timestamp,
            statusInfo: statusInfo,
        };
        await this.transportGateway.emitPositionUpdate(id, positionUpdateEvent);
        if (transport.status === "EN_ROUTE_RAMASSAGE" ||
            transport.status === "EN_COURSE") {
            await this.calculateAndEmitETA(id, position, transport);
        }
        await this.positionTrackingService.detectRouteDeviation(id, position);
        await this.notificationsService.createSystemNotification(null, transport.clientId, transport.chauffeurId, "Position mise à jour", statusInfo ||
            `Le chauffeur ${transport.chauffeur?.prenom} ${transport.chauffeur?.nom} a mis à jour sa position`);
        return {
            transport: updatedTransport,
            position: position,
            timestamp: timestamp,
            message: "Position mise à jour avec succès",
        };
    }
    async updateStatus(id, newStatus) {
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
            throw new common_1.NotFoundException(`Transport avec l'ID ${id} non trouvé`);
        }
        await this.validateStatusTransition(transport.status, newStatus, transport);
        const courseStatus = {
            EN_ATTENTE: "EN_ATTENTE",
            VALIDE: "EN_ATTENTE",
            EN_ROUTE_RAMASSAGE: "EN_COURS",
            ARRIVE_RAMASSAGE: "EN_COURS",
            EN_COURSE: "EN_COURS",
            TERMINE: "TERMINEE",
            ANNULE: "ANNULEE",
        }[newStatus];
        switch (newStatus) {
            case client_1.StatutTransport.EN_ROUTE_RAMASSAGE:
                if (!transport.chauffeurId) {
                    throw new common_1.BadRequestException("Le transport doit avoir un chauffeur assigné");
                }
                break;
            case client_1.StatutTransport.EN_COURSE:
                if (transport.status !== client_1.StatutTransport.ARRIVE_RAMASSAGE) {
                    throw new common_1.BadRequestException("Le chauffeur doit d'abord être arrivé au point de ramassage");
                }
                break;
            case client_1.StatutTransport.TERMINE:
                await this.handleTransportCompletion(transport);
                break;
        }
        const updateData = {
            status: newStatus,
        };
        if (newStatus === client_1.StatutTransport.EN_COURSE) {
            const now = new Date();
            updateData.heureDepart = now;
            updateData.course.update.startTime = now;
        }
        else if (newStatus === client_1.StatutTransport.TERMINE) {
            const now = new Date();
            updateData.heureArrivee = now;
            updateData.course.update.endTime = now;
        }
        const updatedTransport = await this.prisma.transport.update({
            where: { id },
            data: updateData,
        });
        await this.notificationsService.createSystemNotification(null, transport.clientId, transport.chauffeurId, "Statut du transport mis à jour", `Le statut de votre transport est maintenant : ${newStatus}`);
        return updatedTransport;
    }
    async validateStatusTransition(currentStatus, newStatus, transport) {
        const validTransitions = {
            [client_1.StatutTransport.EN_ATTENTE]: [
                client_1.StatutTransport.VALIDE,
                client_1.StatutTransport.ANNULE,
            ],
            [client_1.StatutTransport.VALIDE]: [
                client_1.StatutTransport.EN_ROUTE_RAMASSAGE,
                client_1.StatutTransport.ANNULE,
            ],
            [client_1.StatutTransport.EN_ROUTE_RAMASSAGE]: [
                client_1.StatutTransport.ARRIVE_RAMASSAGE,
                client_1.StatutTransport.ANNULE,
            ],
            [client_1.StatutTransport.ARRIVE_RAMASSAGE]: [
                client_1.StatutTransport.EN_COURSE,
                client_1.StatutTransport.ANNULE,
            ],
            [client_1.StatutTransport.EN_COURSE]: [
                client_1.StatutTransport.TERMINE,
                client_1.StatutTransport.ANNULE,
            ],
            [client_1.StatutTransport.TERMINE]: [],
            [client_1.StatutTransport.ANNULE]: [],
        };
        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new common_1.BadRequestException(`Impossible de passer du statut ${currentStatus} à ${newStatus}`);
        }
    }
    async handleTransportCompletion(transport) {
        const paymentMethod = transport.course?.paymentMethod?.toUpperCase() ||
            create_transport_dto_1.PaymentMethod.STRIPE;
        if (paymentMethod === create_transport_dto_1.PaymentMethod.STRIPE) {
            const paymentIntent = await this.stripeService.retrievePaymentIntent(transport.stripePaymentIntentId);
            console.log("Payment Intent Status:", paymentIntent);
            switch (paymentIntent.status) {
                case "requires_capture":
                    await this.stripeService.capturePaymentIntent(transport.stripePaymentIntentId);
                    break;
                case "requires_payment_method":
                    throw new common_1.BadRequestException("Le client n'a pas encore fourni de moyen de paiement. Impossible de terminer le transport.");
                case "requires_confirmation":
                    throw new common_1.BadRequestException("Le paiement nécessite une confirmation du client avant de pouvoir terminer le transport.");
                case "succeeded":
                    break;
                default:
                    throw new common_1.BadRequestException(`Le paiement ne peut pas être capturé dans son état actuel (${paymentIntent.status})`);
            }
        }
        else if (paymentMethod === create_transport_dto_1.PaymentMethod.CASH) {
            console.log("Transport avec paiement en espèces - pas de traitement de paiement électronique");
            await this.notificationsService.createSystemNotification(null, transport.clientId, transport.chauffeurId, "Paiement en espèces", `Montant à payer en espèces: ${transport.montantFinal || transport.montantEstime}€`);
        }
        await this.prisma.vehicule.update({
            where: { id: transport.vehiculeId },
            data: { statut: "DISPONIBLE" },
        });
    }
    async checkPaymentStatus(paymentIntentId) {
        const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
        return paymentIntent.status;
    }
    async evaluerTransport(id, evaluation, commentaire) {
        const transport = await this.prisma.transport.findUnique({
            where: { id },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${id} non trouvé`);
        }
        if (transport.status !== "TERMINE") {
            throw new common_1.BadRequestException("Le transport doit être terminé pour pouvoir être évalué");
        }
        return this.prisma.transport.update({
            where: { id },
            data: {
                evaluation,
                commentaire,
            },
        });
    }
    async confirmPayment(id) {
        const transport = await this.prisma.transport.findUnique({
            where: { id },
            include: {
                client: true,
            },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${id} non trouvé`);
        }
        if (transport.status !== "EN_ATTENTE") {
            throw new common_1.BadRequestException("Le transport n'est plus en attente de paiement");
        }
        const paymentIntent = await this.stripeService.retrievePaymentIntent(transport.stripePaymentIntentId);
        if (paymentIntent.status === "requires_payment_method") {
            throw new common_1.BadRequestException("Le paiement n'a pas encore été initié");
        }
        if (paymentIntent.status === "requires_capture") {
            await this.prisma.transport.update({
                where: { id },
                data: {
                    status: "VALIDE",
                },
            });
            await this.notificationsService.createSystemNotification(null, transport.clientId, null, "Paiement confirmé", "Votre paiement a été confirmé. Un chauffeur peut maintenant accepter votre demande de transport.");
            return {
                message: "Paiement confirmé avec succès",
                status: "VALIDE",
            };
        }
        throw new common_1.BadRequestException(`Le paiement est dans un état inattendu : ${paymentIntent.status}`);
    }
    async finalizeTransportAfterPaymentSetup(transportId, sessionId) {
        const transport = await this.prisma.transport.findUnique({
            where: { id: transportId },
            include: { client: true },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${transportId} non trouvé`);
        }
        const session = await this.stripeService.retrieveCheckoutSession(sessionId);
        if (session.status !== "complete") {
            throw new common_1.BadRequestException("La configuration du moyen de paiement n'est pas encore terminée");
        }
        const setupIntent = await this.stripeService.retrieveSetupIntent(session.setup_intent);
        if (!setupIntent.payment_method) {
            throw new common_1.BadRequestException("Aucun moyen de paiement n'a été configuré");
        }
        const paymentMethodId = typeof setupIntent.payment_method === "string"
            ? setupIntent.payment_method
            : setupIntent.payment_method.id;
        try {
            const paymentIntent = await this.stripeService.createPaymentIntent(Math.round(transport.montantEstime * 100), "eur", transport.client.stripeCustomerId, { transportId: transport.id.toString() });
            await this.stripeService.updatePaymentIntent(paymentIntent.id, {
                payment_method: paymentMethodId,
            });
            await this.stripeService.confirmPaymentIntent(paymentIntent.id, paymentMethodId);
            const updatedTransport = await this.prisma.transport.update({
                where: { id: transportId },
                data: {
                    stripePaymentIntentId: paymentIntent.id,
                    status: client_1.StatutTransport.EN_ATTENTE,
                },
            });
            await this.notificationsService.createSystemNotification(null, transport.clientId, null, "Moyen de paiement configuré", "Votre moyen de paiement a été configuré avec succès. Votre transport est maintenant en attente.");
            return {
                transport: updatedTransport,
                paymentStatus: paymentIntent.status,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Erreur lors de la configuration du paiement : ${error.message}`);
        }
    }
    async startTransport(id) {
        const transport = await this.prisma.transport.findUnique({
            where: { id },
            include: { vehicule: true },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${id} non trouvé`);
        }
        const updatedTransport = await this.prisma.transport.update({
            where: { id },
            data: {
                heureDepart: new Date(),
                tarifHoraireApplique: transport.vehicule.tarifHoraire,
                status: client_1.StatutTransport.EN_COURSE,
            },
        });
        await this.startAutomaticTracking(id);
        await this.notificationsService.createSystemNotification(null, transport.clientId, transport.chauffeurId, "Transport démarré", "Votre transport a commencé. Vous pouvez maintenant suivre votre chauffeur en temps réel.");
        return updatedTransport;
    }
    async endTransport(id) {
        const transport = await this.prisma.transport.findUnique({
            where: { id },
            include: {
                vehicule: true,
            },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${id} non trouvé`);
        }
        const heureArrivee = new Date();
        const dureeMs = heureArrivee.getTime() - (transport.heureDepart?.getTime() || 0);
        const dureeMinutes = Math.round(dureeMs / (1000 * 60));
        const updatedTransport = await this.prisma.transport.update({
            where: { id },
            data: {
                heureArrivee,
                dureeReelle: dureeMinutes,
                status: client_1.StatutTransport.TERMINE,
            },
            include: { vehicule: true },
        });
        const montantFinal = this.calculerMontantFinal(updatedTransport);
        await this.stopAutomaticTracking(id);
        await this.notificationsService.createSystemNotification(null, transport.clientId, transport.chauffeurId, "Transport terminé", `Votre transport est terminé. Durée: ${dureeMinutes} minutes. Montant final: ${montantFinal}€`);
        await this.prisma.vehicule.update({
            where: { id: transport.vehiculeId },
            data: { statut: "DISPONIBLE" },
        });
        const transportAny = transport;
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
    async getCurrentPosition(id) {
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
            throw new common_1.NotFoundException(`Transport avec l'ID ${id} non trouvé`);
        }
        return {
            transportId: id,
            position: transport.positionActuelle,
            status: transport.status,
            chauffeur: transport.chauffeur,
            lastUpdate: transport.updatedAt,
        };
    }
    async trackTransportRealTime(id, chauffeurId) {
        const transport = await this.prisma.transport.findUnique({
            where: { id },
            include: {
                chauffeur: true,
                client: true,
            },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${id} non trouvé`);
        }
        if (transport.chauffeurId !== chauffeurId) {
            throw new common_1.BadRequestException("Vous n'êtes pas autorisé à suivre ce transport");
        }
        await this.transportGateway.startRealTimeTracking(id);
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
    async calculateAndEmitETA(transportId, currentPosition, transport) {
        try {
            let destination;
            if (transport.status === "EN_ROUTE_RAMASSAGE") {
                destination = {
                    lat: transport.departLatitude,
                    lng: transport.departLongitude,
                };
            }
            else if (transport.status === "EN_COURSE") {
                destination = {
                    lat: transport.destinationLatitude,
                    lng: transport.destinationLongitude,
                };
            }
            else {
                return;
            }
            const route = await this.calculerDistanceEtDuree(currentPosition, destination);
            const estimatedArrival = new Date();
            estimatedArrival.setMinutes(estimatedArrival.getMinutes() + route.duration);
            const etaData = {
                estimatedArrival,
                distanceRemaining: route.distance,
                durationRemaining: route.duration,
            };
            await this.transportGateway.emitETAUpdate(transportId, etaData);
            this.logger.log(`ETA calculé pour le transport ${transportId}:`, etaData);
        }
        catch (error) {
            this.logger.error(`Erreur lors du calcul de l'ETA pour le transport ${transportId}:`, error.message);
        }
    }
    async startAutomaticTracking(transportId) {
        await this.transportGateway.startRealTimeTracking(transportId);
        await this.positionTrackingService.startAutoTracking(transportId, 30000);
        await this.transportGateway.notifyTransportParticipants(transportId, "Le suivi automatique a été activé pour ce transport");
        return {
            message: "Suivi automatique démarré",
            transportId,
            interval: 30000,
            timestamp: new Date(),
        };
    }
    async stopAutomaticTracking(transportId) {
        await this.transportGateway.stopRealTimeTracking(transportId);
        this.positionTrackingService.stopAutoTracking(transportId);
        await this.transportGateway.notifyTransportParticipants(transportId, "Le suivi automatique a été désactivé pour ce transport");
        return {
            message: "Suivi automatique arrêté",
            transportId,
            timestamp: new Date(),
        };
    }
    async getPositionHistory(transportId, limit = 50) {
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
            throw new common_1.NotFoundException(`Transport avec l'ID ${transportId} non trouvé`);
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
            message: "Historique des positions récupéré (position actuelle uniquement)",
        };
    }
    async getTrackingStatistics() {
        const trackingStats = this.positionTrackingService.getTrackingStats();
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
    async cleanup() {
        this.positionTrackingService.cleanup();
        this.logger.log("Services de suivi nettoyés");
    }
    async createTransportMessage(transportId, contenu, expediteurType, expediteurId) {
        const transport = await this.prisma.transport.findUnique({
            where: { id: transportId },
            include: {
                client: true,
                chauffeur: true,
            },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${transportId} non trouvé`);
        }
        if (expediteurType === "CLIENT" && transport.clientId !== expediteurId) {
            throw new common_1.BadRequestException("Ce client n'est pas associé à ce transport");
        }
        if (expediteurType === "CHAUFFEUR" &&
            transport.chauffeurId !== expediteurId) {
            throw new common_1.BadRequestException("Ce chauffeur n'est pas associé à ce transport");
        }
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
        const destinataireId = expediteurType === "CLIENT" ? transport.chauffeurId : transport.clientId;
        const expediteurNom = expediteurType === "CLIENT"
            ? `${transport.client.prenom} ${transport.client.nom}`
            : `${transport.chauffeur?.prenom} ${transport.chauffeur?.nom}`;
        if (destinataireId) {
            await this.notificationsService.createSystemNotification(expediteurType === "CLIENT" ? null : destinataireId, expediteurType === "CLIENT" ? destinataireId : null, expediteurType === "CHAUFFEUR" ? expediteurId : null, `Nouveau message de ${expediteurNom}`, contenu.length > 50 ? `${contenu.substring(0, 50)}...` : contenu);
        }
        return message;
    }
    async getTransportMessages(transportId, userId, userType, skip = 0, take = 50) {
        const transport = await this.prisma.transport.findUnique({
            where: { id: transportId },
            include: {
                client: true,
                chauffeur: true,
            },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${transportId} non trouvé`);
        }
        if (userType === "CLIENT" && transport.clientId !== userId) {
            throw new common_1.BadRequestException("Ce client n'est pas autorisé à voir ces messages");
        }
        if (userType === "CHAUFFEUR" && transport.chauffeurId !== userId) {
            throw new common_1.BadRequestException("Ce chauffeur n'est pas autorisé à voir ces messages");
        }
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
        const messagesToMarkAsRead = messages.filter((msg) => (userType === "CLIENT" &&
            msg.expediteurType === "CHAUFFEUR" &&
            !msg.lu) ||
            (userType === "CHAUFFEUR" && msg.expediteurType === "CLIENT" && !msg.lu));
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
    async getTransportUnreadCount(transportId, userId, userType) {
        const transport = await this.prisma.transport.findUnique({
            where: { id: transportId },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${transportId} non trouvé`);
        }
        if (userType === "CLIENT" && transport.clientId !== userId) {
            throw new common_1.BadRequestException("Ce client n'est pas autorisé à voir ces informations");
        }
        if (userType === "CHAUFFEUR" && transport.chauffeurId !== userId) {
            throw new common_1.BadRequestException("Ce chauffeur n'est pas autorisé à voir ces informations");
        }
        const unreadCount = await this.prisma.message.count({
            where: {
                transportId,
                lu: false,
                expediteurType: userType === "CLIENT" ? "CHAUFFEUR" : "CLIENT",
            },
        });
        return { count: unreadCount, transportId };
    }
    async markAllMessagesAsRead(transportId, userId, userType) {
        const transport = await this.prisma.transport.findUnique({
            where: { id: transportId },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${transportId} non trouvé`);
        }
        if (userType === "CLIENT" && transport.clientId !== userId) {
            throw new common_1.BadRequestException("Ce client n'est pas autorisé à accéder à ce transport");
        }
        if (userType === "CHAUFFEUR" && transport.chauffeurId !== userId) {
            throw new common_1.BadRequestException("Ce chauffeur n'est pas autorisé à accéder à ce transport");
        }
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
    async getTotalUnreadMessagesCount(userId, userType) {
        const whereCondition = userType === "CLIENT" ? { clientId: userId } : { chauffeurId: userId };
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
    async getTransportConversations(userId, userType) {
        const whereCondition = userType === "CLIENT" ? { clientId: userId } : { chauffeurId: userId };
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
        const sortedTransports = transports.sort((a, b) => {
            const getLastActivity = (transport) => {
                if (!transport.messages[0]) {
                    return new Date(transport.createdAt);
                }
                const msg = transport.messages[0];
                return new Date(Math.max(new Date(msg.createdAt).getTime(), new Date(msg.updatedAt).getTime()));
            };
            return getLastActivity(b).getTime() - getLastActivity(a).getTime();
        });
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
            hasMessages: transport.messages.length > 0,
            lastActivity: transport.messages[0]
                ? new Date(Math.max(new Date(transport.messages[0].createdAt).getTime(), new Date(transport.messages[0].updatedAt).getTime()))
                : new Date(transport.createdAt),
        }));
    }
    async sendQuickMessage(transportId, expediteurType, expediteurId, messageType) {
        const quickMessages = {
            ARRIVED: expediteurType === "CHAUFFEUR"
                ? "Je suis arrivé au point de ramassage"
                : "Je suis prêt pour le départ",
            DELAYED: expediteurType === "CHAUFFEUR"
                ? "Je vais être en retard de quelques minutes"
                : "Je vais être en retard",
            STARTED: expediteurType === "CHAUFFEUR"
                ? "Nous démarrons le transport"
                : "Nous pouvons partir",
            FINISHED: expediteurType === "CHAUFFEUR"
                ? "Transport terminé, merci !"
                : "Merci pour le transport !",
        };
        const contenu = quickMessages[messageType];
        return this.createTransportMessage(transportId, contenu, expediteurType, expediteurId);
    }
    async confirmCashPayment(transportId, chauffeurId, montantRecu) {
        const transport = await this.prisma.transport.findUnique({
            where: { id: transportId },
            include: {
                client: true,
                chauffeur: true,
                course: true,
            },
        });
        if (!transport) {
            throw new common_1.NotFoundException(`Transport avec l'ID ${transportId} non trouvé`);
        }
        if (transport.status !== client_1.StatutTransport.TERMINE) {
            throw new common_1.BadRequestException("Le transport doit être terminé pour confirmer le paiement");
        }
        const paymentMethod = transport.course?.paymentMethod?.toUpperCase();
        if (paymentMethod !== create_transport_dto_1.PaymentMethod.CASH) {
            throw new common_1.BadRequestException("Cette méthode est uniquement pour les paiements en espèces");
        }
        if (transport.chauffeurId !== chauffeurId) {
            throw new common_1.BadRequestException("Seul le chauffeur du transport peut confirmer le paiement");
        }
        const updatedTransport = await this.prisma.transport.update({
            where: { id: transportId },
            data: {
                montantFinal: montantRecu,
            },
        });
        await this.prisma.course.update({
            where: { id: transport.course.id },
            data: {
                finalPrice: montantRecu,
                status: "TERMINEE",
            },
        });
        await this.notificationsService.createSystemNotification(null, transport.clientId, chauffeurId, "Paiement en espèces confirmé", `Le chauffeur a confirmé avoir reçu ${montantRecu}€ en espèces`);
        return {
            transport: updatedTransport,
            paymentMethod: create_transport_dto_1.PaymentMethod.CASH,
            montantRecu,
            message: "Paiement en espèces confirmé avec succès",
        };
    }
};
exports.TransportsService = TransportsService;
exports.TransportsService = TransportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => transport_gateway_1.TransportGateway))),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => position_tracking_service_1.PositionTrackingService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService,
        notifications_service_1.NotificationsService,
        promo_codes_service_1.PromoCodesService,
        config_1.ConfigService,
        transport_gateway_1.TransportGateway,
        position_tracking_service_1.PositionTrackingService])
], TransportsService);
//# sourceMappingURL=transports.service.js.map