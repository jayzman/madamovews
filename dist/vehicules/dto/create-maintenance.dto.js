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
exports.CreateMaintenanceDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateMaintenanceDto {
}
exports.CreateMaintenanceDto = CreateMaintenanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "2023-07-15",
        description: "Date de la maintenance",
    }),
    (0, class_validator_1.IsDateString)({}, { message: "La date doit être une date valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La date est requise" }),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Vidange",
        description: "Type de maintenance",
    }),
    (0, class_validator_1.IsString)({ message: "Le type doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le type est requis" }),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "Changement d'huile et filtres",
        description: "Description de la maintenance",
    }),
    (0, class_validator_1.IsString)({ message: "La description doit être une chaîne de caractères" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 150,
        description: "Coût de la maintenance",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "Le coût doit être un nombre" }),
    (0, class_validator_1.Min)(0, { message: "Le coût doit être supérieur ou égal à 0" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le coût est requis" }),
    __metadata("design:type", Number)
], CreateMaintenanceDto.prototype, "cout", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 15000,
        description: "Kilométrage du véhicule au moment de la maintenance",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "Le kilométrage doit être un nombre" }),
    (0, class_validator_1.Min)(0, { message: "Le kilométrage doit être supérieur ou égal à 0" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le kilométrage est requis" }),
    __metadata("design:type", Number)
], CreateMaintenanceDto.prototype, "kilometrage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.StatutMaintenance,
        example: "PLANIFIE",
        description: "Statut de la maintenance",
        default: "PLANIFIE",
    }),
    (0, class_validator_1.IsEnum)(client_1.StatutMaintenance, { message: "Le statut doit être l'un des suivants: PLANIFIE, EN_COURS, TERMINE, ANNULE" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le statut est requis" }),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "statut", void 0);
//# sourceMappingURL=create-maintenance.dto.js.map