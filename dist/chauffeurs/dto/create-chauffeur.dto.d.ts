import { StatutActivite, StatutChauffeur } from "@prisma/client";
export declare class CreateChauffeurDto {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    statut: StatutChauffeur;
    statutActivite?: StatutActivite;
    vehiculeId?: number;
}
export declare class LoginDriverDto {
    email: string;
    password: string;
}
export declare class RegisterChauffeurBySmsDto {
    nom: string;
    prenom: string;
    telephone: string;
    statut: StatutChauffeur;
    email: string;
    vehiculeId?: number;
}
export declare class SendOtpChauffeurDto {
    telephone: string;
}
export declare class VerifyOtpChauffeurDto {
    telephone: string;
    otp: string;
}
export declare class LoginChauffeurBySmsDto {
    telephone: string;
    otp: string;
}
export declare class SendCustomSmsDto {
    to: string | string[];
    message: string;
}
