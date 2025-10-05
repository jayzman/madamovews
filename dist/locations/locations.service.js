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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_service_1 = require("../stripe/stripe.service");
const config_1 = require("@nestjs/config");
const notifications_service_1 = require("../notifications/notifications.service");
let LocationsService = class LocationsService {
    constructor(prisma, stripeService, configService, notificationsService) {
        this.prisma = prisma;
        this.stripeService = stripeService;
        this.configService = configService;
        this.notificationsService = notificationsService;
    }
    async create(createLocationDto) {
        const client = await this.prisma.client.findUnique({
            where: { id: createLocationDto.clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'ID ${createLocationDto.clientId} non trouvé`);
        }
        const vehicule = await this.prisma.vehicule.findUnique({
            where: { id: createLocationDto.vehiculeId },
        });
        if (!vehicule) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${createLocationDto.vehiculeId} non trouvé`);
        }
        if (vehicule.statut !== "DISPONIBLE") {
            throw new common_1.BadRequestException(`Le véhicule n'est pas disponible pour la location`);
        }
        const dateDebut = new Date(createLocationDto.dateDebut);
        const dateFin = new Date(createLocationDto.dateFin);
        if (dateDebut >= dateFin) {
            throw new common_1.BadRequestException("La date de fin doit être postérieure à la date de début");
        }
        const locationExistante = await this.prisma.locationVehicule.findFirst({
            where: {
                vehiculeId: createLocationDto.vehiculeId,
                status: { in: ["RESERVATION", "CONFIRMEE", "EN_COURS"] },
                OR: [
                    {
                        AND: [
                            { dateDebut: { lte: dateDebut } },
                            { dateFin: { gte: dateDebut } },
                        ],
                    },
                    {
                        AND: [
                            { dateDebut: { lte: dateFin } },
                            { dateFin: { gte: dateFin } },
                        ],
                    },
                    {
                        AND: [
                            { dateDebut: { gte: dateDebut } },
                            { dateFin: { lte: dateFin } },
                        ],
                    },
                ],
            },
        });
        if (locationExistante) {
            throw new common_1.BadRequestException("Le véhicule est déjà réservé pour cette période");
        }
        let stripeCustomerId = client.stripeCustomerId;
        try {
            if (!stripeCustomerId) {
                const stripeCustomer = await this.stripeService.createCustomer(`${client.prenom} ${client.nom}`, client.email);
                stripeCustomerId = stripeCustomer.id;
                await this.prisma.client.update({
                    where: { id: client.id },
                    data: { stripeCustomerId },
                });
            }
        }
        catch (error) {
            console.error("Erreur lors de la création du client Stripe:", error);
            throw new common_1.BadRequestException("Erreur lors de la création du client Stripe");
        }
        const location = await this.prisma.locationVehicule.create({
            data: {
                clientId: createLocationDto.clientId,
                vehiculeId: createLocationDto.vehiculeId,
                dateDebut,
                dateFin,
                lieuDepart: createLocationDto.lieuDepart,
                lieuDestination: createLocationDto.lieuDestination,
                departLatitude: createLocationDto.departLatitude,
                departLongitude: createLocationDto.departLongitude,
                destinationLatitude: createLocationDto.destinationLatitude,
                destinationLongitude: createLocationDto.destinationLongitude,
                distance: createLocationDto.distance,
                montantTotal: createLocationDto.montantTotal,
                course: {
                    create: {
                        clientId: createLocationDto.clientId,
                        startLocation: createLocationDto.lieuDepart,
                        endLocation: createLocationDto.lieuDestination,
                        startTime: dateDebut,
                        endTime: dateFin,
                        estimatedDuration: `${Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60))} minutes`,
                        estimatedPrice: createLocationDto.montantTotal,
                        paymentMethod: 'stripe',
                        typeService: 'LOCATION',
                        status: 'EN_ATTENTE'
                    }
                }
            },
        });
        const baseUrl = this.configService.get("BASE_URL") || "http://localhost:3000";
        const successUrl = `${baseUrl}/locations/confirmation/${location.id}`;
        const cancelUrl = `${baseUrl}/locations/annulation/${location.id}`;
        const session = await this.stripeService.createCheckoutSession(Math.round(createLocationDto.montantTotal * 100), "eur", stripeCustomerId, successUrl, cancelUrl, {
            locationId: location.id.toString(),
            vehiculeId: createLocationDto.vehiculeId.toString(),
            lieuDepart: createLocationDto.lieuDepart,
            lieuDestination: createLocationDto.lieuDestination,
            dateDebut: dateDebut.toISOString(),
            dateFin: dateFin.toISOString(),
        });
        await this.prisma.locationVehicule.update({
            where: { id: location.id },
            data: { stripeSessionId: session.id },
        });
        await this.prisma.vehicule.update({
            where: { id: createLocationDto.vehiculeId },
            data: { statut: "ASSIGNE" },
        });
        return {
            location,
            paymentUrl: session.url,
        };
    }
    async findAll(params) {
        const { skip, take, cursor, where, orderBy } = params;
        const [items, count] = await Promise.all([
            this.prisma.locationVehicule.findMany({
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
                            photos: true,
                        },
                    },
                },
            }),
            this.prisma.locationVehicule.count({ where }),
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
        const location = await this.prisma.locationVehicule.findUnique({
            where: { id },
            include: {
                client: true,
                vehicule: true
            },
        });
        if (!location) {
            throw new common_1.NotFoundException(`Location avec l'ID ${id} non trouvée`);
        }
        return location;
    }
    async confirmLocation(id) {
        const location = await this.prisma.locationVehicule.findUnique({
            where: { id },
            include: {
                client: true,
                vehicule: true,
                course: true
            },
        });
        if (!location) {
            throw new common_1.NotFoundException(`Location avec l'ID ${id} non trouvée`);
        }
        const updatedLocation = await this.prisma.locationVehicule.update({
            where: { id },
            data: {
                status: "CONFIRMEE",
                course: {
                    update: {
                        status: "EN_ATTENTE"
                    }
                }
            },
        });
        await this.notificationsService.createReservationStatusNotification(location.clientId, null, location.id, "CONFIRMEE", `Pour le véhicule ${location.vehicule.marque} ${location.vehicule.modele} du ${new Date(location.dateDebut).toLocaleDateString()} au ${new Date(location.dateFin).toLocaleDateString()}.`);
        return updatedLocation;
    }
    async startLocation(id) {
        const location = await this.prisma.locationVehicule.findUnique({
            where: { id },
            include: {
                client: true,
                vehicule: true,
            },
        });
        if (!location) {
            throw new common_1.NotFoundException(`Location avec l'ID ${id} non trouvée`);
        }
        if (location.status !== "CONFIRMEE") {
            throw new common_1.BadRequestException("La location doit être confirmée avant de pouvoir être commencée");
        }
        const updatedLocation = await this.prisma.locationVehicule.update({
            where: { id },
            data: { status: "EN_COURS" },
        });
        await this.notificationsService.createReservationStatusNotification(location.clientId, null, location.id, "EN_COURS", `La location de votre véhicule ${location.vehicule.marque} ${location.vehicule.modele} a débuté.`);
        return updatedLocation;
    }
    async endLocation(id) {
        const location = await this.prisma.locationVehicule.findUnique({
            where: { id },
            include: {
                vehicule: true,
                client: true,
                course: true,
            },
        });
        if (!location) {
            throw new common_1.NotFoundException(`Location avec l'ID ${id} non trouvée`);
        }
        if (location.status !== "EN_COURS") {
            throw new common_1.BadRequestException("La location doit être en cours avant de pouvoir être terminée");
        }
        await this.prisma.vehicule.update({
            where: { id: location.vehiculeId },
            data: { statut: "DISPONIBLE" },
        });
        const updatedLocation = await this.prisma.locationVehicule.update({
            where: { id },
            data: {
                status: "TERMINEE",
                course: {
                    update: {
                        status: "TERMINEE",
                        endTime: new Date()
                    }
                }
            },
        });
        await this.notificationsService.createReservationStatusNotification(location.clientId, null, location.id, "TERMINEE", `Merci d'avoir utilisé nos services pour la location du véhicule ${location.vehicule.marque} ${location.vehicule.modele}.`);
        return updatedLocation;
    }
    async cancelLocation(id) {
        const location = await this.prisma.locationVehicule.findUnique({
            where: { id },
            include: {
                vehicule: true,
                client: true,
                course: true,
            },
        });
        if (!location) {
            throw new common_1.NotFoundException(`Location avec l'ID ${id} non trouvée`);
        }
        if (location.status === "TERMINEE") {
            throw new common_1.BadRequestException("Impossible d'annuler une location déjà terminée");
        }
        await this.prisma.vehicule.update({
            where: { id: location.vehiculeId },
            data: { statut: "DISPONIBLE" },
        });
        const updatedLocation = await this.prisma.locationVehicule.update({
            where: { id },
            data: {
                status: "ANNULEE",
                course: {
                    update: {
                        status: "ANNULEE"
                    }
                }
            },
        });
        await this.notificationsService.createReservationStatusNotification(location.clientId, null, location.id, "ANNULEE", `La location du véhicule ${location.vehicule.marque} ${location.vehicule.modele} a été annulée.`);
        return updatedLocation;
    }
    async handleStripeWebhook(event) {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                const location = await this.prisma.locationVehicule.findUnique({
                    where: { stripeSessionId: session.id },
                    include: {
                        client: true,
                        vehicule: true,
                    },
                });
                if (location) {
                    await this.prisma.locationVehicule.update({
                        where: { id: location.id },
                        data: {
                            stripePaymentId: session.payment_intent,
                            status: "CONFIRMEE",
                        },
                    });
                    await this.notificationsService.createPaymentSuccessNotification(location.clientId, location.montantTotal, session.payment_intent);
                    await this.notificationsService.createReservationStatusNotification(location.clientId, null, location.id, "CONFIRMEE", `Pour le véhicule ${location.vehicule.marque} ${location.vehicule.modele} du ${new Date(location.dateDebut).toLocaleDateString()} au ${new Date(location.dateFin).toLocaleDateString()}.`);
                }
                break;
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                const failedLocation = await this.prisma.locationVehicule.findFirst({
                    where: { stripePaymentId: failedPayment.id },
                    include: {
                        client: true,
                        vehicule: true,
                    },
                });
                if (failedLocation) {
                    await this.cancelLocation(failedLocation.id);
                    await this.notificationsService.createSystemNotification(null, failedLocation.clientId, null, "Échec du paiement", `Le paiement pour votre location de véhicule a échoué. Veuillez réessayer ou contacter notre service client.`, { locationId: failedLocation.id });
                }
                break;
        }
        return { received: true };
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], LocationsService);
//# sourceMappingURL=locations.service.js.map