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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const create_notification_dto_1 = require("./dto/create-notification.dto");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createNotificationDto) {
        return this.prisma.notification.create({
            data: {
                titre: createNotificationDto.titre,
                message: createNotificationDto.message,
                type: createNotificationDto.type,
                userId: createNotificationDto.userId,
                chauffeurId: createNotificationDto.chauffeurId,
                clientId: createNotificationDto.clientId,
                donnees: createNotificationDto.donnees,
            },
        });
    }
    async findAll(skip = 0, take = 10) {
        const [items, count] = await Promise.all([
            this.prisma.notification.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count(),
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
    async findAllForUser(userId, skip = 0, take = 10) {
        const [items, count] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
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
    async findAllForChauffeur(chauffeurId, skip = 0, take = 10) {
        const [items, count] = await Promise.all([
            this.prisma.notification.findMany({
                where: { chauffeurId },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { chauffeurId } }),
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
    async findAllForClient(clientId, skip = 0, take = 10) {
        const [items, count] = await Promise.all([
            this.prisma.notification.findMany({
                where: { clientId },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { clientId } }),
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
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification) {
            throw new common_1.NotFoundException(`Notification #${id} introuvable`);
        }
        return notification;
    }
    async markAsRead(id) {
        const notification = await this.findOne(id);
        return this.prisma.notification.update({
            where: { id },
            data: { lu: true },
        });
    }
    async markAllAsReadForUser(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, lu: false },
            data: { lu: true },
        });
    }
    async markAllAsReadForChauffeur(chauffeurId) {
        return this.prisma.notification.updateMany({
            where: { chauffeurId, lu: false },
            data: { lu: true },
        });
    }
    async markAllAsReadForClient(clientId) {
        return this.prisma.notification.updateMany({
            where: { clientId, lu: false },
            data: { lu: true },
        });
    }
    async remove(id) {
        const notification = await this.findOne(id);
        return this.prisma.notification.delete({
            where: { id },
        });
    }
    async createPaymentSuccessNotification(clientId, montant, reference) {
        return this.create({
            titre: 'Paiement confirmé',
            message: `Votre paiement de ${montant}€ a été traité avec succès.`,
            type: create_notification_dto_1.TypeNotification.PAIEMENT,
            clientId,
            donnees: JSON.stringify({
                montant,
                reference,
                date: new Date().toISOString(),
            }),
        });
    }
    async createCardAddedNotification(clientId, lastDigits) {
        return this.create({
            titre: 'Nouvelle carte enregistrée',
            message: `Une nouvelle carte bancaire se terminant par **** ${lastDigits} a été ajoutée à votre compte.`,
            type: create_notification_dto_1.TypeNotification.CARTE,
            clientId,
        });
    }
    async createReservationStatusNotification(clientId, chauffeurId, locationId, newStatus, details) {
        const titre = `Réservation ${this.getStatusLabel(newStatus)}`;
        const message = `Votre réservation #${locationId} est maintenant ${this.getStatusLabel(newStatus).toLowerCase()}. ${details}`;
        if (clientId) {
            await this.create({
                titre,
                message,
                type: create_notification_dto_1.TypeNotification.RESERVATION,
                clientId,
                donnees: JSON.stringify({
                    locationId,
                    status: newStatus,
                }),
            });
        }
        if (chauffeurId) {
            await this.create({
                titre,
                message: `La réservation #${locationId} est maintenant ${this.getStatusLabel(newStatus).toLowerCase()}. ${details}`,
                type: create_notification_dto_1.TypeNotification.RESERVATION,
                chauffeurId,
                donnees: JSON.stringify({
                    locationId,
                    status: newStatus,
                }),
            });
        }
    }
    async createSpecialOfferNotification(clientIds, chauffeurIds, titre, message, offreDetails) {
        const notifications = [];
        if (clientIds && clientIds.length > 0) {
            for (const clientId of clientIds) {
                const notification = await this.create({
                    titre,
                    message,
                    type: create_notification_dto_1.TypeNotification.OFFRE,
                    clientId,
                    donnees: JSON.stringify(offreDetails),
                });
                notifications.push(notification);
            }
        }
        if (chauffeurIds && chauffeurIds.length > 0) {
            for (const chauffeurId of chauffeurIds) {
                const notification = await this.create({
                    titre,
                    message,
                    type: create_notification_dto_1.TypeNotification.OFFRE,
                    chauffeurId,
                    donnees: JSON.stringify(offreDetails),
                });
                notifications.push(notification);
            }
        }
        return notifications;
    }
    async createSystemNotification(userId, clientId, chauffeurId, titre, message, donnees) {
        return this.create({
            titre,
            message,
            type: create_notification_dto_1.TypeNotification.SYSTEME,
            userId,
            clientId,
            chauffeurId,
            donnees: donnees ? JSON.stringify(donnees) : null,
        });
    }
    getStatusLabel(status) {
        const statusMap = {
            'RESERVATION': 'En attente',
            'CONFIRMEE': 'Confirmée',
            'EN_COURS': 'En cours',
            'TERMINEE': 'Terminée',
            'ANNULEE': 'Annulée',
        };
        return statusMap[status] || status;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map