import { Role } from "@prisma/client";
export declare class CreateUserDto {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    role: Role;
}
