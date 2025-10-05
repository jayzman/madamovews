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
exports.CreateIncidentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateIncidentDto {
}
exports.CreateIncidentDto = CreateIncidentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.TypeIncident,
        example: "RETARD",
        description: "Type d'incident",
    }),
    (0, class_validator_1.IsEnum)(client_1.TypeIncident, {
        message: "Le type doit être l'un des suivants: RETARD, LITIGE, PROBLEME_TECHNIQUE, ACCIDENT, AUTRE",
    }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le type est requis" }),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Retard de 15 minutes dû à un embouteillage",
        description: "Description de l'incident",
    }),
    (0, class_validator_1.IsString)({ message: "La description doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La description est requise" }),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "2023-08-15T10:30:00",
        description: "Date de l'incident",
        default: "Date actuelle",
    }),
    (0, class_validator_1.IsDateString)({}, { message: "La date doit être une date valide" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.StatutIncident,
        example: "NON_RESOLU",
        description: "Statut de l'incident",
        default: "NON_RESOLU",
    }),
    (0, class_validator_1.IsEnum)(client_1.StatutIncident, {
        message: "Le statut doit être l'un des suivants: NON_RESOLU, EN_COURS_DE_RESOLUTION, RESOLU",
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        description: "ID de la course associée",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "L'ID de la course doit être un nombre" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateIncidentDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        description: "ID du chauffeur associé",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "L'ID du chauffeur doit être un nombre" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateIncidentDto.prototype, "chauffeurId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 1,
        description: "ID du véhicule associé",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "L'ID du véhicule doit être un nombre" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateIncidentDto.prototype, "vehiculeId", void 0);
//# sourceMappingURL=create-incident.dto.js.map