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
exports.TransportGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
let TransportGateway = class TransportGateway {
    constructor(jwtService, prismaService) {
        this.jwtService = jwtService;
        this.prismaService = prismaService;
        this.logger = new common_1.Logger("TransportGateway");
        this.connectedClients = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token ||
                client.handshake.headers.authorization?.replace("Bearer ", "");
            if (!token && process.env.NODE_ENV === "development") {
                this.logger.warn(`Client ${client.id} connexion de test sans token (mode développement)`);
                this.connectedClients.set(client.id, {
                    userId: 999,
                    userType: "chauffeur",
                    socketId: client.id,
                });
                client.join("transport-updates");
                this.logger.log(`Client de test ${client.id} connecté en mode développement`);
                return;
            }
            if (!token) {
                this.logger.warn(`Client ${client.id} tentative de connexion sans token`);
                client.disconnect();
                return;
            }
            let payload;
            let userType = "client";
            try {
                payload = this.jwtService.verify(token, {
                    secret: process.env.JWT_SECRET_DRIVER,
                });
                const chauffeur = await this.prismaService.chauffeur.findUnique({
                    where: { id: payload.sub },
                });
                if (chauffeur) {
                    userType = "chauffeur";
                }
                else {
                    throw new Error("Not a driver");
                }
            }
            catch (error) {
                try {
                    payload = this.jwtService.verify(token, {
                        secret: process.env.JWT_SECRET_CLIENT,
                    });
                    const client = await this.prismaService.client.findUnique({
                        where: { id: payload.sub },
                    });
                    if (!client) {
                        throw new Error("Client not found");
                    }
                    userType = "client";
                }
                catch (clientError) {
                    this.logger.warn(`Client ${client.id} token invalide`);
                    client.disconnect();
                    return;
                }
            }
            if (!payload || !payload.sub) {
                this.logger.warn(`Client ${client.id} token invalide`);
                client.disconnect();
                return;
            }
            this.connectedClients.set(client.id, {
                userId: payload.sub,
                userType,
                socketId: client.id,
            });
            const chauffeur = await this.prismaService.chauffeur.findUnique({
                where: { id: payload.sub },
            });
            if (chauffeur) {
                userType = "chauffeur";
            }
            this.connectedClients.set(client.id, {
                userId: payload.sub,
                userType,
                socketId: client.id,
            });
            await client.join(`${userType}_${payload.sub}`);
            this.logger.log(`${userType} ${payload.sub} connecté avec socket ${client.id}`);
            client.emit("connected", {
                message: "Connexion établie avec succès",
                userType,
                userId: payload.sub,
            });
        }
        catch (error) {
            console.log(error);
            this.logger.error(`Erreur lors de la connexion du client ${client.id}:`, error.message);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const clientInfo = this.connectedClients.get(client.id);
        if (clientInfo) {
            this.logger.log(`${clientInfo.userType} ${clientInfo.userId} déconnecté`);
            this.connectedClients.delete(client.id);
        }
    }
    async handleJoinTransport(data, client) {
        const clientInfo = this.connectedClients.get(client.id);
        if (!clientInfo) {
            client.emit("error", { message: "Client non authentifié" });
            return;
        }
        try {
            const transport = await this.prismaService.transport.findUnique({
                where: { id: data.transportId },
                include: {
                    client: true,
                    chauffeur: true,
                    vehicule: true,
                },
            });
            if (!transport) {
                client.emit("error", { message: "Transport introuvable" });
                return;
            }
            let hasAccess = false;
            if (clientInfo.userType === "client") {
                hasAccess = transport.clientId === clientInfo.userId;
            }
            else if (clientInfo.userType === "chauffeur") {
                const chauffeur = await this.prismaService.chauffeur.findUnique({
                    where: { id: clientInfo.userId },
                });
                hasAccess = transport.vehiculeId === chauffeur?.vehiculeId;
            }
            if (!hasAccess) {
                client.emit("error", { message: "Accès non autorisé à ce transport" });
                return;
            }
            await client.join(`transport_${data.transportId}`);
            this.logger.log(`${clientInfo.userType} ${clientInfo.userId} a rejoint le transport ${data.transportId}`);
            if (transport.positionActuelle) {
                client.emit("position_update", {
                    transportId: data.transportId,
                    position: transport.positionActuelle,
                    timestamp: transport.updatedAt,
                    chauffeurId: transport.chauffeur?.id,
                });
            }
            client.emit("transport_joined", {
                transportId: data.transportId,
                message: "Vous suivez maintenant ce transport en temps réel",
                transport: {
                    id: transport.id,
                    status: transport.status,
                    positionActuelle: transport.positionActuelle,
                    chauffeur: {
                        id: transport.chauffeur?.id,
                        nom: transport.chauffeur?.nom,
                        prenom: transport.chauffeur?.prenom,
                    },
                    vehicule: transport.vehicule,
                },
            });
        }
        catch (error) {
            this.logger.error(`Erreur lors de la jonction au transport:`, error.message);
            client.emit("error", {
                message: "Erreur lors de la jonction au transport",
            });
        }
    }
    async handleLeaveTransport(data, client) {
        await client.leave(`transport_${data.transportId}`);
        const clientInfo = this.connectedClients.get(client.id);
        if (clientInfo) {
            this.logger.log(`${clientInfo.userType} ${clientInfo.userId} a quitté le transport ${data.transportId}`);
        }
        client.emit("transport_left", {
            transportId: data.transportId,
            message: "Vous ne suivez plus ce transport",
        });
    }
    async handleUpdatePosition(data, client) {
        const clientInfo = this.connectedClients.get(client.id);
        if (!clientInfo) {
            client.emit("error", { message: "Client non authentifié" });
            return;
        }
        if (clientInfo.userType !== "chauffeur") {
            client.emit("error", {
                message: "Seuls les chauffeurs peuvent mettre à jour leur position",
            });
            return;
        }
        try {
            const transport = await this.prismaService.transport.findUnique({
                where: { id: data.transportId },
                include: {
                    chauffeur: true,
                    client: true,
                },
            });
            const chauffeur = await this.prismaService.chauffeur.findUnique({
                where: { id: clientInfo.userId },
            });
            if (!transport) {
                client.emit("error", { message: "Transport introuvable" });
                return;
            }
            if (transport.vehiculeId !== chauffeur.vehiculeId) {
                client.emit("error", { message: "Accès non autorisé à ce transport" });
                return;
            }
            const position = { lat: data.latitude, lng: data.longitude };
            const timestamp = new Date();
            await this.prismaService.transport.update({
                where: { id: data.transportId },
                data: {
                    positionActuelle: position,
                    updatedAt: timestamp,
                },
            });
            const positionUpdateEvent = {
                transportId: data.transportId,
                chauffeurId: clientInfo.userId,
                position: position,
                timestamp: timestamp,
                statusInfo: data.statusInfo,
            };
            this.server
                .to(`transport_${data.transportId}`)
                .emit("position_update", positionUpdateEvent);
            this.logger.log(`Position mise à jour via WebSocket pour le transport ${data.transportId}:`, {
                lat: position.lat,
                lng: position.lng,
                chauffeurId: clientInfo.userId,
                timestamp: timestamp,
            });
            client.emit("position_updated", {
                transportId: data.transportId,
                position: position,
                timestamp: timestamp,
                message: "Position mise à jour avec succès",
            });
        }
        catch (error) {
            this.logger.error(`Erreur lors de la mise à jour de position:`, error.message);
            client.emit("error", {
                message: "Erreur lors de la mise à jour de position",
            });
        }
    }
    async handleGetCurrentPosition(data, client) {
        const clientInfo = this.connectedClients.get(client.id);
        if (!clientInfo) {
            client.emit("error", { message: "Client non authentifié" });
            return;
        }
        try {
            const transport = await this.prismaService.transport.findUnique({
                where: { id: data.transportId },
                select: {
                    id: true,
                    positionActuelle: true,
                    updatedAt: true,
                    clientId: true,
                    vehiculeId: true,
                    chauffeur: {
                        select: {
                            id: true,
                            vehiculeId: true,
                        },
                    },
                },
            });
            if (!transport) {
                client.emit("error", { message: "Transport introuvable" });
                return;
            }
            let hasAccess = false;
            if (clientInfo.userType === "client") {
                hasAccess = transport.clientId === clientInfo.userId;
            }
            else if (clientInfo.userType === "chauffeur") {
                const chauffeur = await this.prismaService.chauffeur.findUnique({
                    where: { id: clientInfo.userId },
                    select: { vehiculeId: true },
                });
                hasAccess = transport.vehiculeId === chauffeur?.vehiculeId;
            }
            if (!hasAccess) {
                client.emit("error", { message: "Accès non autorisé à ce transport" });
                return;
            }
            client.emit("current_position", {
                transportId: data.transportId,
                position: transport.positionActuelle,
                timestamp: transport.updatedAt,
                hasPosition: !!transport.positionActuelle,
            });
            this.logger.log(`Position actuelle récupérée pour le transport ${data.transportId} par ${clientInfo.userType} ${clientInfo.userId}`);
        }
        catch (error) {
            this.logger.error(`Erreur lors de la récupération de position:`, error.message);
            client.emit("error", {
                message: "Erreur lors de la récupération de la position",
            });
        }
    }
    async emitPositionUpdate(transportId, positionData) {
        this.server
            .to(`transport_${transportId}`)
            .emit("position_update", positionData);
        this.logger.log(`Mise à jour de position émise pour le transport ${transportId}:`, {
            lat: positionData.position.lat,
            lng: positionData.position.lng,
            timestamp: positionData.timestamp,
        });
    }
    async emitStatusUpdate(transportId, statusData) {
        this.server
            .to(`transport_${transportId}`)
            .emit("status_update", statusData);
        this.logger.log(`Mise à jour de statut émise pour le transport ${transportId}:`, statusData);
    }
    async notifyClient(clientId, message, data) {
        this.server.to(`client_${clientId}`).emit("notification", {
            message,
            data,
            timestamp: new Date(),
        });
    }
    async notifyChauffeur(chauffeurId, message, data) {
        this.server.to(`chauffeur_${chauffeurId}`).emit("notification", {
            message,
            data,
            timestamp: new Date(),
        });
    }
    async notifyTransportParticipants(transportId, message, data) {
        this.server.to(`transport_${transportId}`).emit("transport_notification", {
            transportId,
            message,
            data,
            timestamp: new Date(),
        });
    }
    async emitETAUpdate(transportId, etaData) {
        this.server.to(`transport_${transportId}`).emit("eta_update", {
            transportId,
            ...etaData,
            timestamp: new Date(),
        });
        this.logger.log(`ETA mise à jour pour le transport ${transportId}:`, etaData);
    }
    async startRealTimeTracking(transportId) {
        this.server.to(`transport_${transportId}`).emit("tracking_started", {
            transportId,
            message: "Le suivi en temps réel a commencé",
            timestamp: new Date(),
        });
    }
    async stopRealTimeTracking(transportId) {
        this.server.to(`transport_${transportId}`).emit("tracking_stopped", {
            transportId,
            message: "Le suivi en temps réel s'est arrêté",
            timestamp: new Date(),
        });
    }
    getConnectedClientsForTransport(transportId) {
        const connectedClients = [];
        this.server.sockets.adapter.rooms
            .get(`transport_${transportId}`)
            ?.forEach((socketId) => {
            const clientInfo = this.connectedClients.get(socketId);
            if (clientInfo) {
                connectedClients.push(clientInfo);
            }
        });
        return connectedClients;
    }
};
exports.TransportGateway = TransportGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TransportGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("join_transport"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TransportGateway.prototype, "handleJoinTransport", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("leave_transport"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TransportGateway.prototype, "handleLeaveTransport", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("update_position"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TransportGateway.prototype, "handleUpdatePosition", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("get_current_position"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TransportGateway.prototype, "handleGetCurrentPosition", null);
exports.TransportGateway = TransportGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        namespace: "/transport",
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], TransportGateway);
//# sourceMappingURL=transport.gateway.js.map