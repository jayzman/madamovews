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
exports.RechargerCreditDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RechargerCreditDto {
}
exports.RechargerCreditDto = RechargerCreditDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 100,
        description: "Montant à recharger",
    }),
    (0, class_validator_1.IsNumber)({}, { message: "Le montant doit être un nombre" }),
    (0, class_validator_1.Min)(0, { message: "Le montant doit être supérieur ou égal à 0" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Le montant est requis" }),
    __metadata("design:type", Number)
], RechargerCreditDto.prototype, "montant", void 0);
//# sourceMappingURL=recharger-credit.dto.js.map