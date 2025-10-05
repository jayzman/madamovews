import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminMessageDto } from './dto/create-admin-message.dto';
import { UpdateAdminMessageDto } from './dto/update-admin-message.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma } from '@prisma/client';
import { TypeNotification } from '../notifications/dto/create-notification.dto';

@Injectable()
export class AdminMessagesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) { }    // Fonction utilitaire pour convertir BigInt en number
    private serializeData(data: any): any {
        if (data === null || data === undefined) {
            return data;
        }
        
        if (typeof data === 'bigint') {
            return Number(data);
        }
        
        // Gérer les dates
        if (data instanceof Date) {
            return data.toISOString();
        }
        
        if (Array.isArray(data)) {
            return data.map(item => this.serializeData(item));
        }
        
        if (typeof data === 'object') {
            const serialized: any = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const value = data[key];
                    // Gérer les valeurs spéciales
                    if (value === null) {
                        serialized[key] = null;
                    } else if (value instanceof Date) {
                        serialized[key] = value.toISOString();
                    } else {
                        serialized[key] = this.serializeData(value);
                    }
                }
            }
            return serialized;
        }
        
        return data;
    }

    async create(createAdminMessageDto: CreateAdminMessageDto) {
        const { userId, chauffeurId, expediteurType } = createAdminMessageDto;

        // Vérifier si l'utilisateur existe
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }

        // Vérifier si le chauffeur existe
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: chauffeurId },
        });

        if (!chauffeur) {
            throw new NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
        }        // Créer le message
        const message = await this.prisma.adminMessage.create({
            data: createAdminMessageDto,
            include: {
                user: true,
                chauffeur: true,
            },
        });

        // Créer une notification pour le destinataire
        if (expediteurType === 'ADMIN') {
            // Notification pour le chauffeur
            await this.notificationsService.create({
                titre: 'Nouveau message de l\'administration',
                message: `${user.prenom} ${user.nom} vous a envoyé un message`,
                type: TypeNotification.AUTRE,
                chauffeurId: chauffeurId,
                donnees: JSON.stringify({
                    adminMessageId: Number(message.id), // Convertir BigInt en number
                }),
            });
        } else {
            // Notification pour l'admin
            // Note: Il faudrait ajouter un champ userId dans le modèle Notification
            // pour pouvoir notifier les administrateurs
        }

        return this.serializeData(message);
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.AdminMessageWhereInput;
    }) {
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
            this.prisma.adminMessage.count({ where }),        ]);

        return {
            items: this.serializeData(items),
            meta: {
                total: Number(count), // Convertir BigInt en number
                skip,
                take,
            },
        };
    }

    async findAllForUser(userId: number, skip = 0, take = 10, filters: any = {}) {
        // Vérifier si l'utilisateur existe
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
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

    async findAllForChauffeur(chauffeurId: number, skip = 0, take = 10, filters: any = {}) {
        // Vérifier si le chauffeur existe
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: chauffeurId },
        });

        if (!chauffeur) {
            throw new NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
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

    async findOne(id: number) {
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
        });        if (!message) {
            throw new NotFoundException(`Message avec l'ID ${id} non trouvé`);
        }

        return this.serializeData(message);
    }    async update(id: number, updateAdminMessageDto: UpdateAdminMessageDto) {
        await this.findOne(id); // Vérifier que le message existe

        const updatedMessage = await this.prisma.adminMessage.update({
            where: { id },
            data: updateAdminMessageDto,
        });

        return this.serializeData(updatedMessage);
    }

    async remove(id: number) {
        await this.findOne(id); // Vérifier que le message existe

        const deletedMessage = await this.prisma.adminMessage.delete({
            where: { id },
        });

        return this.serializeData(deletedMessage);
    }

    async markAsRead(id: number) {
        await this.findOne(id); // Vérifier que le message existe

        const updatedMessage = await this.prisma.adminMessage.update({
            where: { id },
            data: { lu: true },
        });

        return this.serializeData(updatedMessage);
    }

    async getConversation(userId: number, chauffeurId: number, skip = 0, take = 10) {
        // Vérifier si l'utilisateur existe
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
        }

        // Vérifier si le chauffeur existe
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: chauffeurId },
        });

        if (!chauffeur) {
            throw new NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
        }

        // Récupérer les messages entre l'utilisateur et le chauffeur
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

        // Marquer les messages comme lus si l'expéditeur est l'autre partie
        const unreadMessages = items.filter(
            (message) => !message.lu && message.expediteurType !== 'ADMIN',
        );

        if (unreadMessages.length > 0) {
            await this.prisma.adminMessage.updateMany({
                where: { id: { in: unreadMessages.map((m) => m.id) } },
                data: { lu: true },
            });
        }        return {
            items: this.serializeData(items),
            meta: {
                total: Number(count), // Convertir BigInt en number
                skip,
                take,
            },
        };
    }

    async findUnreadCount(userId?: number, chauffeurId?: number) {
        if (!userId && !chauffeurId) {
            throw new Error('Vous devez fournir soit un ID utilisateur soit un ID chauffeur');
        }

        const where: Prisma.AdminMessageWhereInput = { lu: false };

        if (userId) {
            where.userId = userId;
            where.expediteurType = 'CHAUFFEUR';
        } else if (chauffeurId) {
            where.chauffeurId = chauffeurId;
            where.expediteurType = 'ADMIN';
        }        const count = await this.prisma.adminMessage.count({ where });
        return { count: Number(count) };
    }

    async getChauffeurConversations(userId: number) {
        // Récupérer tous les chauffeurs avec qui l'utilisateur a échangé des messages
        try {
            const conversations = await this.prisma.$queryRaw`
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
        } catch (error) {
            console.error('Erreur lors de la récupération des conversations du chauffeur:', error);
            throw new Error('Erreur lors de la récupération des conversations du chauffeur');

        }
    }

    async getChauffeurConversations2(userId: number) {
        // Récupérer tous les chauffeurs avec qui l'utilisateur a échangé des messages
        try {
            const count = await this.prisma.$queryRaw`
          SELECT COUNT(*) FROM "AdminMessage" WHERE "userId" = ${userId} AND "lu" = false AND "expediteurType" = 'ADMIN'`
            const lastMessageDate = await this.prisma.$queryRaw`
          SELECT MAX(m."createdAt") FROM "AdminMessage" m WHERE m."userId" = ${userId} AND m."expediteurType" = 'ADMIN'`
            const conversations: any[] = await this.prisma.$queryRaw`
          SELECT DISTINCT c.id, c.nom, c.prenom, c."photoUrl", c.email
          FROM "Chauffeur" c
          JOIN "AdminMessage" m ON m."chauffeurId" = c.id
          WHERE m."userId" = ${userId}
        `;            conversations.forEach((conversation) => {
                conversation.unreadCount = count;
                conversation.lastMessageDate = lastMessageDate;
            });
            return this.serializeData(conversations);
        } catch (error) {
            console.error('Erreur lors de la récupération des conversations du chauffeur:', error);
            throw new Error('Erreur lors de la récupération des conversations du chauffeur');

        }
    }    async getUserConversations(chauffeurId: number) {
        // Récupérer tous les utilisateurs avec qui le chauffeur a échangé des messages
        const conversations = await this.prisma.$queryRaw`
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
}