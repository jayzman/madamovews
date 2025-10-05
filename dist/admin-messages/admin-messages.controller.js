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
exports.AdminMessagesController = void 0;
const common_1 = require("@nestjs/common");
const admin_messages_service_1 = require("./admin-messages.service");
const create_admin_message_dto_1 = require("./dto/create-admin-message.dto");
const update_admin_message_dto_1 = require("./dto/update-admin-message.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const skip_auth_decorator_1 = require("../auth/decorators/skip-auth.decorator");
const query_admin_message_dto_1 = require("./dto/query-admin-message.dto");
let AdminMessagesController = class AdminMessagesController {
    constructor(adminMessagesService) {
        this.adminMessagesService = adminMessagesService;
    }
    create(createAdminMessageDto) {
        return this.adminMessagesService.create(createAdminMessageDto);
    }
    getConversation(userId, chauffeurId, queryDto) {
        return this.adminMessagesService.getConversation(userId, chauffeurId, queryDto.skip, queryDto.take);
    }
    getUserConversations(userId) {
        return this.adminMessagesService.getChauffeurConversations(userId);
    }
    getChauffeurConversations(chauffeurId) {
        return this.adminMessagesService.getUserConversations(chauffeurId);
    }
    findAllForUser(userId, queryDto) {
        const filters = queryDto.lu !== undefined ? { lu: queryDto.lu } : {};
        return this.adminMessagesService.findAllForUser(userId, queryDto.skip, queryDto.take, filters);
    }
    findAllForChauffeur(chauffeurId, queryDto) {
        const filters = queryDto.lu !== undefined ? { lu: queryDto.lu } : {};
        return this.adminMessagesService.findAllForChauffeur(chauffeurId, queryDto.skip, queryDto.take, filters);
    }
    findOne(id) {
        return this.adminMessagesService.findOne(id);
    }
    update(id, updateAdminMessageDto) {
        return this.adminMessagesService.update(id, updateAdminMessageDto);
    }
    remove(id) {
        return this.adminMessagesService.remove(id);
    }
    markAsRead(id) {
        return this.adminMessagesService.markAsRead(id);
    }
    getUserUnreadCount(userId) {
        return this.adminMessagesService.findUnreadCount(userId);
    }
    getChauffeurUnreadCount(chauffeurId) {
        return this.adminMessagesService.findUnreadCount(undefined, chauffeurId);
    }
};
exports.AdminMessagesController = AdminMessagesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau message entre admin et chauffeur' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Message créé avec succès' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_message_dto_1.CreateAdminMessageDto]),
    __metadata("design:returntype", void 0)
], AdminMessagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('user/:userId/chauffeur/:chauffeurId/conversation'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer une conversation entre un admin et un chauffeur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation récupérée avec succès' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'ID de l\'utilisateur admin' }),
    (0, swagger_1.ApiParam)({ name: 'chauffeurId', description: 'ID du chauffeur' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('chauffeurId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, query_admin_message_dto_1.QueryAdminMessageDto]),
    __metadata("design:returntype", void 0)
], AdminMessagesController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Get)('user/:userId/conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer toutes les conversations d\'un admin' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversations récupérées avec succès' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'ID de l\'utilisateur admin' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminMessagesController.prototype, "getUserConversations", null);
__decorate([
    (0, common_1.Get)('chauffeur/:chauffeurId/conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer toutes les conversations d\'un chauffeur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversations récupérées avec succès' }),
    (0, swagger_1.ApiParam)({ name: 'chauffeurId', description: 'ID du chauffeur' }),
    __param(0, (0, common_1.Param)('chauffeurId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminMessagesController.prototype, "getChauffeurConversations", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les messages d\'un utilisateur admin' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Messages récupérés avec succès' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'ID de l\'utilisateur admin' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'lu', required: false, description: 'Filtrer par statut de lecture' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, query_admin_message_dto_1.QueryAdminMessageDto]),
    __metadata("design:returntype", void 0)
], AdminMessagesController.prototype, "findAllForUser", null);
__decorate([
    (0, common_1.Get)('chauffeur/:chauffeurId'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les messages d\'un chauffeur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Messages récupérés avec succès' }),
    (0, swagger_1.ApiParam)({ name: 'chauffeurId', description: 'ID du chauffeur' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'lu', required: false, description: 'Filtrer par statut de lecture' }),
    __param(0, (0, common_1.Param)('chauffeurId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, query_admin_message_dto_1.QueryAdminMessageDto]),
    __metadata("design:returntype", void 0)
], AdminMessagesController.prototype, "findAllForChauffeur", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer un message par son ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message récupéré avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Message non trouvé' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminMessagesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un message' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message mis à jour avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Message non trouvé' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_admin_message_dto_1.UpdateAdminMessageDto]),
    __metadata("design:returntype", void 0)
], AdminMessagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un message' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message supprimé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Message non trouvé' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminMessagesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marquer un message comme lu' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message marqué comme lu avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Message non trouvé' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminMessagesController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Get)('user/:userId/unread'),
    (0, swagger_1.ApiOperation)({ summary: 'Compter les messages non lus d\'un utilisateur admin' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nombre de messages non lus récupéré avec succès' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminMessagesController.prototype, "getUserUnreadCount", null);
__decorate([
    (0, common_1.Get)('chauffeur/:chauffeurId/unread'),
    (0, swagger_1.ApiOperation)({ summary: 'Compter les messages non lus d\'un chauffeur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nombre de messages non lus récupéré avec succès' }),
    __param(0, (0, common_1.Param)('chauffeurId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminMessagesController.prototype, "getChauffeurUnreadCount", null);
exports.AdminMessagesController = AdminMessagesController = __decorate([
    (0, swagger_1.ApiTags)('admin-messages'),
    (0, common_1.Controller)('admin-messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, skip_auth_decorator_1.SkipAuth)(),
    __metadata("design:paramtypes", [admin_messages_service_1.AdminMessagesService])
], AdminMessagesController);
//# sourceMappingURL=admin-messages.controller.js.map