import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createNotificationDto: CreateNotificationDto): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.TypeNotification;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        chauffeurId: number | null;
        clientId: number | null;
        titre: string;
        lu: boolean;
        userId: number | null;
        donnees: string | null;
    }>;
    findAll(skip?: string, take?: string): Promise<{
        items: {
            message: string;
            type: import(".prisma/client").$Enums.TypeNotification;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            chauffeurId: number | null;
            clientId: number | null;
            titre: string;
            lu: boolean;
            userId: number | null;
            donnees: string | null;
        }[];
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    findAllForUser(userId: number, skip?: string, take?: string): Promise<{
        items: {
            message: string;
            type: import(".prisma/client").$Enums.TypeNotification;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            chauffeurId: number | null;
            clientId: number | null;
            titre: string;
            lu: boolean;
            userId: number | null;
            donnees: string | null;
        }[];
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    findAllForChauffeur(chauffeurId: number, skip?: string, take?: string): Promise<{
        items: {
            message: string;
            type: import(".prisma/client").$Enums.TypeNotification;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            chauffeurId: number | null;
            clientId: number | null;
            titre: string;
            lu: boolean;
            userId: number | null;
            donnees: string | null;
        }[];
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    findAllForClient(clientId: number, skip?: string, take?: string): Promise<{
        items: {
            message: string;
            type: import(".prisma/client").$Enums.TypeNotification;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            chauffeurId: number | null;
            clientId: number | null;
            titre: string;
            lu: boolean;
            userId: number | null;
            donnees: string | null;
        }[];
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    findOne(id: number): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.TypeNotification;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        chauffeurId: number | null;
        clientId: number | null;
        titre: string;
        lu: boolean;
        userId: number | null;
        donnees: string | null;
    }>;
    markAsRead(id: number): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.TypeNotification;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        chauffeurId: number | null;
        clientId: number | null;
        titre: string;
        lu: boolean;
        userId: number | null;
        donnees: string | null;
    }>;
    markAllAsReadForUser(userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsReadForChauffeur(chauffeurId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsReadForClient(clientId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: number): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.TypeNotification;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        chauffeurId: number | null;
        clientId: number | null;
        titre: string;
        lu: boolean;
        userId: number | null;
        donnees: string | null;
    }>;
    createSpecialOffer(data: {
        clientIds?: number[];
        chauffeurIds?: number[];
        titre: string;
        message: string;
        offreDetails: any;
    }): Promise<any[]>;
    createSystemNotification(data: {
        userId?: number;
        clientId?: number;
        chauffeurId?: number;
        titre: string;
        message: string;
        donnees?: any;
    }): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.TypeNotification;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        chauffeurId: number | null;
        clientId: number | null;
        titre: string;
        lu: boolean;
        userId: number | null;
        donnees: string | null;
    }>;
}
