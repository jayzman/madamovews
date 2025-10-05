import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    findAll(skip?: number, take?: number): Promise<{
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
    findAllForUser(userId: number, skip?: number, take?: number): Promise<{
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
    findAllForChauffeur(chauffeurId: number, skip?: number, take?: number): Promise<{
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
    findAllForClient(clientId: number, skip?: number, take?: number): Promise<{
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
    createPaymentSuccessNotification(clientId: number, montant: number, reference: string): Promise<{
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
    createCardAddedNotification(clientId: number, lastDigits: string): Promise<{
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
    createReservationStatusNotification(clientId: number, chauffeurId: number | null, locationId: number, newStatus: string, details: string): Promise<void>;
    createSpecialOfferNotification(clientIds: number[] | null, chauffeurIds: number[] | null, titre: string, message: string, offreDetails: any): Promise<any[]>;
    createSystemNotification(userId: number | null, clientId: number | null, chauffeurId: number | null, titre: string, message: string, donnees?: any): Promise<{
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
    private getStatusLabel;
}
