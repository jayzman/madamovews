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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const create_notification_dto_1 = require("./dto/create-notification.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    create(createNotificationDto) {
        return this.notificationsService.create(createNotificationDto);
    }
    findAll(skip, take) {
        return this.notificationsService.findAll(skip ? parseInt(skip) : 0, take ? parseInt(take) : 10);
    }
    findAllForUser(userId, skip, take) {
        return this.notificationsService.findAllForUser(userId, skip ? parseInt(skip) : 0, take ? parseInt(take) : 10);
    }
    findAllForChauffeur(chauffeurId, skip, take) {
        return this.notificationsService.findAllForChauffeur(chauffeurId, skip ? parseInt(skip) : 0, take ? parseInt(take) : 10);
    }
    findAllForClient(clientId, skip, take) {
        return this.notificationsService.findAllForClient(clientId, skip ? parseInt(skip) : 0, take ? parseInt(take) : 10);
    }
    findOne(id) {
        return this.notificationsService.findOne(id);
    }
    markAsRead(id) {
        return this.notificationsService.markAsRead(id);
    }
    markAllAsReadForUser(userId) {
        return this.notificationsService.markAllAsReadForUser(userId);
    }
    markAllAsReadForChauffeur(chauffeurId) {
        return this.notificationsService.markAllAsReadForChauffeur(chauffeurId);
    }
    markAllAsReadForClient(clientId) {
        return this.notificationsService.markAllAsReadForClient(clientId);
    }
    remove(id) {
        return this.notificationsService.remove(id);
    }
    createSpecialOffer(data) {
        return this.notificationsService.createSpecialOfferNotification(data.clientIds || null, data.chauffeurIds || null, data.titre, data.message, data.offreDetails);
    }
    createSystemNotification(data) {
        return this.notificationsService.createSystemNotification(data.userId || null, data.clientId || null, data.chauffeurId || null, data.titre, data.message, data.donnees);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une nouvelle notification' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notification créée avec succès' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer toutes les notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des notifications récupérée avec succès' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number }),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les notifications d\'un utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications de l\'utilisateur récupérées avec succès' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "findAllForUser", null);
__decorate([
    (0, common_1.Get)('chauffeur/:chauffeurId'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les notifications d\'un chauffeur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications du chauffeur récupérées avec succès' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number }),
    __param(0, (0, common_1.Param)('chauffeurId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "findAllForChauffeur", null);
__decorate([
    (0, common_1.Get)('client/:clientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les notifications d\'un client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications du client récupérées avec succès' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number }),
    __param(0, (0, common_1.Param)('clientId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "findAllForClient", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer une notification par son ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification récupérée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification non trouvée' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marquer une notification comme lue' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marquée comme lue' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification non trouvée' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('user/:userId/read-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Marquer toutes les notifications d\'un utilisateur comme lues' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Toutes les notifications de l\'utilisateur ont été marquées comme lues' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAllAsReadForUser", null);
__decorate([
    (0, common_1.Patch)('chauffeur/:chauffeurId/read-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Marquer toutes les notifications d\'un chauffeur comme lues' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Toutes les notifications du chauffeur ont été marquées comme lues' }),
    __param(0, (0, common_1.Param)('chauffeurId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAllAsReadForChauffeur", null);
__decorate([
    (0, common_1.Patch)('client/:clientId/read-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Marquer toutes les notifications d\'un client comme lues' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Toutes les notifications du client ont été marquées comme lues' }),
    __param(0, (0, common_1.Param)('clientId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAllAsReadForClient", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification supprimée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification non trouvée' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('special-offer'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une notification pour une offre spéciale' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notifications d\'offre spéciale créées avec succès' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "createSpecialOffer", null);
__decorate([
    (0, common_1.Post)('system'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une notification système' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notification système créée avec succès' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "createSystemNotification", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map