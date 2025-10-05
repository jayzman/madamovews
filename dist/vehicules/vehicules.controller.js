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
exports.VehiculesController = void 0;
const common_1 = require("@nestjs/common");
const vehicules_service_1 = require("./vehicules.service");
const create_vehicule_dto_1 = require("./dto/create-vehicule.dto");
const update_vehicule_dto_1 = require("./dto/update-vehicule.dto");
const swagger_1 = require("@nestjs/swagger");
const fs_1 = require("fs");
const path_1 = require("path");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_maintenance_dto_1 = require("./dto/create-maintenance.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const skip_auth_decorator_1 = require("../auth/decorators/skip-auth.decorator");
let VehiculesController = class VehiculesController {
    constructor(vehiculesService) {
        this.vehiculesService = vehiculesService;
    }
    create(createVehiculeDto) {
        return this.vehiculesService.create(createVehiculeDto);
    }
    createVehicule(createVehiculeDto, files) {
        if (files?.photos) {
            createVehiculeDto.photos = files.photos.map((file) => file.filename);
        }
        return this.vehiculesService.create(createVehiculeDto);
    }
    findAll(skip, take, type, statut, categorie, search) {
        const filters = {};
        if (type) {
            filters.type = type;
        }
        if (statut) {
            filters.statut = statut;
        }
        if (categorie) {
            filters.categorie = categorie;
        }
        if (search) {
            filters.OR = [
                { marque: { contains: search, mode: "insensitive" } },
                { modele: { contains: search, mode: "insensitive" } },
                { immatriculation: { contains: search, mode: "insensitive" } },
            ];
        }
        return this.vehiculesService.findAll({
            skip: skip ? Number.parseInt(skip) : undefined,
            take: take ? Number.parseInt(take) : undefined,
            where: Object.keys(filters).length > 0 ? filters : undefined,
            orderBy: { marque: "asc" },
        });
    }
    findOne(id) {
        return this.vehiculesService.findOne(+id);
    }
    findAvalilableVehicle() {
        return this.vehiculesService.getAvailableVehicles();
    }
    getAvailableVehicleTypes() {
        return this.vehiculesService.getAvailableVehicleTypes();
    }
    getAvailableCategories() {
        return this.vehiculesService.getAvailableCategories();
    }
    findByCategory(category) {
        return this.vehiculesService.findByCategory(category);
    }
    findByMarque(marque) {
        return this.vehiculesService.getByMarque(marque);
    }
    update(id, updateVehiculeDto) {
        return this.vehiculesService.update(+id, updateVehiculeDto);
    }
    remove(id) {
        return this.vehiculesService.remove(+id);
    }
    addMaintenance(id, createMaintenanceDto) {
        return this.vehiculesService.addMaintenance(+id, createMaintenanceDto);
    }
    getMaintenances(id) {
        return this.vehiculesService.getMaintenances(+id);
    }
    async getVehiclePhotos(id) {
        const photoUrls = await this.vehiculesService.getVehiclePhotos(+id);
        return { photos: photoUrls };
    }
    async getVehiclePhoto(id, filename, res) {
        const file = await this.vehiculesService.getVehiclePhoto(+id, filename);
        const stream = (0, fs_1.createReadStream)(file);
        res.set({
            "Content-Type": `image/${(0, path_1.extname)(file).substring(1)}`,
            "Content-Disposition": `inline; filename="${filename}"`,
        });
        return new common_1.StreamableFile(stream);
    }
};
exports.VehiculesController = VehiculesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Créer un nouveau véhicule" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Véhicule créé avec succès" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicule_dto_1.CreateVehiculeDto]),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)("with-images/create"),
    (0, swagger_1.ApiOperation)({ summary: "Créer un nouveau véhicule avec des images" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Véhicule créé avec succès." }),
    (0, swagger_1.ApiConsumes)("multipart/form-data"),
    (0, swagger_1.ApiBody)({
        description: "Données du véhicule et fichiers d'images",
        type: create_vehicule_dto_1.CreateVehiculeDto,
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: "photos", maxCount: 5 }], {
        storage: (0, multer_1.diskStorage)({
            destination: "./uploads/photos/vehicle",
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return cb(new common_1.BadRequestException("Seuls les fichiers image sont autorisés"), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicule_dto_1.CreateVehiculeDto, Object]),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "createVehicule", null);
__decorate([
    (0, common_1.Get)(),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer tous les véhicules" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Liste des véhicules récupérée avec succès",
    }),
    (0, swagger_1.ApiQuery)({
        name: "skip",
        required: false,
        description: "Nombre d'enregistrements à ignorer",
    }),
    (0, swagger_1.ApiQuery)({
        name: "take",
        required: false,
        description: "Nombre d'enregistrements à récupérer",
    }),
    (0, swagger_1.ApiQuery)({
        name: "statut",
        required: false,
        description: "Filtrer par statut du véhicule",
    }),
    (0, swagger_1.ApiQuery)({
        name: "type",
        required: false,
        description: "Filtrer par type de véhicule",
    }),
    (0, swagger_1.ApiQuery)({
        name: "categorie",
        required: false,
        description: "Filtrer par catégorie de véhicule",
    }),
    (0, swagger_1.ApiQuery)({
        name: "search",
        required: false,
        description: "Rechercher par marque, modèle, immatriculation",
    }),
    __param(0, (0, common_1.Query)("skip")),
    __param(1, (0, common_1.Query)("take")),
    __param(2, (0, common_1.Query)("type")),
    __param(3, (0, common_1.Query)("statut")),
    __param(4, (0, common_1.Query)("categorie")),
    __param(5, (0, common_1.Query)("search")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer un véhicule par son ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Véhicule récupéré avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Véhicule non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)("/available-vehicles/all"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer les vehicule disponible" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Véhicules récupéré avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "aucun véhicule disponible trouvé" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "findAvalilableVehicle", null);
__decorate([
    (0, common_1.Get)("types/available"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer les types de véhicules disponibles" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Types de véhicules disponibles récupérés avec succès",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "getAvailableVehicleTypes", null);
__decorate([
    (0, common_1.Get)("categories/available"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Récupérer les catégories de véhicules disponibles",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Catégories de véhicules disponibles récupérées avec succès",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "getAvailableCategories", null);
__decorate([
    (0, common_1.Get)("category/:category"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer les véhicules par catégorie" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Véhicules récupérés avec succès" }),
    __param(0, (0, common_1.Param)("category")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)("marque/:marque"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer les véhicules par marque" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Véhicules récupérés avec succès" }),
    __param(0, (0, common_1.Param)("marque")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "findByMarque", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour un véhicule" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Véhicule mis à jour avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Véhicule non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicule_dto_1.UpdateVehiculeDto]),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Supprimer un véhicule" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Véhicule supprimé avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Véhicule non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(":id/maintenances"),
    (0, swagger_1.ApiOperation)({ summary: "Ajouter une maintenance à un véhicule" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Maintenance ajoutée avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Véhicule non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_maintenance_dto_1.CreateMaintenanceDto]),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "addMaintenance", null);
__decorate([
    (0, common_1.Get)(":id/maintenances"),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer les maintenances d'un véhicule" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Maintenances récupérées avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Véhicule non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiculesController.prototype, "getMaintenances", null);
__decorate([
    (0, common_1.Get)(":id/photos"),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer les URLs des photos d'un véhicule" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "URLs des photos récupérées avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Véhicule non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehiculesController.prototype, "getVehiclePhotos", null);
__decorate([
    (0, common_1.Get)(":id/photos/:filename"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer une photo spécifique d'un véhicule" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Photo récupérée avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Véhicule ou photo non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("filename")),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], VehiculesController.prototype, "getVehiclePhoto", null);
exports.VehiculesController = VehiculesController = __decorate([
    (0, swagger_1.ApiTags)("vehicules"),
    (0, common_1.Controller)("vehicules"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [vehicules_service_1.VehiculesService])
], VehiculesController);
//# sourceMappingURL=vehicules.controller.js.map