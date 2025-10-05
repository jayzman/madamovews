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
exports.CreateTransportDto = exports.PaymentMethod = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["STRIPE"] = "STRIPE";
    PaymentMethod["CASH"] = "CASH";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
class CreateTransportDto {
}
exports.CreateTransportDto = CreateTransportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: "ID du client",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "L'ID du client doit être un nombre" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'ID du client est requis" }),
    __metadata("design:type", Number)
], CreateTransportDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: "ID du véhicule",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "L'ID du véhicule doit être un nombre" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'ID du véhicule est requis" }),
    __metadata("design:type", Number)
], CreateTransportDto.prototype, "vehiculeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "123 rue de Paris, 75001 Paris",
        description: "Adresse de départ",
    }),
    (0, class_validator_1.IsString)({ message: "L'adresse de départ doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'adresse de départ est requise" }),
    __metadata("design:type", String)
], CreateTransportDto.prototype, "adresseDepart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "456 avenue des Champs-Élysées, 75008 Paris",
        description: "Adresse de destination",
    }),
    (0, class_validator_1.IsString)({ message: "L'adresse de destination doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "L'adresse de destination est requise" }),
    __metadata("design:type", String)
], CreateTransportDto.prototype, "adresseDestination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 48.8566,
        description: "Latitude du point de départ",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "La latitude de départ doit être un nombre" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La latitude de départ est requise" }),
    __metadata("design:type", Number)
], CreateTransportDto.prototype, "departLatitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2.3522,
        description: "Longitude du point de départ",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "La longitude de départ doit être un nombre" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La longitude de départ est requise" }),
    __metadata("design:type", Number)
], CreateTransportDto.prototype, "departLongitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 48.8534,
        description: "Latitude du point de destination",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "La latitude de destination doit être un nombre" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La latitude de destination est requise" }),
    __metadata("design:type", Number)
], CreateTransportDto.prototype, "destinationLatitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2.3488,
        description: "Longitude du point de destination",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "La longitude de destination doit être un nombre" }),
    (0, class_validator_1.IsNotEmpty)({ message: "La longitude de destination est requise" }),
    __metadata("design:type", Number)
], CreateTransportDto.prototype, "destinationLongitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: PaymentMethod.STRIPE,
        description: "Mode de paiement choisi",
        enum: PaymentMethod,
        default: PaymentMethod.STRIPE,
    }),
    (0, class_validator_1.IsEnum)(PaymentMethod, { message: "Le mode de paiement doit être STRIPE ou CASH" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransportDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "PROMO2025",
        description: "Code promo à appliquer",
        required: false,
    }),
    (0, class_validator_1.IsString)({ message: "Le code promo doit être une chaîne de caractères" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransportDto.prototype, "promoCode", void 0);
//# sourceMappingURL=create-transport.dto.js.map