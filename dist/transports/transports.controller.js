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
exports.TransportsController = void 0;
const common_1 = require("@nestjs/common");
const transports_service_1 = require("./transports.service");
const create_transport_dto_1 = require("./dto/create-transport.dto");
const create_transport_message_dto_1 = require("./dto/create-transport-message.dto");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const skip_auth_decorator_1 = require("../auth/decorators/skip-auth.decorator");
let TransportsController = class TransportsController {
    constructor(transportsService) {
        this.transportsService = transportsService;
    }
    findAll(skip, take, status, chauffeurId, clientId, vehiculeId, dateDebut, dateFin) {
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
        if (vehiculeId) {
            filters.vehiculeId = Number.parseInt(vehiculeId);
        }
        if (dateDebut || dateFin) {
            filters.createdAt = {};
            if (dateDebut) {
                filters.createdAt.gte = new Date(dateDebut);
            }
            if (dateFin) {
                filters.createdAt.lte = new Date(dateFin);
            }
        }
        return this.transportsService.findAll({
            skip: skip ? Number.parseInt(skip) : undefined,
            take: take ? Number.parseInt(take) : undefined,
            where: Object.keys(filters).length > 0 ? filters : undefined,
            orderBy: { createdAt: "desc" },
        });
    }
    findOne(id) {
        return this.transportsService.findOne(+id);
    }
    create(createTransportDto) {
        return this.transportsService.create(createTransportDto);
    }
    validerTransport(id, chauffeurId) {
        return this.transportsService.validerTransport(+id, +chauffeurId);
    }
    updatePosition(id, position) {
        return this.transportsService.updatePosition(+id, position.latitude, position.longitude, position.statusInfo);
    }
    getCurrentPosition(id) {
        return this.transportsService.getCurrentPosition(+id);
    }
    getPositionHistory(id, limit) {
        return this.transportsService.getPositionHistory(+id, limit ? +limit : undefined);
    }
    startAutomaticTracking(id) {
        return this.transportsService.startAutomaticTracking(+id);
    }
    stopAutomaticTracking(id) {
        return this.transportsService.stopAutomaticTracking(+id);
    }
    trackTransportRealTime(id, chauffeurId) {
        return this.transportsService.trackTransportRealTime(+id, +chauffeurId);
    }
    getTrackingStatistics() {
        return this.transportsService.getTrackingStatistics();
    }
    updateStatus(id, data) {
        return this.transportsService.updateStatus(+id, data.status);
    }
    evaluerTransport(id, data) {
        return this.transportsService.evaluerTransport(+id, data.evaluation, data.commentaire);
    }
    async confirmPayment(id) {
        return this.transportsService.confirmPayment(+id);
    }
    finalizeTransportAfterPaymentSetup(data) {
        return this.transportsService.finalizeTransportAfterPaymentSetup(data.transportId, data.sessionId);
    }
    async startTransport(id) {
        return this.transportsService.startTransport(+id);
    }
    async endTransport(id) {
        return this.transportsService.endTransport(+id);
    }
    async createTransportMessage(id, data) {
        return this.transportsService.createTransportMessage(+id, data.contenu, data.expediteurType, data.expediteurId);
    }
    async getTransportMessages(id, userId, userType, skip, take) {
        return this.transportsService.getTransportMessages(+id, +userId, userType, skip ? +skip : 0, take ? +take : 50);
    }
    async getTransportUnreadCount(id, userId, userType) {
        return this.transportsService.getTransportUnreadCount(+id, +userId, userType);
    }
    async markAllMessagesAsRead(id, userId, userType) {
        return this.transportsService.markAllMessagesAsRead(+id, +userId, userType);
    }
    async getTransportConversations(userId, userType) {
        return this.transportsService.getTransportConversations(+userId, userType);
    }
    async getTotalUnreadMessagesCount(userId, userType) {
        return this.transportsService.getTotalUnreadMessagesCount(+userId, userType);
    }
    async sendQuickMessage(id, data) {
        return this.transportsService.sendQuickMessage(+id, data.expediteurType, data.expediteurId, data.messageType);
    }
    async getTransportWithMessages(id) {
        return this.transportsService.findOne(+id);
    }
    async confirmCashPayment(id, data) {
        return this.transportsService.confirmCashPayment(+id, data.chauffeurId, data.montantRecu);
    }
    async validatePromoCode(data) {
        return this.transportsService.validatePromoCode(data.code, data.montantCourse);
    }
};
exports.TransportsController = TransportsController;
__decorate([
    (0, common_1.Get)(),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer la liste des transports" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Liste des transports récupérée avec succès",
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
        name: "status",
        required: false,
        description: "Filtrer par statut du transport",
    }),
    (0, swagger_1.ApiQuery)({
        name: "chauffeurId",
        required: false,
        description: "Filtrer par ID du chauffeur",
    }),
    (0, swagger_1.ApiQuery)({
        name: "clientId",
        required: false,
        description: "Filtrer par ID du client",
    }),
    (0, swagger_1.ApiQuery)({
        name: "vehiculeId",
        required: false,
        description: "Filtrer par ID du véhicule",
    }),
    (0, swagger_1.ApiQuery)({
        name: "dateDebut",
        required: false,
        description: "Date de début (format: YYYY-MM-DD)",
    }),
    (0, swagger_1.ApiQuery)({
        name: "dateFin",
        required: false,
        description: "Date de fin (format: YYYY-MM-DD)",
    }),
    __param(0, (0, common_1.Query)("skip")),
    __param(1, (0, common_1.Query)("take")),
    __param(2, (0, common_1.Query)("status")),
    __param(3, (0, common_1.Query)("chauffeurId")),
    __param(4, (0, common_1.Query)("clientId")),
    __param(5, (0, common_1.Query)("vehiculeId")),
    __param(6, (0, common_1.Query)("dateDebut")),
    __param(7, (0, common_1.Query)("dateFin")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer un transport par son ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Transport récupéré avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Créer une nouvelle demande de transport" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Transport créé avec succès" }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Données invalides ou véhicule non disponible",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Client ou véhicule non trouvé" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transport_dto_1.CreateTransportDto]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(":id/valider/:chauffeurId"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Valider une demande de transport par un chauffeur",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Transport validé avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("chauffeurId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "validerTransport", null);
__decorate([
    (0, common_1.Patch)(":id/position"),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour la position actuelle du chauffeur" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Position mise à jour avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "updatePosition", null);
__decorate([
    (0, common_1.Get)(":id/position"),
    (0, swagger_1.ApiOperation)({ summary: "Obtenir la position actuelle du transport" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Position récupérée avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "getCurrentPosition", null);
__decorate([
    (0, common_1.Get)(":id/position/history"),
    (0, swagger_1.ApiOperation)({ summary: "Obtenir l'historique des positions du transport" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Historique des positions récupéré avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    (0, swagger_1.ApiQuery)({
        name: "limit",
        required: false,
        description: "Nombre maximum de positions à retourner",
    }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "getPositionHistory", null);
__decorate([
    (0, common_1.Post)(":id/tracking/start"),
    (0, swagger_1.ApiOperation)({ summary: "Démarrer le suivi automatique en temps réel" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Suivi automatique démarré avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "startAutomaticTracking", null);
__decorate([
    (0, common_1.Post)(":id/tracking/stop"),
    (0, swagger_1.ApiOperation)({ summary: "Arrêter le suivi automatique en temps réel" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Suivi automatique arrêté avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "stopAutomaticTracking", null);
__decorate([
    (0, common_1.Get)(":id/tracking/:chauffeurId"),
    (0, swagger_1.ApiOperation)({ summary: "Activer le suivi temps réel pour un chauffeur" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Suivi temps réel activé avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("chauffeurId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "trackTransportRealTime", null);
__decorate([
    (0, common_1.Get)("tracking/statistics"),
    (0, swagger_1.ApiOperation)({ summary: "Obtenir les statistiques de suivi en temps réel" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Statistiques récupérées avec succès",
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "getTrackingStatistics", null);
__decorate([
    (0, common_1.Patch)(":id/status"),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour le statut du transport" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Statut mis à jour avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                status: {
                    type: "string",
                    enum: Object.values(client_1.StatutTransport),
                    example: client_1.StatutTransport.EN_COURSE,
                },
            },
            required: ["status"],
        },
    }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(":id/evaluer"),
    (0, swagger_1.ApiOperation)({ summary: "Évaluer un transport terminé" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Évaluation enregistrée avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Transport non terminé" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "evaluerTransport", null);
__decorate([
    (0, common_1.Post)(":id/confirmer-paiement"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Confirmer le paiement d'un transport" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Paiement confirmé avec succès" }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Paiement non autorisé ou transport non disponible",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Post)("finalize-payment-setup"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Finaliser le transport après configuration du moyen de paiement",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Transport finalisé avec succès" }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Configuration du moyen de paiement incomplète",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                transportId: { type: "number", example: 123 },
                sessionId: { type: "string", example: "sess_abc123xyz" },
            },
            required: ["transportId", "sessionId"],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TransportsController.prototype, "finalizeTransportAfterPaymentSetup", null);
__decorate([
    (0, common_1.Post)(":id/start"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Démarrer un transport" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Transport démarré avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "startTransport", null);
__decorate([
    (0, common_1.Post)(":id/end"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Terminer un transport et calculer le montant final",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Transport terminé avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "endTransport", null);
__decorate([
    (0, common_1.Post)(":id/messages"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Envoyer un message dans le contexte d'un transport",
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Message envoyé avec succès" }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Données invalides ou accès non autorisé",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_transport_message_dto_1.CreateTransportMessageDto]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "createTransportMessage", null);
__decorate([
    (0, common_1.Get)(":id/messages"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer les messages d'un transport" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Messages récupérés avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Accès non autorisé" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    (0, swagger_1.ApiQuery)({
        name: "userId",
        required: true,
        type: "number",
        description: "ID de l'utilisateur",
    }),
    (0, swagger_1.ApiQuery)({
        name: "userType",
        required: true,
        enum: ["CLIENT", "CHAUFFEUR"],
        description: "Type d'utilisateur",
    }),
    (0, swagger_1.ApiQuery)({
        name: "skip",
        required: false,
        type: "number",
        description: "Nombre d'éléments à ignorer",
    }),
    (0, swagger_1.ApiQuery)({
        name: "take",
        required: false,
        type: "number",
        description: "Nombre d'éléments à récupérer",
    }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("userId")),
    __param(2, (0, common_1.Query)("userType")),
    __param(3, (0, common_1.Query)("skip")),
    __param(4, (0, common_1.Query)("take")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "getTransportMessages", null);
__decorate([
    (0, common_1.Get)(":id/messages/unread"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Obtenir le nombre de messages non lus pour un transport",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Nombre de messages non lus récupéré avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Accès non autorisé" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    (0, swagger_1.ApiQuery)({
        name: "userId",
        required: true,
        type: "number",
        description: "ID de l'utilisateur",
    }),
    (0, swagger_1.ApiQuery)({
        name: "userType",
        required: true,
        enum: ["CLIENT", "CHAUFFEUR"],
        description: "Type d'utilisateur",
    }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("userId")),
    __param(2, (0, common_1.Query)("userType")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "getTransportUnreadCount", null);
__decorate([
    (0, common_1.Post)(":id/messages/mark-read"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Marquer tous les messages d'un transport comme lus",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Messages marqués comme lus avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Accès non autorisé" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    (0, swagger_1.ApiQuery)({
        name: "userId",
        required: true,
        type: "number",
        description: "ID de l'utilisateur",
    }),
    (0, swagger_1.ApiQuery)({
        name: "userType",
        required: true,
        enum: ["CLIENT", "CHAUFFEUR"],
        description: "Type d'utilisateur",
    }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("userId")),
    __param(2, (0, common_1.Query)("userType")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "markAllMessagesAsRead", null);
__decorate([
    (0, common_1.Get)("conversations/:userId/:userType"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Obtenir toutes les conversations de transport d'un utilisateur",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Conversations récupérées avec succès",
    }),
    (0, swagger_1.ApiParam)({
        name: "userId",
        type: "number",
        description: "ID de l'utilisateur",
    }),
    (0, swagger_1.ApiParam)({
        name: "userType",
        enum: ["CLIENT", "CHAUFFEUR"],
        description: "Type d'utilisateur",
    }),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Param)("userType")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "getTransportConversations", null);
__decorate([
    (0, common_1.Get)("messages/unread-total/:userId/:userType"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Obtenir le nombre total de messages non lus d'un utilisateur",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Nombre de messages non lus récupéré avec succès",
    }),
    (0, swagger_1.ApiParam)({
        name: "userId",
        type: "number",
        description: "ID de l'utilisateur",
    }),
    (0, swagger_1.ApiParam)({
        name: "userType",
        enum: ["CLIENT", "CHAUFFEUR"],
        description: "Type d'utilisateur",
    }),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Param)("userType")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "getTotalUnreadMessagesCount", null);
__decorate([
    (0, common_1.Post)(":id/messages/quick"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Envoyer un message rapide prédéfini" }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: "Message rapide envoyé avec succès",
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Données invalides ou accès non autorisé",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                expediteurType: {
                    type: "string",
                    enum: ["CLIENT", "CHAUFFEUR"],
                    example: "CHAUFFEUR",
                },
                expediteurId: {
                    type: "number",
                    example: 1,
                },
                messageType: {
                    type: "string",
                    enum: ["ARRIVED", "DELAYED", "STARTED", "FINISHED"],
                    example: "ARRIVED",
                },
            },
            required: ["expediteurType", "expediteurId", "messageType"],
        },
    }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "sendQuickMessage", null);
__decorate([
    (0, common_1.Get)(":id/chat"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Obtenir les détails du transport avec les messages pour le chat",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Détails du transport avec messages récupérés avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "getTransportWithMessages", null);
__decorate([
    (0, common_1.Post)(":id/confirm-cash-payment"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Confirmer le paiement en espèces pour un transport terminé",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Paiement en espèces confirmé avec succès",
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Transport non terminé ou mode de paiement incorrect",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Transport non trouvé" }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                chauffeurId: {
                    type: "number",
                    example: 1,
                    description: "ID du chauffeur confirmant le paiement",
                },
                montantRecu: {
                    type: "number",
                    example: 25.5,
                    description: "Montant reçu en espèces",
                },
            },
            required: ["chauffeurId", "montantRecu"],
        },
    }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "confirmCashPayment", null);
__decorate([
    (0, common_1.Post)("validate-promo-code"),
    (0, swagger_1.ApiOperation)({ summary: "Valider un code promo pour un montant donné" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Code promo validé avec informations de réduction",
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Code promo invalide" }),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                code: { type: "string", example: "PROMO2025" },
                montantCourse: { type: "number", example: 100.5 },
            },
            required: ["code", "montantCourse"],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransportsController.prototype, "validatePromoCode", null);
exports.TransportsController = TransportsController = __decorate([
    (0, swagger_1.ApiTags)("transports"),
    (0, common_1.Controller)("transports"),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [transports_service_1.TransportsService])
], TransportsController);
//# sourceMappingURL=transports.controller.js.map