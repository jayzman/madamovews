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
exports.CreateVehiculeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
class CreateVehiculeDto {
}
exports.CreateVehiculeDto = CreateVehiculeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Renault",
        description: "Marque du véhicule",
    }),
    (0, class_validator_1.IsString)({ message: "La marque doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La marque est requise" }),
    __metadata("design:type", String)
], CreateVehiculeDto.prototype, "marque", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Clio",
        description: "Modèle du véhicule",
    }),
    (0, class_validator_1.IsString)({ message: "Le modèle doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le modèle est requis" }),
    __metadata("design:type", String)
], CreateVehiculeDto.prototype, "modele", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "AB-123-CD",
        description: "Immatriculation du véhicule",
    }),
    (0, class_validator_1.IsString)({ message: "L'immatriculation doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'immatriculation est requise" }),
    __metadata("design:type", String)
], CreateVehiculeDto.prototype, "immatriculation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.TypeVehicule,
        example: "BERLINE",
        description: "Type du véhicule",
    }),
    (0, class_validator_1.IsEnum)(client_1.TypeVehicule, { message: "Le type doit être l'un des suivants: VAN, BUS, BERLINE, SUV, AUTOCAR" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le type est requis" }),
    __metadata("design:type", String)
], CreateVehiculeDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.StatutVehicule,
        example: "DISPONIBLE",
        description: "Statut du véhicule",
        default: "DISPONIBLE",
    }),
    (0, class_validator_1.IsEnum)(client_1.StatutVehicule, { message: "Le statut doit être l'un des suivants: DISPONIBLE, ASSIGNE, EN_MAINTENANCE" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le statut est requis" }),
    __metadata("design:type", String)
], CreateVehiculeDto.prototype, "statut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "2020-12-23T12:45:00.000Z",
        description: "Date d'acquisition du véhicule",
    }),
    (0, class_validator_1.IsDateString)({}, { message: "La date d'acquisition doit être une date valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La date d'acquisition est requise" }),
    __metadata("design:type", String)
], CreateVehiculeDto.prototype, "dateAcquisition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 15000,
        description: "Kilométrage du véhicule",
    }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVehiculeDto.prototype, "kilometrage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "2020-12-23T12:45:00.000Z",
        description: "Date du contrôle technique",
    }),
    (0, class_validator_1.IsDateString)({}, { message: "La date du contrôle technique doit être une date valide" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La date du contrôle technique est requise" }),
    __metadata("design:type", String)
], CreateVehiculeDto.prototype, "dateControleTechnique", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Attachments',
        type: 'array',
        items: {
            type: 'file',
            items: {
                type: 'string',
                format: 'binary',
            },
        },
    }),
    __metadata("design:type", Array)
], CreateVehiculeDto.prototype, "photos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.CategoryVehicule,
        example: "BASIC",
        description: "Catégorie du véhicule",
        default: "BASIC",
    }),
    (0, class_validator_1.IsEnum)(client_1.CategoryVehicule, { message: "La catégorie doit être l'une des suivantes: BASIC, CONFORT, FAMILIALE, VIP, BUS" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La catégorie est requise" }),
    __metadata("design:type", String)
], CreateVehiculeDto.prototype, "categorie", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 25.5,
        description: "Tarif horaire pour le transport",
    }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)({}, { message: "Le tarif horaire doit être un nombre" }),
    (0, class_validator_1.Min)(0, { message: "Le tarif horaire doit être supérieur ou égal à 0" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le tarif horaire est requis" }),
    __metadata("design:type", Number)
], CreateVehiculeDto.prototype, "tarifHoraire", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 150,
        description: "Tarif journalier pour la location",
    }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)({}, { message: "Le tarif journalier doit être un nombre" }),
    (0, class_validator_1.Min)(0, { message: "Le tarif journalier doit être supérieur ou égal à 0" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le tarif journalier est requis" }),
    __metadata("design:type", Number)
], CreateVehiculeDto.prototype, "tarifJournalier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 350.5,
        description: "Puissance maximale en chevaux (hp)",
        required: false
    }),
    (0, class_transformer_1.Transform)(({ value }) => value ? Number(value) : undefined),
    (0, class_validator_1.IsNumber)({}, { message: "La puissance maximale doit être un nombre" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVehiculeDto.prototype, "maxPower", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 12.5,
        description: "Consommation de carburant en km/L",
        required: false
    }),
    (0, class_transformer_1.Transform)(({ value }) => value ? Number(value) : undefined),
    (0, class_validator_1.IsNumber)({}, { message: "La consommation doit être un nombre" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVehiculeDto.prototype, "fuelConsumption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 250,
        description: "Vitesse maximale en km/h",
        required: false
    }),
    (0, class_transformer_1.Transform)(({ value }) => value ? Number(value) : undefined),
    (0, class_validator_1.IsNumber)({}, { message: "La vitesse maximale doit être un nombre" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVehiculeDto.prototype, "maxSpeed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 4.5,
        description: "Accélération 0-60mph en secondes",
        required: false
    }),
    (0, class_transformer_1.Transform)(({ value }) => value ? Number(value) : undefined),
    (0, class_validator_1.IsNumber)({}, { message: "L'accélération doit être un nombre" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVehiculeDto.prototype, "acceleration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: "Capacité (nombre de places)",
        required: false
    }),
    (0, class_transformer_1.Transform)(({ value }) => value ? Number(value) : undefined),
    (0, class_validator_1.IsNumber)({}, { message: "La capacité doit être un nombre" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVehiculeDto.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Noir",
        description: "Couleur du véhicule",
        required: false
    }),
    (0, class_validator_1.IsString)({ message: "La couleur doit être une chaîne de caractères" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVehiculeDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.FuelType,
        example: "ESSENCE",
        description: "Type de carburant",
        required: false
    }),
    (0, class_validator_1.IsEnum)(client_1.FuelType, { message: "Le type de carburant doit être l'un des suivants: ESSENCE, DIESEL, ELECTRIQUE, HYBRIDE, GPL" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVehiculeDto.prototype, "fuelType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.GearType,
        example: "AUTOMATIQUE",
        description: "Type de boîte de vitesses",
        required: false
    }),
    (0, class_validator_1.IsEnum)(client_1.GearType, { message: "Le type de boîte de vitesses doit être l'un des suivants: MANUEL, AUTOMATIQUE, SEMI_AUTOMATIQUE" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVehiculeDto.prototype, "gearType", void 0);
//# sourceMappingURL=create-vehicule.dto.js.map