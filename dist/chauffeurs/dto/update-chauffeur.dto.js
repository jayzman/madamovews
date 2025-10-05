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
exports.UpdateChauffeurDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_chauffeur_dto_1 = require("./create-chauffeur.dto");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class UpdateChauffeurDto extends (0, swagger_1.PartialType)(create_chauffeur_dto_1.CreateChauffeurDto) {
}
exports.UpdateChauffeurDto = UpdateChauffeurDto;
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: "URL de la photo du chauffeur",
        example: "/uploads/photos/chauffeur-123.jpg",
    }),
    (0, class_validator_1.IsString)({ message: "L'URL de la photo doit être une chaîne de caractères" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateChauffeurDto.prototype, "photoUrl", void 0);
//# sourceMappingURL=update-chauffeur.dto.js.map