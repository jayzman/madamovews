import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        nom: string;
        prenom: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    invite(createUserDto: CreateUserDto): Promise<{
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
    findOne(id: string): Promise<{
        email: string;
        nom: string;
        prenom: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        nom: string;
        prenom: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
