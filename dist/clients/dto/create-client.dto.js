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
exports.SendCustomSmsClientDto = exports.LoginClientBySmsDto = exports.VerifyOtpClientDto = exports.SendOtpClientDto = exports.RegisterClientBySmsDto = exports.CheckExistenceDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.RegisterClientDto = exports.SendSmsDto = exports.SendEmailDto = exports.CreateClientWithImageDto = exports.CreateClientDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateClientDto {
}
exports.CreateClientDto = CreateClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Dupont",
        description: "Nom du client",
    }),
    (0, class_validator_1.IsString)({ message: "Le nom doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le nom est requis" }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Jean",
        description: "Prénom du client",
    }),
    (0, class_validator_1.IsString)({ message: "Le prénom doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le prénom est requis" }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "jean.dupont@example.com",
        description: "Email du client",
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Veuillez fournir une adresse email valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'email est requis" }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "0123456789",
        description: "Numéro de téléphone du client",
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: "Veuillez fournir un numéro de téléphone valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le numéro de téléphone est requis" }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "123 Rue de Paris",
        description: "Adresse du client",
    }),
    (0, class_validator_1.IsString)({ message: "L'adresse doit être une chaîne de caractères" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Paris",
        description: "Ville du client",
    }),
    (0, class_validator_1.IsString)({ message: "La ville doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La ville est requise" }),
    __metadata("design:type", String)
], CreateClientDto.prototype, "ville", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.StatutClient,
        example: "ACTIF",
        description: "Statut du client",
        default: "ACTIF",
    }),
    (0, class_validator_1.IsEnum)(client_1.StatutClient, { message: "Le statut doit être l'un des suivants: ACTIF, INACTIF, BANNI" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "statut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "Préfère les véhicules berline",
        description: "Préférences du client",
    }),
    (0, class_validator_1.IsString)({ message: "Les préférences doivent être une chaîne de caractères" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "preferences", void 0);
class CreateClientWithImageDto {
}
exports.CreateClientWithImageDto = CreateClientWithImageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom du client' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientWithImageDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Prénom du client' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientWithImageDto.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Email du client (doit être unique)" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientWithImageDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Téléphone du client' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientWithImageDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Adresse du client', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientWithImageDto.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ville du client' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientWithImageDto.prototype, "ville", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL de la photo de profil (sera renseigné après upload)', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientWithImageDto.prototype, "profileUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Préférences du client', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClientWithImageDto.prototype, "preferences", void 0);
class SendEmailDto {
}
exports.SendEmailDto = SendEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'email du client' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message pour le client' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "message", void 0);
class SendSmsDto {
}
exports.SendSmsDto = SendSmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Telepone du client' }),
    __metadata("design:type", String)
], SendSmsDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message pour le client' }),
    __metadata("design:type", String)
], SendSmsDto.prototype, "message", void 0);
class RegisterClientDto {
}
exports.RegisterClientDto = RegisterClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Dupont",
        description: "Nom du client",
    }),
    (0, class_validator_1.IsString)({ message: "Le nom doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le nom est requis" }),
    __metadata("design:type", String)
], RegisterClientDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Jean",
        description: "Prénom du client",
    }),
    (0, class_validator_1.IsString)({ message: "Le prénom doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le prénom est requis" }),
    __metadata("design:type", String)
], RegisterClientDto.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "jean.dupont@example.com",
        description: "Email du client",
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Veuillez fournir une adresse email valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'email est requis" }),
    __metadata("design:type", String)
], RegisterClientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "0123456789",
        description: "Numéro de téléphone du client",
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: "Veuillez fournir un numéro de téléphone valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le numéro de téléphone est requis" }),
    __metadata("design:type", String)
], RegisterClientDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "MotDePasse123!",
        description: "Mot de passe du client",
    }),
    (0, class_validator_1.IsString)({ message: "Le mot de passe doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le mot de passe est requis" }),
    __metadata("design:type", String)
], RegisterClientDto.prototype, "password", void 0);
class ForgotPasswordDto {
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "jean.dupont@example.com",
        description: "Email du client",
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Veuillez fournir une adresse email valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'email est requis" }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "123456",
        description: "Code de réinitialisation reçu par email",
    }),
    (0, class_validator_1.IsString)({ message: "Le code de réinitialisation doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le code de réinitialisation est requis" }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "resetCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "jean.dupont@example.com",
        description: "Email du client",
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Veuillez fournir une adresse email valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'email est requis" }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "NouveauMotDePasse123!",
        description: "Nouveau mot de passe",
    }),
    (0, class_validator_1.IsString)({ message: "Le mot de passe doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le mot de passe est requis" }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "password", void 0);
class CheckExistenceDto {
}
exports.CheckExistenceDto = CheckExistenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "jean.dupont@example.com",
        description: "Email du client à vérifier",
        required: false
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Veuillez fournir une adresse email valide" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckExistenceDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "0123456789",
        description: "Numéro de téléphone du client à vérifier",
        required: false
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: "Veuillez fournir un numéro de téléphone valide" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckExistenceDto.prototype, "telephone", void 0);
class RegisterClientBySmsDto {
}
exports.RegisterClientBySmsDto = RegisterClientBySmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Dupont",
        description: "Nom du client",
    }),
    (0, class_validator_1.IsString)({ message: "Le nom doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le nom est requis" }),
    __metadata("design:type", String)
], RegisterClientBySmsDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Jean",
        description: "Prénom du client",
    }),
    (0, class_validator_1.IsString)({ message: "Le prénom doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le prénom est requis" }),
    __metadata("design:type", String)
], RegisterClientBySmsDto.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "+33123456789",
        description: "Numéro de téléphone du client avec indicatif",
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: "Veuillez fournir un numéro de téléphone valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le numéro de téléphone est requis" }),
    __metadata("design:type", String)
], RegisterClientBySmsDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "jean.dupont@example.com",
        description: "Email du client (optionnel)",
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Veuillez fournir une adresse email valide" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterClientBySmsDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "123 Rue de Paris",
        description: "Adresse du client",
    }),
    (0, class_validator_1.IsString)({ message: "L'adresse doit être une chaîne de caractères" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterClientBySmsDto.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "Paris",
        description: "Ville du client",
    }),
    (0, class_validator_1.IsString)({ message: "La ville doit être une chaîne de caractères" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterClientBySmsDto.prototype, "ville", void 0);
class SendOtpClientDto {
}
exports.SendOtpClientDto = SendOtpClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "+33123456789",
        description: "Numéro de téléphone pour recevoir l'OTP",
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: "Veuillez fournir un numéro de téléphone valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le numéro de téléphone est requis" }),
    __metadata("design:type", String)
], SendOtpClientDto.prototype, "telephone", void 0);
class VerifyOtpClientDto {
}
exports.VerifyOtpClientDto = VerifyOtpClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "+33123456789",
        description: "Numéro de téléphone",
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: "Veuillez fournir un numéro de téléphone valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le numéro de téléphone est requis" }),
    __metadata("design:type", String)
], VerifyOtpClientDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "123456",
        description: "Code OTP reçu par SMS",
    }),
    (0, class_validator_1.IsString)({ message: "Le code OTP doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le code OTP est requis" }),
    __metadata("design:type", String)
], VerifyOtpClientDto.prototype, "otp", void 0);
class LoginClientBySmsDto {
}
exports.LoginClientBySmsDto = LoginClientBySmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "+33123456789",
        description: "Numéro de téléphone du client",
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: "Veuillez fournir un numéro de téléphone valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le numéro de téléphone est requis" }),
    __metadata("design:type", String)
], LoginClientBySmsDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "123456",
        description: "Code OTP reçu par SMS",
    }),
    (0, class_validator_1.IsString)({ message: "Le code OTP doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le code OTP est requis" }),
    __metadata("design:type", String)
], LoginClientBySmsDto.prototype, "otp", void 0);
class SendCustomSmsClientDto {
}
exports.SendCustomSmsClientDto = SendCustomSmsClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ["+33123456789", "+33987654321"],
        description: "Numéro(s) de téléphone destinataire(s)",
        type: [String],
    }),
    (0, class_validator_1.IsNotEmpty)({ message: "Au moins un destinataire est requis" }),
    __metadata("design:type", Object)
], SendCustomSmsClientDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Votre réservation est confirmée. Merci de votre confiance !",
        description: "Message à envoyer",
    }),
    (0, class_validator_1.IsString)({ message: "Le message doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le message est requis" }),
    __metadata("design:type", String)
], SendCustomSmsClientDto.prototype, "message", void 0);
//# sourceMappingURL=create-client.dto.js.map