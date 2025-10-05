import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { Response } from "express";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    login(loginDto: LoginDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getProfile(req: any): Promise<any>;
    logout(res: Response): Response<any, Record<string, any>>;
}
