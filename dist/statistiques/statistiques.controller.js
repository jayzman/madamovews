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
exports.StatistiquesController = void 0;
const common_1 = require("@nestjs/common");
const statistiques_service_1 = require("./statistiques.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StatistiquesController = class StatistiquesController {
    constructor(statistiquesService) {
        this.statistiquesService = statistiquesService;
    }
    getKPIs() {
        return this.statistiquesService.getKPIs();
    }
    getKPIsDashboard() {
        return this.statistiquesService.getKPIsEvolution();
    }
    getStatistiquesCourses(periode) {
        return this.statistiquesService.getStatistiquesCourses(periode || 'mois');
    }
    getStatistiquesRevenus(periode) {
        return this.statistiquesService.getStatistiquesRevenus(periode || 'mois');
    }
    getStatistiquesIncidents(periode) {
        return this.statistiquesService.getStatistiquesIncidents(periode || 'mois');
    }
};
exports.StatistiquesController = StatistiquesController;
__decorate([
    (0, common_1.Get)("kpis"),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer les KPIs généraux" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "KPIs récupérés avec succès" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatistiquesController.prototype, "getKPIs", null);
__decorate([
    (0, common_1.Get)("kpis-dashboard"),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer les KPIs généraux" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "KPIs récupérés avec succès" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatistiquesController.prototype, "getKPIsDashboard", null);
__decorate([
    (0, common_1.Get)('courses'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les statistiques des courses' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques récupérées avec succès' }),
    __param(0, (0, common_1.Query)('periode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StatistiquesController.prototype, "getStatistiquesCourses", null);
__decorate([
    (0, common_1.Get)('revenus'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les statistiques des revenus' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques récupérées avec succès' }),
    __param(0, (0, common_1.Query)('periode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StatistiquesController.prototype, "getStatistiquesRevenus", null);
__decorate([
    (0, common_1.Get)('incidents'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les statistiques des incidents' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques récupérées avec succès' }),
    __param(0, (0, common_1.Query)('periode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StatistiquesController.prototype, "getStatistiquesIncidents", null);
exports.StatistiquesController = StatistiquesController = __decorate([
    (0, swagger_1.ApiTags)("statistiques"),
    (0, common_1.Controller)("statistiques"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [statistiques_service_1.StatistiquesService])
], StatistiquesController);
//# sourceMappingURL=statistiques.controller.js.map