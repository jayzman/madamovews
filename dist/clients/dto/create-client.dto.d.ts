import { StatutClient } from "@prisma/client";
export declare class CreateClientDto {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse?: string;
    ville: string;
    statut?: StatutClient;
    preferences?: string;
}
export declare class CreateClientWithImageDto {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse?: string;
    ville: string;
    profileUrl?: string;
    preferences?: string;
}
export declare class SendEmailDto {
    email?: string;
    message?: string;
}
export declare class SendSmsDto {
    phone: string;
    message: string;
}
export declare class RegisterClientDto {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    password: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    resetCode: string;
    email: string;
    password: string;
}
export declare class CheckExistenceDto {
    email?: string;
    telephone?: string;
}
export declare class RegisterClientBySmsDto {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse?: string;
    ville?: string;
}
export declare class SendOtpClientDto {
    telephone: string;
}
export declare class VerifyOtpClientDto {
    telephone: string;
    otp: string;
}
export declare class LoginClientBySmsDto {
    telephone: string;
    otp: string;
}
export declare class SendCustomSmsClientDto {
    to: string | string[];
    message: string;
}
