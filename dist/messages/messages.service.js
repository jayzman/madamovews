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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
const create_notification_dto_1 = require("../notifications/dto/create-notification.dto");
let MessagesService = class MessagesService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(createMessageDto) {
        const { clientId, chauffeurId, reservationId, courseId, transportId } = createMessageDto;
        if (!reservationId && !courseId && !transportId) {
            throw new Error('Vous devez fournir l\'ID d\'une réservation, d\'une course ou d\'un transport');
        }
        if (transportId) {
            const transport = await this.prisma.transport.findUnique({
                where: { id: transportId },
                include: { client: true, chauffeur: true },
            });
            if (!transport) {
                throw new common_1.NotFoundException(`Transport avec l'ID ${transportId} non trouvé`);
            }
            if (createMessageDto.expediteurType === client_1.TypeExpediteur.CLIENT &&
                transport.clientId !== clientId) {
                throw new Error('Ce client n\'est pas associé à ce transport');
            }
            if (createMessageDto.expediteurType === client_1.TypeExpediteur.CHAUFFEUR &&
                transport.chauffeurId !== chauffeurId) {
                throw new Error('Ce chauffeur n\'est pas associé à ce transport');
            }
        }
        const message = await this.prisma.message.create({
            data: createMessageDto,
            include: {
                client: true,
                chauffeur: true,
                reservation: true,
                course: true,
                transport: true,
            },
        });
        let titreNotif, messageNotif;
        if (createMessageDto.expediteurType === client_1.TypeExpediteur.CLIENT) {
            const clientNom = message.client ? `${message.client.prenom} ${message.client.nom}` : 'Un client';
            titreNotif = `Nouveau message de ${clientNom}`;
            messageNotif = `${clientNom} vous a envoyé un message concernant ${reservationId ? 'votre réservation' : (transportId ? 'votre transport' : 'votre course')}`;
            if (chauffeurId) {
                await this.notificationsService.create({
                    titre: titreNotif,
                    message: messageNotif,
                    type: create_notification_dto_1.TypeNotification.AUTRE,
                    chauffeurId: chauffeurId,
                    donnees: JSON.stringify({
                        messageId: message.id,
                        reservationId,
                        courseId,
                        transportId,
                    }),
                });
            }
        }
        else {
            const chauffeurNom = message.chauffeur ? `${message.chauffeur.prenom} ${message.chauffeur.nom}` : 'Votre chauffeur';
            titreNotif = `Nouveau message de ${chauffeurNom}`;
            messageNotif = `${chauffeurNom} vous a envoyé un message concernant ${reservationId ? 'votre réservation' : (transportId ? 'votre transport' : 'votre course')}`;
            if (clientId) {
                await this.notificationsService.create({
                    titre: titreNotif,
                    message: messageNotif,
                    type: create_notification_dto_1.TypeNotification.AUTRE,
                    clientId: clientId,
                    donnees: JSON.stringify({
                        messageId: message.id,
                        reservationId,
                        courseId,
                        transportId,
                    }),
                });
            }
        }
        return message;
    }
    async findAllForConversation(params) {
        const { clientId, chauffeurId, reservationId, courseId, transportId, skip, take } = params;
        const where = {};
        if (reservationId) {
            where.reservationId = reservationId;
        }
        else if (courseId) {
            where.courseId = courseId;
        }
        else if (transportId) {
            where.transportId = transportId;
        }
        else {
            throw new Error('Vous devez fournir soit un ID de réservation, soit un ID de course, soit un ID de transport');
        }
        const [items, count] = await Promise.all([
            this.prisma.message.findMany({
                where,
                skip: skip || 0,
                take: take || 50,
                orderBy: { createdAt: 'asc' },
                include: {
                    client: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            profileUrl: true,
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
            }),
            this.prisma.message.count({ where }),
        ]);
        return {
            items,
            meta: {
                total: count,
                skip: skip || 0,
                take: take || 50,
            },
        };
    }
    async getConversationsForClient(clientId) {
        const transports = await this.prisma.transport.findMany({
            where: { clientId },
            select: {
                id: true,
                chauffeur: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        photoUrl: true,
                    }
                },
                adresseDepart: true,
                adresseDestination: true,
                dateReservation: true,
                status: true,
                _count: {
                    select: {
                        messages: true,
                    }
                }
            },
        });
        const transportConversations = transports.map(t => ({
            type: 'TRANSPORT',
            id: t.id,
            trajet: `${t.adresseDepart} → ${t.adresseDestination}`,
            chauffeur: t.chauffeur ? {
                id: t.chauffeur.id,
                nom: `${t.chauffeur.prenom} ${t.chauffeur.nom}`,
                photoUrl: t.chauffeur.photoUrl,
            } : null,
            date: t.dateReservation,
            status: t.status,
            messageCount: t._count.messages,
        }));
        return {
            transports: transportConversations,
        };
    }
    async getConversationsForChauffeur(chauffeurId) {
        const transports = await this.prisma.transport.findMany({
            where: { chauffeurId },
            select: {
                id: true,
                client: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        profileUrl: true,
                    }
                },
                adresseDepart: true,
                adresseDestination: true,
                dateReservation: true,
                status: true,
                _count: {
                    select: {
                        messages: true,
                    }
                }
            },
        });
        const transportConversations = transports.map(t => ({
            type: 'TRANSPORT',
            id: t.id,
            trajet: `${t.adresseDepart} → ${t.adresseDestination}`,
            client: t.client ? {
                id: t.client.id,
                nom: `${t.client.prenom} ${t.client.nom}`,
                profileUrl: t.client.profileUrl,
            } : null,
            date: t.dateReservation,
            status: t.status,
            messageCount: t._count.messages,
        }));
        return {
            transports: transportConversations,
        };
    }
    async findUnreadCount(clientId, chauffeurId) {
        const where = {
            lu: false,
        };
        if (clientId) {
            where.expediteurType = client_1.TypeExpediteur.CHAUFFEUR;
            where.OR = [
                { clientId },
                { AND: [{ transportId: { not: null } }, { transport: { clientId } }] },
            ];
        }
        else if (chauffeurId) {
            where.expediteurType = client_1.TypeExpediteur.CLIENT;
            where.OR = [
                { chauffeurId },
                { AND: [{ transportId: { not: null } }, { transport: { chauffeurId } }] },
            ];
        }
        else {
            throw new Error('Vous devez fournir soit un ID de client soit un ID de chauffeur');
        }
        const count = await this.prisma.message.count({ where });
        return { count };
    }
    async findAll() {
        return await this.prisma.message.findMany({
            include: {
                client: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        profileUrl: true,
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
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const message = await this.prisma.message.findUnique({
            where: { id },
            include: {
                client: true,
                chauffeur: true,
                transport: true,
            },
        });
        if (!message) {
            throw new common_1.NotFoundException(`Message avec l'ID ${id} non trouvé`);
        }
        return message;
    }
    async update(id, updateMessageDto) {
        const message = await this.findOne(id);
        return await this.prisma.message.update({
            where: { id },
            data: updateMessageDto,
            include: {
                client: true,
                chauffeur: true,
                transport: true,
            },
        });
    }
    async remove(id) {
        const message = await this.findOne(id);
        return await this.prisma.message.delete({
            where: { id },
        });
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map