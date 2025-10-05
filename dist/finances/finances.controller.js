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
exports.FinancesController = void 0;
const common_1 = require("@nestjs/common");
const finances_service_1 = require("./finances.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let FinancesController = class FinancesController {
    constructor(financesService) {
        this.financesService = financesService;
    }
    getResumeFinancier(periode) {
        return this.financesService.getResumeFinancier(periode || 'mois');
    }
    getHistoriqueActivites(skip, take, type, dateDebut, dateFin) {
        return this.financesService.getHistoriqueActivites({
            skip: skip ? Number.parseInt(skip) : undefined,
            take: take ? Number.parseInt(take) : undefined,
            type,
            dateDebut: dateDebut ? new Date(dateDebut) : undefined,
            dateFin: dateFin ? new Date(dateFin) : undefined,
        });
    }
};
exports.FinancesController = FinancesController;
__decorate([
    (0, common_1.Get)('resume'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer le résumé financier' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Résumé financier récupéré avec succès' }),
    __param(0, (0, common_1.Query)('periode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancesController.prototype, "getResumeFinancier", null);
__decorate([
    (0, common_1.Get)("activites"),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer l'historique des activités financières" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Historique des activités récupéré avec succès" }),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('dateDebut')),
    __param(4, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], FinancesController.prototype, "getHistoriqueActivites", null);
exports.FinancesController = FinancesController = __decorate([
    (0, swagger_1.ApiTags)("finances"),
    (0, common_1.Controller)("finances"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [finances_service_1.FinancesService])
], FinancesController);
//# sourceMappingURL=finances.controller.js.map