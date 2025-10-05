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
exports.ValidatePromoCodeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ValidatePromoCodeDto {
}
exports.ValidatePromoCodeDto = ValidatePromoCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "PROMO2025",
        description: "Code promo à valider",
    }),
    (0, class_validator_1.IsString)({ message: "Le code doit être une chaîne de caractères" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le code est requis" }),
    __metadata("design:type", String)
], ValidatePromoCodeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 100.50,
        description: "Montant de la course pour validation",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "Le montant de la course doit être un nombre" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le montant de la course est requis" }),
    __metadata("design:type", Number)
], ValidatePromoCodeDto.prototype, "montantCourse", void 0);
//# sourceMappingURL=validate-promo-code.dto.js.map