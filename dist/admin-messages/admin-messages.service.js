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
exports.AdminMessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const create_notification_dto_1 = require("../notifications/dto/create-notification.dto");
let AdminMessagesService = class AdminMessagesService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    serializeData(data) {
        if (data === null || data === undefined) {
            return data;
        }
        if (typeof data === 'bigint') {
            return Number(data);
        }
        if (data instanceof Date) {
            return data.toISOString();
        }
        if (Array.isArray(data)) {
            return data.map(item => this.serializeData(item));
        }
        if (typeof data === 'object') {
            const serialized = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const value = data[key];
                    if (value === null) {
                        serialized[key] = null;
                    }
                    else if (value instanceof Date) {
                        serialized[key] = value.toISOString();
                    }
                    else {
                        serialized[key] = this.serializeData(value);
                    }
                }
            }
            return serialized;
        }
        return data;
    }
    async create(createAdminMessageDto) {
        const { userId, chauffeurId, expediteurType } = createAdminMessageDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: chauffeurId },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
        }
        const message = await this.prisma.adminMessage.create({
            data: createAdminMessageDto,
            include: {
                user: true,
                chauffeur: true,
            },
        });
        if (expediteurType === 'ADMIN') {
            await this.notificationsService.create({
                titre: 'Nouveau message de l\'administration',
                message: `${user.prenom} ${user.nom} vous a envoyé un message`,
                type: create_notification_dto_1.TypeNotification.AUTRE,
                chauffeurId: chauffeurId,
                donnees: JSON.stringify({
                    adminMessageId: Number(message.id),
                }),
            });
        }
        else {
        }
        return this.serializeData(message);
    }
    async findAll(params) {
        const { skip, take, where } = params;
        const [items, count] = await Promise.all([
            this.prisma.adminMessage.findMany({
                skip,
                take,
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            email: true,
                        },
                    },
                    chauffeur: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            email: true,
                            photoUrl: true,
                        },
                    },
                },
            }),
            this.prisma.adminMessage.count({ where }),
        ]);
        return {
            items: this.serializeData(items),
            meta: {
                total: Number(count),
                skip,
                take,
            },
        };
    }
    async findAllForUser(userId, skip = 0, take = 10, filters = {}) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }
        return this.findAll({
            skip,
            take,
            where: {
                userId,
                ...filters,
            },
        });
    }
    async findAllForChauffeur(chauffeurId, skip = 0, take = 10, filters = {}) {
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: chauffeurId },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
        }
        return this.findAll({
            skip,
            take,
            where: {
                chauffeurId,
                ...filters,
            },
        });
    }
    async findOne(id) {
        const message = await this.prisma.adminMessage.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                    },
                },
                chauffeur: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        photoUrl: true,
                    },
                },
            },
        });
        if (!message) {
            throw new common_1.NotFoundException(`Message avec l'ID ${id} non trouvé`);
        }
        return this.serializeData(message);
    }
    async update(id, updateAdminMessageDto) {
        await this.findOne(id);
        const updatedMessage = await this.prisma.adminMessage.update({
            where: { id },
            data: updateAdminMessageDto,
        });
        return this.serializeData(updatedMessage);
    }
    async remove(id) {
        await this.findOne(id);
        const deletedMessage = await this.prisma.adminMessage.delete({
            where: { id },
        });
        return this.serializeData(deletedMessage);
    }
    async markAsRead(id) {
        await this.findOne(id);
        const updatedMessage = await this.prisma.adminMessage.update({
            where: { id },
            data: { lu: true },
        });
        return this.serializeData(updatedMessage);
    }
    async getConversation(userId, chauffeurId, skip = 0, take = 10) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: chauffeurId },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
        }
        const [items, count] = await Promise.all([
            this.prisma.adminMessage.findMany({
                where: {
                    OR: [
                        { userId, chauffeurId },
                        { userId, chauffeurId },
                    ],
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            email: true,
                        },
                    },
                    chauffeur: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            email: true,
                            photoUrl: true,
                        },
                    },
                },
            }),
            this.prisma.adminMessage.count({
                where: {
                    OR: [
                        { userId, chauffeurId },
                        { userId, chauffeurId },
                    ],
                },
            }),
        ]);
        const unreadMessages = items.filter((message) => !message.lu && message.expediteurType !== 'ADMIN');
        if (unreadMessages.length > 0) {
            await this.prisma.adminMessage.updateMany({
                where: { id: { in: unreadMessages.map((m) => m.id) } },
                data: { lu: true },
            });
        }
        return {
            items: this.serializeData(items),
            meta: {
                total: Number(count),
                skip,
                take,
            },
        };
    }
    async findUnreadCount(userId, chauffeurId) {
        if (!userId && !chauffeurId) {
            throw new Error('Vous devez fournir soit un ID utilisateur soit un ID chauffeur');
        }
        const where = { lu: false };
        if (userId) {
            where.userId = userId;
            where.expediteurType = 'CHAUFFEUR';
        }
        else if (chauffeurId) {
            where.chauffeurId = chauffeurId;
            where.expediteurType = 'ADMIN';
        }
        const count = await this.prisma.adminMessage.count({ where });
        return { count: Number(count) };
    }
    async getChauffeurConversations(userId) {
        try {
            const conversations = await this.prisma.$queryRaw `
                        SELECT DISTINCT 
                            c.id, 
                            c.nom, 
                            c.prenom, 
                            c."photoUrl", 
                            c.email, 
                            CAST(
                                (SELECT COUNT(*) 
                                FROM "AdminMessage" 
                                WHERE "chauffeurId" = c.id 
                                AND "userId" = ${userId} 
                                AND "lu" = false 
                                AND "expediteurType" = 'CHAUFFEUR') 
                                AS INTEGER
                            ) as unreadCount,
                            (SELECT MAX(m."createdAt") 
                            FROM "AdminMessage" m 
                            WHERE m."chauffeurId" = c.id 
                            AND m."userId" = ${userId}) as lastMessageDate
                        FROM "Chauffeur" c
                        JOIN "AdminMessage" m ON m."chauffeurId" = c.id
                        WHERE m."userId" = ${userId}                        ORDER BY lastMessageDate DESC;

            `;
            return this.serializeData(conversations);
        }
        catch (error) {
            console.error('Erreur lors de la récupération des conversations du chauffeur:', error);
            throw new Error('Erreur lors de la récupération des conversations du chauffeur');
        }
    }
    async getChauffeurConversations2(userId) {
        try {
            const count = await this.prisma.$queryRaw `
          SELECT COUNT(*) FROM "AdminMessage" WHERE "userId" = ${userId} AND "lu" = false AND "expediteurType" = 'ADMIN'`;
            const lastMessageDate = await this.prisma.$queryRaw `
          SELECT MAX(m."createdAt") FROM "AdminMessage" m WHERE m."userId" = ${userId} AND m."expediteurType" = 'ADMIN'`;
            const conversations = await this.prisma.$queryRaw `
          SELECT DISTINCT c.id, c.nom, c.prenom, c."photoUrl", c.email
          FROM "Chauffeur" c
          JOIN "AdminMessage" m ON m."chauffeurId" = c.id
          WHERE m."userId" = ${userId}
        `;
            conversations.forEach((conversation) => {
                conversation.unreadCount = count;
                conversation.lastMessageDate = lastMessageDate;
            });
            return this.serializeData(conversations);
        }
        catch (error) {
            console.error('Erreur lors de la récupération des conversations du chauffeur:', error);
            throw new Error('Erreur lors de la récupération des conversations du chauffeur');
        }
    }
    async getUserConversations(chauffeurId) {
        const conversations = await this.prisma.$queryRaw `
      SELECT DISTINCT 
        u.id, 
        u.nom, 
        u.prenom, 
        u.email, 
        CAST(
          (SELECT COUNT(*) FROM "AdminMessage" 
           WHERE "userId" = u.id 
           AND "chauffeurId" = ${chauffeurId} 
           AND "lu" = false 
           AND "expediteurType" = 'ADMIN') 
          AS INTEGER
        ) as "unreadCount",
        COALESCE(
          (SELECT MAX(m."createdAt") FROM "AdminMessage" m 
           WHERE m."userId" = u.id 
           AND m."chauffeurId" = ${chauffeurId}),
          NOW()
        ) as "lastMessageDate"
      FROM "User" u
      JOIN "AdminMessage" m ON m."userId" = u.id
      WHERE m."chauffeurId" = ${chauffeurId}
      ORDER BY "lastMessageDate" DESC
    `;
        return this.serializeData(conversations);
    }
};
exports.AdminMessagesService = AdminMessagesService;
exports.AdminMessagesService = AdminMessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], AdminMessagesService);
//# sourceMappingURL=admin-messages.service.js.map