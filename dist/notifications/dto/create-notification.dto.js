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
exports.CreateNotificationDto = exports.TypeNotification = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var TypeNotification;
(function (TypeNotification) {
    TypeNotification["PAIEMENT"] = "PAIEMENT";
    TypeNotification["RESERVATION"] = "RESERVATION";
    TypeNotification["COURSE"] = "COURSE";
    TypeNotification["SYSTEME"] = "SYSTEME";
    TypeNotification["OFFRE"] = "OFFRE";
    TypeNotification["CARTE"] = "CARTE";
    TypeNotification["MAINTENANCE"] = "MAINTENANCE";
    TypeNotification["AUTRE"] = "AUTRE";
})(TypeNotification || (exports.TypeNotification = TypeNotification = {}));
class CreateNotificationDto {
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Titre de la notification' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "titre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message de la notification' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type de notification',
        enum: TypeNotification,
        example: TypeNotification.PAIEMENT
    }),
    (0, class_validator_1.IsEnum)(TypeNotification),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID de l\'utilisateur (admin/staff) concerné' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateNotificationDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID du chauffeur concerné' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateNotificationDto.prototype, "chauffeurId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID du client concerné' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateNotificationDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Données supplémentaires au format JSON' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "donnees", void 0);
//# sourceMappingURL=create-notification.dto.js.map