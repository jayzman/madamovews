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
exports.CreatePromoCodeDto = exports.TypeReduction = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var TypeReduction;
(function (TypeReduction) {
    TypeReduction["PERCENTAGE"] = "PERCENTAGE";
    TypeReduction["FIXED_AMOUNT"] = "FIXED_AMOUNT";
})(TypeReduction || (exports.TypeReduction = TypeReduction = {}));
class CreatePromoCodeDto {
    constructor() {
        this.actif = true;
    }
}
exports.CreatePromoCodeDto = CreatePromoCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "PROMO2025",
        description: "Code promo unique",
    }),
    (0, class_validator_1.IsString)({ message: "Le code doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le code est requis" }),
    __metadata("design:type", String)
], CreatePromoCodeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Réduction de bienvenue pour les nouveaux clients",
        description: "Description du code promo",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "La description doit être une chaîne de caractères" }),
    __metadata("design:type", String)
], CreatePromoCodeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: TypeReduction,
        example: TypeReduction.PERCENTAGE,
        description: "Type de réduction (pourcentage ou montant fixe)",
    }),
    (0, class_validator_1.IsEnum)(TypeReduction, { message: "Le type de réduction doit être PERCENTAGE ou FIXED_AMOUNT" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le type de réduction est requis" }),
    __metadata("design:type", String)
], CreatePromoCodeDto.prototype, "typeReduction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 20,
        description: "Valeur de la réduction (20 pour 20% ou 20€)",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "La valeur de réduction doit être un nombre" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La valeur de réduction est requise" }),
    __metadata("design:type", Number)
], CreatePromoCodeDto.prototype, "valeurReduction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "2025-12-31T23:59:59.000Z",
        description: "Date d'expiration du code",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: "La date d'expiration doit être une date valide" }),
    __metadata("design:type", String)
], CreatePromoCodeDto.prototype, "dateExpiration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 100,
        description: "Nombre maximum d'utilisations",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: "Le nombre d'utilisations maximum doit être un nombre" }),
    __metadata("design:type", Number)
], CreatePromoCodeDto.prototype, "utilisationsMax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 50,
        description: "Montant minimum de la course pour utiliser le code",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: "Le montant minimum doit être un nombre" }),
    __metadata("design:type", Number)
], CreatePromoCodeDto.prototype, "montantMinimum", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: "Statut actif du code promo",
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: "Le statut actif doit être un booléen" }),
    __metadata("design:type", Boolean)
], CreatePromoCodeDto.prototype, "actif", void 0);
//# sourceMappingURL=create-promo-code.dto.js.map