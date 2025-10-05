import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminMessageDto } from './dto/create-admin-message.dto';
import { UpdateAdminMessageDto } from './dto/update-admin-message.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma } from '@prisma/client';
export declare class AdminMessagesService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    private serializeData;
    create(createAdminMessageDto: CreateAdminMessageDto): Promise<any>;
    findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.AdminMessageWhereInput;
    }): Promise<{
        items: any;
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    findAllForUser(userId: number, skip?: number, take?: number, filters?: any): Promise<{
        items: any;
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    findAllForChauffeur(chauffeurId: number, skip?: number, take?: number, filters?: any): Promise<{
        items: any;
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    findOne(id: number): Promise<any>;
    update(id: number, updateAdminMessageDto: UpdateAdminMessageDto): Promise<any>;
    remove(id: number): Promise<any>;
    markAsRead(id: number): Promise<any>;
    getConversation(userId: number, chauffeurId: number, skip?: number, take?: number): Promise<{
        items: any;
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    findUnreadCount(userId?: number, chauffeurId?: number): Promise<{
        count: number;
    }>;
    getChauffeurConversations(userId: number): Promise<any>;
    getChauffeurConversations2(userId: number): Promise<any>;
    getUserConversations(chauffeurId: number): Promise<any>;
}
