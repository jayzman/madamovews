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
exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "admin@madamove.com",
        description: "Adresse email de l'utilisateur",
        type: 'string'
    }),
    (0, class_validator_1.IsEmail)({}, { message: "Veuillez fournir une adresse email valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'email est requis" }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "admin123",
        description: "Mot de passe de l'utilisateur",
    }),
    (0, class_validator_1.IsString)({ message: "Le mot de passe doit être une chaîne de caractères" }),
    (0, class_validator_1.MinLength)(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le mot de passe est requis" }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Dupont",
        description: "Nom de l'utilisateur",
    }),
    (0, class_validator_1.IsString)({ message: "Le nom doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le nom est requis" }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Jean",
        description: "Prénom de l'utilisateur",
    }),
    (0, class_validator_1.IsString)({ message: "Le prénom doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le prénom est requis" }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.Role,
        example: "UTILISATEUR",
        description: "Rôle de l'utilisateur",
    }),
    (0, class_validator_1.IsEnum)(client_1.Role, { message: "Le rôle doit être l'un des suivants: ADMIN, GESTIONNAIRE, UTILISATEUR" }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
//# sourceMappingURL=create-user.dto.js.map