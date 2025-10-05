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
exports.CreateDocumentDto = exports.TypeDocument = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var TypeDocument;
(function (TypeDocument) {
    TypeDocument["PERMIS_DE_CONDUIRE"] = "PERMIS_DE_CONDUIRE";
    TypeDocument["ASSURANCE"] = "ASSURANCE";
    TypeDocument["CONTROLE_TECHNIQUE"] = "CONTROLE_TECHNIQUE";
    TypeDocument["CARTE_PROFESSIONNELLE"] = "CARTE_PROFESSIONNELLE";
    TypeDocument["AUTRE"] = "AUTRE";
})(TypeDocument || (exports.TypeDocument = TypeDocument = {}));
class CreateDocumentDto {
}
exports.CreateDocumentDto = CreateDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Nom du document" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Type du document", enum: TypeDocument }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Chemin du fichier stocké", required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "fichier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Type MIME du fichier", required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Taille du fichier en octets", required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateDocumentDto.prototype, "taille", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Date d'expiration du document", required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "dateExpiration", void 0);
//# sourceMappingURL=create-document.dto.js.map