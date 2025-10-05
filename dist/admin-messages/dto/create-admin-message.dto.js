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
exports.CreateAdminMessageDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateAdminMessageDto {
}
exports.CreateAdminMessageDto = CreateAdminMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contenu du message',
        example: 'Bonjour, veuillez me confirmer votre emplacement actuel.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le contenu du message est requis' }),
    __metadata("design:type", String)
], CreateAdminMessageDto.prototype, "contenu", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID de l\'utilisateur administrateur',
        example: 1,
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAdminMessageDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID du chauffeur',
        example: 1,
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAdminMessageDto.prototype, "chauffeurId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type d\'expéditeur',
        enum: client_1.TypeExpediteur,
        example: 'ADMIN',
    }),
    (0, class_validator_1.IsEnum)(client_1.TypeExpediteur, { message: 'Le type d\'expéditeur doit être ADMIN ou CHAUFFEUR' }),
    __metadata("design:type", String)
], CreateAdminMessageDto.prototype, "expediteurType", void 0);
//# sourceMappingURL=create-admin-message.dto.js.map