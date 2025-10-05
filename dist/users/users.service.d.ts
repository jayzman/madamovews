import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, InviteUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { MailService } from "../email.service";
export declare class UsersService {
    private prisma;
    private emailService;
    constructor(prisma: PrismaService, emailService: MailService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        nom: string;
        prenom: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    inviteUser(createUserDto: InviteUserDto): Promise<{
        email: string;
        nom: string;
        prenom: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        email: string;
        nom: string;
        prenom: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        email: string;
        nom: string;
        prenom: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        email: string;
        password: string;
        nom: string;
        prenom: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        nom: string;
        prenom: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
