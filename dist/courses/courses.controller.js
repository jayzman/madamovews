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
exports.CoursesController = void 0;
const common_1 = require("@nestjs/common");
const courses_service_1 = require("./courses.service");
const create_course_dto_1 = require("./dto/create-course.dto");
const update_course_dto_1 = require("./dto/update-course.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const terminer_course_dto_1 = require("./dto/terminer-course.dto");
let CoursesController = class CoursesController {
    constructor(coursesService) {
        this.coursesService = coursesService;
    }
    create(createCourseDto) {
        return this.coursesService.create(createCourseDto);
    }
    findAll(skip, take, status, chauffeurId, clientId, dateDebut, dateFin) {
        const filters = {};
        if (status) {
            filters.status = status;
        }
        if (chauffeurId) {
            filters.chauffeurId = Number.parseInt(chauffeurId);
        }
        if (clientId) {
            filters.clientId = Number.parseInt(clientId);
        }
        if (dateDebut || dateFin) {
            filters.startTime = {};
            if (dateDebut) {
                filters.startTime.gte = new Date(dateDebut);
            }
            if (dateFin) {
                filters.startTime.lte = new Date(dateFin);
            }
        }
        return this.coursesService.findAll({
            skip: skip ? Number.parseInt(skip) : undefined,
            take: take ? Number.parseInt(take) : undefined,
            where: Object.keys(filters).length > 0 ? filters : undefined,
            orderBy: { startTime: "desc" },
        });
    }
    countCourses() {
        console.log('Appel de la méthode countCourses dans le contrôleur');
        return this.coursesService.count();
    }
    findOne(id) {
        return this.coursesService.findOne(+id);
    }
    update(id, updateCourseDto) {
        return this.coursesService.update(+id, updateCourseDto);
    }
    remove(id) {
        return this.coursesService.remove(+id);
    }
    terminerCourse(id, terminerCourseDto) {
        return this.coursesService.terminerCourse(+id, terminerCourseDto.finalPrice);
    }
    annulerCourse(id) {
        return this.coursesService.annulerCourse(+id);
    }
};
exports.CoursesController = CoursesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une nouvelle course' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Course créée avec succès' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_course_dto_1.CreateCourseDto]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer toutes les courses" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Liste des courses récupérée avec succès" }),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('chauffeurId')),
    __param(4, (0, common_1.Query)('clientId')),
    __param(5, (0, common_1.Query)('dateDebut')),
    __param(6, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "countCourses", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer une course par son ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course récupérée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour une course" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Course mise à jour avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Course non trouvée" }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_course_dto_1.UpdateCourseDto]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une course' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Course supprimée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Course non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(":id/terminer"),
    (0, swagger_1.ApiOperation)({ summary: "Terminer une course" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Course terminée avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Course non trouvée ou non en cours" }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, terminer_course_dto_1.TerminerCourseDto]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "terminerCourse", null);
__decorate([
    (0, common_1.Post)(":id/annuler"),
    (0, swagger_1.ApiOperation)({ summary: "Annuler une course" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Course annulée avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Course non trouvée ou déjà terminée/annulée" }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "annulerCourse", null);
exports.CoursesController = CoursesController = __decorate([
    (0, swagger_1.ApiTags)("courses"),
    (0, common_1.Controller)("courses"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [courses_service_1.CoursesService])
], CoursesController);
//# sourceMappingURL=courses.controller.js.map