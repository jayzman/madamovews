import { AdminMessagesService } from './admin-messages.service';
import { CreateAdminMessageDto } from './dto/create-admin-message.dto';
import { UpdateAdminMessageDto } from './dto/update-admin-message.dto';
import { QueryAdminMessageDto } from './dto/query-admin-message.dto';
export declare class AdminMessagesController {
    private readonly adminMessagesService;
    constructor(adminMessagesService: AdminMessagesService);
    create(createAdminMessageDto: CreateAdminMessageDto): Promise<any>;
    getConversation(userId: number, chauffeurId: number, queryDto: QueryAdminMessageDto): Promise<{
        items: any;
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    getUserConversations(userId: number): Promise<any>;
    getChauffeurConversations(chauffeurId: number): Promise<any>;
    findAllForUser(userId: number, queryDto: QueryAdminMessageDto): Promise<{
        items: any;
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    findAllForChauffeur(chauffeurId: number, queryDto: QueryAdminMessageDto): Promise<{
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
    getUserUnreadCount(userId: number): Promise<{
        count: number;
    }>;
    getChauffeurUnreadCount(chauffeurId: number): Promise<{
        count: number;
    }>;
}
