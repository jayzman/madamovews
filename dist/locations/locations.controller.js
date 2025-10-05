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
exports.LocationsController = void 0;
const common_1 = require("@nestjs/common");
const locations_service_1 = require("./locations.service");
const create_location_dto_1 = require("./dto/create-location.dto");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
let LocationsController = class LocationsController {
    constructor(locationsService) {
        this.locationsService = locationsService;
    }
    create(createLocationDto) {
        return this.locationsService.create(createLocationDto);
    }
    findAll(skip, take, status, clientId, vehiculeId, dateDebut, dateFin) {
        const filters = {};
        if (status) {
            filters.status = status;
        }
        if (clientId) {
            filters.clientId = Number.parseInt(clientId);
        }
        if (vehiculeId) {
            filters.vehiculeId = Number.parseInt(vehiculeId);
        }
        if (dateDebut || dateFin) {
            filters.dateDebut = {};
            if (dateDebut) {
                filters.dateDebut.gte = new Date(dateDebut);
            }
            if (dateFin) {
                filters.dateFin = { lte: new Date(dateFin) };
            }
        }
        return this.locationsService.findAll({
            skip: skip ? Number.parseInt(skip) : undefined,
            take: take ? Number.parseInt(take) : undefined,
            where: Object.keys(filters).length > 0 ? filters : undefined,
            orderBy: { createdAt: "desc" },
        });
    }
    findOne(id) {
        return this.locationsService.findOne(+id);
    }
    confirmLocation(id) {
        return this.locationsService.confirmLocation(+id);
    }
    startLocation(id) {
        return this.locationsService.startLocation(+id);
    }
    endLocation(id) {
        return this.locationsService.endLocation(+id);
    }
    cancelLocation(id) {
        return this.locationsService.cancelLocation(+id);
    }
    handleStripeWebhook(request) {
        const signature = request.headers['stripe-signature'];
        const payload = request.rawBody;
        try {
            const event = this.locationsService.stripeService.constructEventFromPayload(signature, payload);
            return this.locationsService.handleStripeWebhook(event);
        }
        catch (error) {
            console.error('Erreur webhook:', error);
            return { error: error.message };
        }
    }
};
exports.LocationsController = LocationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une nouvelle location de véhicule' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Location créée avec succès, retourne l\'URL de paiement Stripe' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides ou véhicule non disponible' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client ou véhicule non trouvé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_location_dto_1.CreateLocationDto]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer la liste des locations de véhicule' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des locations récupérée avec succès' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, description: 'Nombre d\'enregistrements à ignorer' }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, description: 'Nombre d\'enregistrements à récupérer' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filtrer par statut de la location' }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false, description: 'Filtrer par ID du client' }),
    (0, swagger_1.ApiQuery)({ name: 'vehiculeId', required: false, description: 'Filtrer par ID du véhicule' }),
    (0, swagger_1.ApiQuery)({ name: 'dateDebut', required: false, description: 'Date de début (format: YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'dateFin', required: false, description: 'Date de fin (format: YYYY-MM-DD)' }),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('clientId')),
    __param(4, (0, common_1.Query)('vehiculeId')),
    __param(5, (0, common_1.Query)('dateDebut')),
    __param(6, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer une location de véhicule par son ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Location récupérée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Location non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/confirmation'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirmer une location de véhicule' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Location confirmée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Location non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "confirmLocation", null);
__decorate([
    (0, common_1.Post)(':id/debut'),
    (0, swagger_1.ApiOperation)({ summary: 'Démarrer une location de véhicule' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Location démarrée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'La location n\'est pas confirmée' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Location non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "startLocation", null);
__decorate([
    (0, common_1.Post)(':id/fin'),
    (0, swagger_1.ApiOperation)({ summary: 'Terminer une location de véhicule' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Location terminée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'La location n\'est pas en cours' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Location non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "endLocation", null);
__decorate([
    (0, common_1.Post)(':id/annulation'),
    (0, swagger_1.ApiOperation)({ summary: 'Annuler une location de véhicule' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Location annulée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Impossible d\'annuler une location terminée' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Location non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "cancelLocation", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint pour les webhooks Stripe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook traité avec succès' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "handleStripeWebhook", null);
exports.LocationsController = LocationsController = __decorate([
    (0, swagger_1.ApiTags)('locations'),
    (0, common_1.Controller)('locations'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [locations_service_1.LocationsService])
], LocationsController);
//# sourceMappingURL=locations.controller.js.map