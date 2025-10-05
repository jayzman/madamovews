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
exports.CreateLocationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateLocationDto {
}
exports.CreateLocationDto = CreateLocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: "ID du client qui effectue la location",
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: "L'ID du client est requis" }),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: "ID du véhicule à louer",
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: "L'ID du véhicule est requis" }),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "vehiculeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "2025-05-01T10:00:00Z",
        description: "Date de début de la location",
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "La date de début est requise" }),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "dateDebut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "2025-05-05T10:00:00Z",
        description: "Date de fin de la location",
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "La date de fin est requise" }),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "dateFin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Antananarivo, Madagascar",
        description: "Lieu de départ de la location",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Le lieu de départ est requis" }),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "lieuDepart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Tamatave, Madagascar",
        description: "Lieu de destination de la location",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Le lieu de destination est requis" }),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "lieuDestination", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: -18.879190,
        description: "Latitude du lieu de départ",
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90, { message: "La latitude doit être comprise entre -90 et 90" }),
    (0, class_validator_1.Max)(90, { message: "La latitude doit être comprise entre -90 et 90" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "departLatitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 47.507905,
        description: "Longitude du lieu de départ",
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180, { message: "La longitude doit être comprise entre -180 et 180" }),
    (0, class_validator_1.Max)(180, { message: "La longitude doit être comprise entre -180 et 180" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "departLongitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: -18.114729,
        description: "Latitude du lieu de destination",
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90, { message: "La latitude doit être comprise entre -90 et 90" }),
    (0, class_validator_1.Max)(90, { message: "La latitude doit être comprise entre -90 et 90" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "destinationLatitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 49.396800,
        description: "Longitude du lieu de destination",
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180, { message: "La longitude doit être comprise entre -180 et 180" }),
    (0, class_validator_1.Max)(180, { message: "La longitude doit être comprise entre -180 et 180" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "destinationLongitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 370.5,
        description: "Distance entre le lieu de départ et la destination en kilomètres",
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)({ message: "La distance doit être positive" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "distance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 250.00,
        description: "Montant total de la location",
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)({ message: "Le montant total doit être positif" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le montant total est requis" }),
    __metadata("design:type", Number)
], CreateLocationDto.prototype, "montantTotal", void 0);
//# sourceMappingURL=create-location.dto.js.map