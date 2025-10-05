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
exports.ETAUpdateDto = exports.PositionUpdateEventDto = exports.UpdatePositionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdatePositionDto {
}
exports.UpdatePositionDto = UpdatePositionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 48.8566,
        description: 'Latitude de la position actuelle'
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePositionDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 2.3522,
        description: 'Longitude de la position actuelle'
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePositionDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'En route vers le client',
        description: 'Information optionnelle sur le statut',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePositionDto.prototype, "statusInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Indique si le suivi automatique doit être activé',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePositionDto.prototype, "enableAutoTracking", void 0);
class PositionUpdateEventDto {
}
exports.PositionUpdateEventDto = PositionUpdateEventDto;
class ETAUpdateDto {
}
exports.ETAUpdateDto = ETAUpdateDto;
//# sourceMappingURL=update-position.dto.js.map