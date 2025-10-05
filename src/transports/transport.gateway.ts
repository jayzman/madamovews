import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { PositionUpdateEventDto } from "./dto/update-position.dto";

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  namespace: "/transport",
})
export class TransportGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger("TransportGateway");
  private connectedClients = new Map<
    string,
    { userId: number; userType: "client" | "chauffeur"; socketId: string }
  >();

  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService
  ) {}
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token && process.env.NODE_ENV === "development") {
        this.logger.warn(
          `Client ${client.id} connexion de test sans token (mode développement)`
        );
        this.connectedClients.set(client.id, {
          userId: 999, // ID de test
          userType: "chauffeur",
          socketId: client.id,
        });
        client.join("transport-updates");
        this.logger.log(
          `Client de test ${client.id} connecté en mode développement`
        );
        return;
      }

      if (!token) {
        this.logger.warn(
          `Client ${client.id} tentative de connexion sans token`
        );
        client.disconnect();
        return;
      }

      let payload;
      let userType: "client" | "chauffeur" = "client";
      try {
        // Essayer d'abord avec le token chauffeur
        payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET_DRIVER,
        });

        // Vérifier si c'est vraiment un chauffeur
        const chauffeur = await this.prismaService.chauffeur.findUnique({
          where: { id: payload.sub },
        });

        if (chauffeur) {
          userType = "chauffeur";
        } else {
          // Si pas trouvé comme chauffeur, essayer comme client
          throw new Error("Not a driver");
        }
      } catch (error) {
        // Essayer avec le token client
        try {
          payload = this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET_CLIENT, // ou JWT_SECRET selon votre config
          });

          // Vérifier si c'est un client valide
          const client = await this.prismaService.client.findUnique({
            where: { id: payload.sub },
          });

          if (!client) {
            throw new Error("Client not found");
          }

          userType = "client";
        } catch (clientError) {
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

      // Rejoindre une room spécifique selon le type d'utilisateur
      await client.join(`${userType}_${payload.sub}`);

      this.logger.log(
        `${userType} ${payload.sub} connecté avec socket ${client.id}`
      );

      // Envoyer une confirmation de connexion
      client.emit("connected", {
        message: "Connexion établie avec succès",
        userType,
        userId: payload.sub,
      });
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Erreur lors de la connexion du client ${client.id}:`,
        error.message
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      this.logger.log(`${clientInfo.userType} ${clientInfo.userId} déconnecté`);
      this.connectedClients.delete(client.id);
    }
  }

  @SubscribeMessage("join_transport")
  async handleJoinTransport(
    @MessageBody() data: { transportId: number },
    @ConnectedSocket() client: Socket
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) {
      client.emit("error", { message: "Client non authentifié" });
      return;
    }

    try {
      // Vérifier que l'utilisateur a accès à ce transport
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
        // Vérifier si le client a accès à ce transport
        hasAccess = transport.clientId === clientInfo.userId;
      } else if (clientInfo.userType === "chauffeur") {
        // Vérifier si le chauffeur a accès à ce transport
        const chauffeur = await this.prismaService.chauffeur.findUnique({
          where: { id: clientInfo.userId },
        });
        hasAccess = transport.vehiculeId === chauffeur?.vehiculeId;
      }

      if (!hasAccess) {
        client.emit("error", { message: "Accès non autorisé à ce transport" });
        return;
      }

      // Rejoindre la room du transport
      await client.join(`transport_${data.transportId}`);

      this.logger.log(
        `${clientInfo.userType} ${clientInfo.userId} a rejoint le transport ${data.transportId}`
      );

      // IMPORTANT : Envoyer la position actuelle si elle existe
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
    } catch (error) {
      this.logger.error(
        `Erreur lors de la jonction au transport:`,
        error.message
      );
      client.emit("error", {
        message: "Erreur lors de la jonction au transport",
      });
    }
  }
  @SubscribeMessage("leave_transport")
  async handleLeaveTransport(
    @MessageBody() data: { transportId: number },
    @ConnectedSocket() client: Socket
  ) {
    await client.leave(`transport_${data.transportId}`);

    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      this.logger.log(
        `${clientInfo.userType} ${clientInfo.userId} a quitté le transport ${data.transportId}`
      );
    }

    client.emit("transport_left", {
      transportId: data.transportId,
      message: "Vous ne suivez plus ce transport",
    });
  }

  @SubscribeMessage("update_position")
  async handleUpdatePosition(
    @MessageBody()
    data: {
      transportId: number;
      latitude: number;
      longitude: number;
      statusInfo?: string;
    },
    @ConnectedSocket() client: Socket
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) {
      client.emit("error", { message: "Client non authentifié" });
      return;
    }

    // Seuls les chauffeurs peuvent mettre à jour leur position
    if (clientInfo.userType !== "chauffeur") {
      client.emit("error", {
        message: "Seuls les chauffeurs peuvent mettre à jour leur position",
      });
      return;
    }

    try {
      // Vérifier que le chauffeur a accès à ce transport
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

      // Mettre à jour la position dans la base de données
      await this.prismaService.transport.update({
        where: { id: data.transportId },
        data: {
          positionActuelle: position,
          updatedAt: timestamp,
        },
      });

      // Créer l'événement de mise à jour de position
      const positionUpdateEvent: PositionUpdateEventDto = {
        transportId: data.transportId,
        chauffeurId: clientInfo.userId,
        position: position,
        timestamp: timestamp,
        statusInfo: data.statusInfo,
      };

      // Émettre la mise à jour à tous les clients suivant ce transport
      this.server
        .to(`transport_${data.transportId}`)
        .emit("position_update", positionUpdateEvent);

      this.logger.log(
        `Position mise à jour via WebSocket pour le transport ${data.transportId}:`,
        {
          lat: position.lat,
          lng: position.lng,
          chauffeurId: clientInfo.userId,
          timestamp: timestamp,
        }
      );

      // Confirmer la mise à jour au chauffeur
      client.emit("position_updated", {
        transportId: data.transportId,
        position: position,
        timestamp: timestamp,
        message: "Position mise à jour avec succès",
      });
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de position:`,
        error.message
      );
      client.emit("error", {
        message: "Erreur lors de la mise à jour de position",
      });
    }
  }

  @SubscribeMessage("get_current_position")
  async handleGetCurrentPosition(
    @MessageBody() data: { transportId: number },
    @ConnectedSocket() client: Socket
  ) {
    const clientInfo = this.connectedClients.get(client.id);

    if (!clientInfo) {
      client.emit("error", { message: "Client non authentifié" });
      return;
    }

    try {
      // Récupérer le transport avec sa position actuelle
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

      // Vérifier les permissions d'accès
      let hasAccess = false;

      if (clientInfo.userType === "client") {
        hasAccess = transport.clientId === clientInfo.userId;
      } else if (clientInfo.userType === "chauffeur") {
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

      // Retourner la position actuelle
      client.emit("current_position", {
        transportId: data.transportId,
        position: transport.positionActuelle,
        timestamp: transport.updatedAt,
        hasPosition: !!transport.positionActuelle,
      });

      this.logger.log(
        `Position actuelle récupérée pour le transport ${data.transportId} par ${clientInfo.userType} ${clientInfo.userId}`
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de position:`,
        error.message
      );
      client.emit("error", {
        message: "Erreur lors de la récupération de la position",
      });
    }
  }

  // Méthode pour émettre une mise à jour de position à tous les clients suivant un transport
  async emitPositionUpdate(
    transportId: number,
    positionData: PositionUpdateEventDto
  ) {
    this.server
      .to(`transport_${transportId}`)
      .emit("position_update", positionData);

    this.logger.log(
      `Mise à jour de position émise pour le transport ${transportId}:`,
      {
        lat: positionData.position.lat,
        lng: positionData.position.lng,
        timestamp: positionData.timestamp,
      }
    );
  }

  // Méthode pour émettre une mise à jour de statut
  async emitStatusUpdate(transportId: number, statusData: any) {
    this.server
      .to(`transport_${transportId}`)
      .emit("status_update", statusData);

    this.logger.log(
      `Mise à jour de statut émise pour le transport ${transportId}:`,
      statusData
    );
  }

  // Méthode pour notifier le client d'une mise à jour importante
  async notifyClient(clientId: number, message: string, data?: any) {
    this.server.to(`client_${clientId}`).emit("notification", {
      message,
      data,
      timestamp: new Date(),
    });
  }
  // Méthode pour notifier le chauffeur d'une mise à jour importante
  async notifyChauffeur(chauffeurId: number, message: string, data?: any) {
    this.server.to(`chauffeur_${chauffeurId}`).emit("notification", {
      message,
      data,
      timestamp: new Date(),
    });
  }

  // Méthode pour notifier tous les participants d'un transport
  async notifyTransportParticipants(
    transportId: number,
    message: string,
    data?: any
  ) {
    this.server.to(`transport_${transportId}`).emit("transport_notification", {
      transportId,
      message,
      data,
      timestamp: new Date(),
    });
  }

  // Méthode pour émettre une estimation de temps d'arrivée
  async emitETAUpdate(
    transportId: number,
    etaData: {
      estimatedArrival: Date;
      distanceRemaining: number;
      durationRemaining: number;
    }
  ) {
    this.server.to(`transport_${transportId}`).emit("eta_update", {
      transportId,
      ...etaData,
      timestamp: new Date(),
    });

    this.logger.log(
      `ETA mise à jour pour le transport ${transportId}:`,
      etaData
    );
  }

  // Méthode pour démarrer le suivi automatique pour un transport
  async startRealTimeTracking(transportId: number) {
    this.server.to(`transport_${transportId}`).emit("tracking_started", {
      transportId,
      message: "Le suivi en temps réel a commencé",
      timestamp: new Date(),
    });
  }

  // Méthode pour arrêter le suivi automatique pour un transport
  async stopRealTimeTracking(transportId: number) {
    this.server.to(`transport_${transportId}`).emit("tracking_stopped", {
      transportId,
      message: "Le suivi en temps réel s'est arrêté",
      timestamp: new Date(),
    });
  }

  // Obtenir la liste des clients connectés pour un transport
  getConnectedClientsForTransport(transportId: number): any[] {
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
}
