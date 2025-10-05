import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class MessagesService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(createMessageDto: CreateMessageDto): Promise<{
        message: string;
    }>;
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<void>;
    update(id: number, updateMessageDto: UpdateMessageDto): Promise<void>;
    remove(id: number): Promise<void>;
}
