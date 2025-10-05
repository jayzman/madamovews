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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoCodesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const promo_codes_service_1 = require("./promo-codes.service");
const create_promo_code_dto_1 = require("./dto/create-promo-code.dto");
const update_promo_code_dto_1 = require("./dto/update-promo-code.dto");
const validate_promo_code_dto_1 = require("./dto/validate-promo-code.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const skip_auth_decorator_1 = require("../auth/decorators/skip-auth.decorator");
let PromoCodesController = class PromoCodesController {
    constructor(promoCodesService) {
        this.promoCodesService = promoCodesService;
    }
    create(createPromoCodeDto) {
        return this.promoCodesService.create(createPromoCodeDto);
    }
    findAll() {
        return this.promoCodesService.findAll();
    }
    getStats() {
        return this.promoCodesService.getStats();
    }
    findOne(id) {
        return this.promoCodesService.findOne(id);
    }
    update(id, updatePromoCodeDto) {
        return this.promoCodesService.update(id, updatePromoCodeDto);
    }
    remove(id) {
        return this.promoCodesService.remove(id);
    }
    validatePromoCode(validatePromoCodeDto) {
        return this.promoCodesService.validatePromoCode(validatePromoCodeDto.code, validatePromoCodeDto.montantCourse);
    }
};
exports.PromoCodesController = PromoCodesController;
__decorate([
    (0, common_1.Post)(),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Créer un nouveau code promo (Admin uniquement)" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Code promo créé avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Données invalides" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_promo_code_dto_1.CreatePromoCodeDto]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Lister tous les codes promo (Admin uniquement)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Liste des codes promo" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("stats"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Obtenir les statistiques des codes promo (Admin uniquement)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Statistiques des codes promo" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer un code promo par ID (Admin uniquement)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Code promo trouvé" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Code promo non trouvé" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour un code promo (Admin uniquement)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Code promo mis à jour" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Code promo non trouvé" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_promo_code_dto_1.UpdatePromoCodeDto]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Supprimer un code promo (Admin uniquement)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Code promo supprimé" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Code promo non trouvé" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)("validate"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Valider un code promo" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Code promo validé avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Code promo invalide" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validate_promo_code_dto_1.ValidatePromoCodeDto]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "validatePromoCode", null);
exports.PromoCodesController = PromoCodesController = __decorate([
    (0, swagger_1.ApiTags)("Codes Promo"),
    (0, common_1.Controller)("promo-codes"),
    __metadata("design:paramtypes", [promo_codes_service_1.PromoCodesService])
], PromoCodesController);
//# sourceMappingURL=promo-codes.controller.js.map