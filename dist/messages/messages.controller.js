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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const messages_service_1 = require("./messages.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const swagger_1 = require("@nestjs/swagger");
const client_jwt_auth_guard_1 = require("../clients/guards/client-jwt-auth.guard");
const passport_1 = require("@nestjs/passport");
let MessagesController = class MessagesController {
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    create(createMessageDto) {
        return this.messagesService.create(createMessageDto);
    }
    getReservationMessages(reservationId, clientId, chauffeurId, skip, take) {
        return this.messagesService.findAllForConversation({
            reservationId: +reservationId,
            clientId: clientId ? +clientId : undefined,
            chauffeurId: chauffeurId ? +chauffeurId : undefined,
            skip: skip ? +skip : 0,
            take: take ? +take : 50,
        });
    }
    getCourseMessages(courseId, clientId, chauffeurId, skip, take) {
        return this.messagesService.findAllForConversation({
            courseId: +courseId,
            clientId: clientId ? +clientId : undefined,
            chauffeurId: chauffeurId ? +chauffeurId : undefined,
            skip: skip ? +skip : 0,
            take: take ? +take : 50,
        });
    }
    getTransportMessages(transportId, clientId, chauffeurId, skip, take) {
        return this.messagesService.findAllForConversation({
            transportId: +transportId,
            clientId: clientId ? +clientId : undefined,
            chauffeurId: chauffeurId ? +chauffeurId : undefined,
            skip: skip ? +skip : 0,
            take: take ? +take : 50,
        });
    }
    getClientConversations(clientId) {
        return this.messagesService.getConversationsForClient(+clientId);
    }
    getChauffeurConversations(chauffeurId) {
        return this.messagesService.getConversationsForChauffeur(+chauffeurId);
    }
    getClientUnreadCount(clientId) {
        return this.messagesService.findUnreadCount(+clientId);
    }
    getChauffeurUnreadCount(chauffeurId) {
        return this.messagesService.findUnreadCount(undefined, +chauffeurId);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau message' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Message créé avec succès' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('conversation/reservation/:reservationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les messages d\'une conversation pour une réservation spécifique' }),
    (0, swagger_1.ApiParam)({ name: 'reservationId', type: 'number', description: 'ID de la réservation' }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false, type: 'number', description: 'ID du client (pour marquer les messages comme lus)' }),
    (0, swagger_1.ApiQuery)({ name: 'chauffeurId', required: false, type: 'number', description: 'ID du chauffeur (pour marquer les messages comme lus)' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: 'number', description: 'Nombre d\'enregistrements à ignorer' }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: 'number', description: 'Nombre d\'enregistrements à récupérer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Messages récupérés avec succès' }),
    __param(0, (0, common_1.Param)('reservationId')),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, common_1.Query)('chauffeurId')),
    __param(3, (0, common_1.Query)('skip')),
    __param(4, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getReservationMessages", null);
__decorate([
    (0, common_1.Get)('conversation/course/:courseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les messages d\'une conversation pour une course spécifique' }),
    (0, swagger_1.ApiParam)({ name: 'courseId', type: 'number', description: 'ID de la course' }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false, type: 'number', description: 'ID du client (pour marquer les messages comme lus)' }),
    (0, swagger_1.ApiQuery)({ name: 'chauffeurId', required: false, type: 'number', description: 'ID du chauffeur (pour marquer les messages comme lus)' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: 'number', description: 'Nombre d\'enregistrements à ignorer' }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: 'number', description: 'Nombre d\'enregistrements à récupérer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Messages récupérés avec succès' }),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, common_1.Query)('chauffeurId')),
    __param(3, (0, common_1.Query)('skip')),
    __param(4, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getCourseMessages", null);
__decorate([
    (0, common_1.Get)('conversation/transport/:transportId'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les messages d\'une conversation pour un transport spécifique' }),
    (0, swagger_1.ApiParam)({ name: 'transportId', type: 'number', description: 'ID du transport' }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', required: false, type: 'number', description: 'ID du client (pour marquer les messages comme lus)' }),
    (0, swagger_1.ApiQuery)({ name: 'chauffeurId', required: false, type: 'number', description: 'ID du chauffeur (pour marquer les messages comme lus)' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: 'number', description: 'Nombre d\'enregistrements à ignorer' }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: 'number', description: 'Nombre d\'enregistrements à récupérer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Messages récupérés avec succès' }),
    __param(0, (0, common_1.Param)('transportId')),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, common_1.Query)('chauffeurId')),
    __param(3, (0, common_1.Query)('skip')),
    __param(4, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getTransportMessages", null);
__decorate([
    (0, common_1.Get)('client/:clientId/conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer toutes les conversations d\'un client' }),
    (0, swagger_1.ApiParam)({ name: 'clientId', type: 'number', description: 'ID du client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversations récupérées avec succès' }),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getClientConversations", null);
__decorate([
    (0, common_1.Get)('chauffeur/:chauffeurId/conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer toutes les conversations d\'un chauffeur' }),
    (0, swagger_1.ApiParam)({ name: 'chauffeurId', type: 'number', description: 'ID du chauffeur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversations récupérées avec succès' }),
    __param(0, (0, common_1.Param)('chauffeurId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getChauffeurConversations", null);
__decorate([
    (0, common_1.Get)('client/:clientId/unread'),
    (0, swagger_1.ApiOperation)({ summary: 'Compter les messages non lus d\'un client' }),
    (0, swagger_1.ApiParam)({ name: 'clientId', type: 'number', description: 'ID du client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nombre de messages non lus récupéré avec succès' }),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getClientUnreadCount", null);
__decorate([
    (0, common_1.Get)('chauffeur/:chauffeurId/unread'),
    (0, swagger_1.ApiOperation)({ summary: 'Compter les messages non lus d\'un chauffeur' }),
    (0, swagger_1.ApiParam)({ name: 'chauffeurId', type: 'number', description: 'ID du chauffeur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nombre de messages non lus récupéré avec succès' }),
    __param(0, (0, common_1.Param)('chauffeurId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getChauffeurUnreadCount", null);
exports.MessagesController = MessagesController = __decorate([
    (0, swagger_1.ApiTags)('messages'),
    (0, common_1.Controller)('messages'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)(["jwt", "client-jwt"])),
    (0, common_1.UseGuards)(client_jwt_auth_guard_1.ClientJwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map