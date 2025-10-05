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
exports.ResetPasswordDto = exports.ForgotPasswordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ForgotPasswordDto {
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "chauffeur@example.com",
        description: "Email du chauffeur",
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
        example: "chauffeur@example.com",
        description: "Email du chauffeur",
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Veuillez fournir une adresse email valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'email est requis" }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
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
        example: "NouveauMotDePasse123!",
        description: "Nouveau mot de passe",
    }),
    (0, class_validator_1.IsString)({ message: "Le mot de passe doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le nouveau mot de passe est requis" }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "password", void 0);
//# sourceMappingURL=reset-password.dto.js.map