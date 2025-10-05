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
exports.CreateMessageDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateMessageDto {
}
exports.CreateMessageDto = CreateMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contenu du message',
        example: 'Bonjour, je vais être en retard de 5 minutes.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le contenu du message est requis' }),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "contenu", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID du client',
        example: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMessageDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID du chauffeur',
        example: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMessageDto.prototype, "chauffeurId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID de la réservation',
        example: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMessageDto.prototype, "reservationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID de la course',
        example: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMessageDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID du transport',
        example: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMessageDto.prototype, "transportId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type d\'expéditeur',
        enum: client_1.TypeExpediteur,
        example: 'CLIENT',
    }),
    (0, class_validator_1.IsEnum)(client_1.TypeExpediteur, { message: 'Le type d\'expéditeur doit être CLIENT ou CHAUFFEUR' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le type d\'expéditeur est requis' }),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "expediteurType", void 0);
//# sourceMappingURL=create-message.dto.js.map