"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendCustomSmsDto = exports.LoginChauffeurBySmsDto = exports.VerifyOtpChauffeurDto = exports.SendOtpChauffeurDto = exports.RegisterChauffeurBySmsDto = exports.LoginDriverDto = exports.CreateChauffeurDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateChauffeurDto {
}
exports.CreateChauffeurDto = CreateChauffeurDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Dupont",
        description: "Nom du chauffeur",
    }),
    (0, class_validator_1.IsString)({ message: "Le nom doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le nom est requis" }),
    __metadata("design:type", String)
], CreateChauffeurDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Jean",
        description: "Prénom du chauffeur",
    }),
    (0, class_validator_1.IsString)({ message: "Le prénom doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le prénom est requis" }),
    __metadata("design:type", String)
], CreateChauffeurDto.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "jean.dupont@example.com",
        description: "Email du chauffeur",
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Veuillez fournir une adresse email valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'email est requis" }),
    __metadata("design:type", String)
], CreateChauffeurDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "0123456789",
        description: "Numéro de téléphone du chauffeur",
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: "Veuillez fournir un numéro de téléphone valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le numéro de téléphone est requis" }),
    __metadata("design:type", String)
], CreateChauffeurDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.StatutChauffeur,
        example: "SALARIE",
        description: "Statut du chauffeur (SALARIE ou INDEPENDANT)",
    }),
    (0, class_validator_1.IsEnum)(client_1.StatutChauffeur, { message: "Le statut doit être SALARIE ou INDEPENDANT" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le statut est requis" }),
    __metadata("design:type", String)
], CreateChauffeurDto.prototype, "statut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.StatutActivite,
        example: "ACTIF",
        description: "Statut d'activité du chauffeur (ACTIF, INACTIF ou SUSPENDU)",
        default: "ACTIF",
    }),
    (0, class_validator_1.IsEnum)(client_1.StatutActivite, { message: "Le statut d'activité doit être ACTIF, INACTIF ou SUSPENDU" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateChauffeurDto.prototype, "statutActivite", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        description: "ID du véhicule assigné au chauffeur",
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateChauffeurDto.prototype, "vehiculeId", void 0);
class LoginDriverDto {
}
exports.LoginDriverDto = LoginDriverDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "driver.madamove@yopmail.com",
        description: "Adresse email du chauffeur",
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Veuillez fournir une adresse email valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'email est requis" }),
    __metadata("design:type", String)
], LoginDriverDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "driver123",
        description: "Mot de passe du chauffeur",
    }),
    (0, class_validator_1.IsString)({ message: "Le mot de passe doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le mot de passe est requis" }),
    __metadata("design:type", String)
], LoginDriverDto.prototype, "password", void 0);
class RegisterChauffeurBySmsDto {
}
exports.RegisterChauffeurBySmsDto = RegisterChauffeurBySmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Dupont",
        description: "Nom du chauffeur",
    }),
    (0, class_validator_1.IsString)({ message: "Le nom doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le nom est requis" }),
    __metadata("design:type", String)
], RegisterChauffeurBySmsDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Jean",
        description: "Prénom du chauffeur",
    }),
    (0, class_validator_1.IsString)({ message: "Le prénom doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le prénom est requis" }),
    __metadata("design:type", String)
], RegisterChauffeurBySmsDto.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "+33123456789",
        description: "Numéro de téléphone du chauffeur avec indicatif",
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: "Veuillez fournir un numéro de téléphone valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le numéro de téléphone est requis" }),
    __metadata("design:type", String)
], RegisterChauffeurBySmsDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.StatutChauffeur,
        example: "SALARIE",
        description: "Statut du chauffeur (SALARIE ou INDEPENDANT)",
    }),
    (0, class_validator_1.IsEnum)(client_1.StatutChauffeur, { message: "Le statut doit être SALARIE ou INDEPENDANT" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le statut est requis" }),
    __metadata("design:type", String)
], RegisterChauffeurBySmsDto.prototype, "statut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "jean.dupont@example.com",
        description: "Email du chauffeur (optionnel)",
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Veuillez fournir une adresse email valide" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterChauffeurBySmsDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        description: "ID du véhicule assigné au chauffeur",
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], RegisterChauffeurBySmsDto.prototype, "vehiculeId", void 0);
class SendOtpChauffeurDto {
}
exports.SendOtpChauffeurDto = SendOtpChauffeurDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "+33123456789",
        description: "Numéro de téléphone pour recevoir l'OTP",
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: "Veuillez fournir un numéro de téléphone valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le numéro de téléphone est requis" }),
    __metadata("design:type", String)
], SendOtpChauffeurDto.prototype, "telephone", void 0);
class VerifyOtpChauffeurDto {
}
exports.VerifyOtpChauffeurDto = VerifyOtpChauffeurDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "+33123456789",
        description: "Numéro de téléphone",
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: "Veuillez fournir un numéro de téléphone valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le numéro de téléphone est requis" }),
    __metadata("design:type", String)
], VerifyOtpChauffeurDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "123456",
        description: "Code OTP reçu par SMS",
    }),
    (0, class_validator_1.IsString)({ message: "Le code OTP doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le code OTP est requis" }),
    __metadata("design:type", String)
], VerifyOtpChauffeurDto.prototype, "otp", void 0);
class LoginChauffeurBySmsDto {
}
exports.LoginChauffeurBySmsDto = LoginChauffeurBySmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "+33123456789",
        description: "Numéro de téléphone du chauffeur",
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: "Veuillez fournir un numéro de téléphone valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le numéro de téléphone est requis" }),
    __metadata("design:type", String)
], LoginChauffeurBySmsDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "123456",
        description: "Code OTP reçu par SMS",
    }),
    (0, class_validator_1.IsString)({ message: "Le code OTP doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le code OTP est requis" }),
    __metadata("design:type", String)
], LoginChauffeurBySmsDto.prototype, "otp", void 0);
class SendCustomSmsDto {
}
exports.SendCustomSmsDto = SendCustomSmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ["+33123456789", "+33987654321"],
        description: "Numéro(s) de téléphone destinataire(s)",
        type: [String],
    }),
    (0, class_validator_1.IsNotEmpty)({ message: "Au moins un destinataire est requis" }),
    __metadata("design:type", Object)
], SendCustomSmsDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Votre course est confirmée. Le chauffeur arrivera dans 5 minutes.",
        description: "Message à envoyer",
    }),
    (0, class_validator_1.IsString)({ message: "Le message doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le message est requis" }),
    __metadata("design:type", String)
], SendCustomSmsDto.prototype, "message", void 0);
//# sourceMappingURL=create-chauffeur.dto.js.map