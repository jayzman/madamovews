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
exports.IncidentsController = void 0;
const common_1 = require("@nestjs/common");
const incidents_service_1 = require("./incidents.service");
const create_incident_dto_1 = require("./dto/create-incident.dto");
const update_incident_dto_1 = require("./dto/update-incident.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let IncidentsController = class IncidentsController {
    constructor(incidentsService) {
        this.incidentsService = incidentsService;
    }
    create(createIncidentDto) {
        return this.incidentsService.create(createIncidentDto);
    }
    findAll(skip, take, type, status, chauffeurId, vehiculeId, courseId) {
        const filters = {};
        if (type) {
            filters.type = type;
        }
        if (status) {
            filters.status = status;
        }
        if (chauffeurId) {
            filters.chauffeurId = Number.parseInt(chauffeurId);
        }
        if (vehiculeId) {
            filters.vehiculeId = Number.parseInt(vehiculeId);
        }
        if (courseId) {
            filters.courseId = Number.parseInt(courseId);
        }
        return this.incidentsService.findAll({
            skip: skip ? Number.parseInt(skip) : undefined,
            take: take ? Number.parseInt(take) : undefined,
            where: Object.keys(filters).length > 0 ? filters : undefined,
            orderBy: { date: "desc" },
        });
    }
    findOne(id) {
        return this.incidentsService.findOne(+id);
    }
    update(id, updateIncidentDto) {
        return this.incidentsService.update(+id, updateIncidentDto);
    }
    remove(id) {
        return this.incidentsService.remove(+id);
    }
};
exports.IncidentsController = IncidentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouvel incident' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Incident créé avec succès' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_incident_dto_1.CreateIncidentDto]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer tous les incidents" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Liste des incidents récupérée avec succès" }),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('chauffeurId')),
    __param(5, (0, common_1.Query)('vehiculeId')),
    __param(6, (0, common_1.Query)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer un incident par son ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Incident récupéré avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Incident non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour un incident" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Incident mis à jour avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Incident non trouvé" }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_incident_dto_1.UpdateIncidentDto]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un incident' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Incident supprimé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Incident non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "remove", null);
exports.IncidentsController = IncidentsController = __decorate([
    (0, swagger_1.ApiTags)("incidents"),
    (0, common_1.Controller)("incidents"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [incidents_service_1.IncidentsService])
], IncidentsController);
//# sourceMappingURL=incidents.controller.js.map