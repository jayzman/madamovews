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
exports.CreateCourseDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateCourseDto {
}
exports.CreateCourseDto = CreateCourseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: "ID du chauffeur",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "L'ID du chauffeur doit être un nombre" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'ID du chauffeur est requis" }),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "chauffeurId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: "ID du client",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "L'ID du client doit être un nombre" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'ID du client est requis" }),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Place de la République, Paris",
        description: "Lieu de départ",
    }),
    (0, class_validator_1.IsString)({ message: "Le lieu de départ doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le lieu de départ est requis" }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "startLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Tour Eiffel, Paris",
        description: "Lieu d'arrivée",
    }),
    (0, class_validator_1.IsString)({ message: "Le lieu d'arrivée doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le lieu d'arrivée est requis" }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "endLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "2023-08-15T10:30:00",
        description: "Heure de début",
    }),
    (0, class_validator_1.IsDateString)({}, { message: "L'heure de début doit être une date valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'heure de début est requise" }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "2023-08-15T11:00:00",
        description: "Heure de fin",
    }),
    (0, class_validator_1.IsDateString)({}, { message: "L'heure de fin doit être une date valide" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "25 min",
        description: "Durée estimée",
    }),
    (0, class_validator_1.IsString)({ message: "La durée estimée doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La durée estimée est requise" }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "estimatedDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "Rue de la Paix, Paris",
        description: "Localisation actuelle",
    }),
    (0, class_validator_1.IsString)({ message: "La localisation actuelle doit être une chaîne de caractères" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "currentLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 25,
        description: "Prix estimé",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "Le prix estimé doit être un nombre" }),
    (0, class_validator_1.Min)(0, { message: "Le prix estimé doit être supérieur ou égal à 0" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le prix estimé est requis" }),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "estimatedPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 25,
        description: "Prix final",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "Le prix final doit être un nombre" }),
    (0, class_validator_1.Min)(0, { message: "Le prix final doit être supérieur ou égal à 0" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "finalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Carte bancaire",
        description: "Méthode de paiement",
    }),
    (0, class_validator_1.IsString)({ message: "La méthode de paiement doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La méthode de paiement est requise" }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.StatutCourse,
        example: "EN_ATTENTE",
        description: "Statut de la course",
        default: "EN_ATTENTE",
    }),
    (0, class_validator_1.IsEnum)(client_1.StatutCourse, { message: "Le statut doit être l'un des suivants: EN_ATTENTE, EN_COURS, TERMINEE, ANNULEE" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "status", void 0);
//# sourceMappingURL=create-course.dto.js.map