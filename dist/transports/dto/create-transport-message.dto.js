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
exports.CreateTransportMessageDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateTransportMessageDto {
}
exports.CreateTransportMessageDto = CreateTransportMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contenu du message',
        example: 'Bonjour, je suis en route vers votre adresse',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le contenu du message est requis' }),
    __metadata("design:type", String)
], CreateTransportMessageDto.prototype, "contenu", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type d\'expéditeur',
        enum: ['CLIENT', 'CHAUFFEUR'],
        example: 'CHAUFFEUR',
    }),
    (0, class_validator_1.IsEnum)(['CLIENT', 'CHAUFFEUR'], { message: 'Le type d\'expéditeur doit être CLIENT ou CHAUFFEUR' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Le type d\'expéditeur est requis' }),
    __metadata("design:type", String)
], CreateTransportMessageDto.prototype, "expediteurType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID de l\'expéditeur',
        example: 1,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'L\'ID de l\'expéditeur est requis' }),
    __metadata("design:type", Number)
], CreateTransportMessageDto.prototype, "expediteurId", void 0);
//# sourceMappingURL=create-transport-message.dto.js.map