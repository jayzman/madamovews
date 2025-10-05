import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(createUserDto: CreateUserDto): Promise<{
        user: {
            id: number;
            email: string;
            nom: string;
            prenom: string;
            role: import(".prisma/client").$Enums.Role;
        };
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: number;
            email: string;
            nom: string;
            prenom: string;
            role: import(".prisma/client").$Enums.Role;
        };
        token: string;
    }>;
    validateUser(email: string, password: string): Promise<{
        email: string;
        nom: string;
        prenom: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
