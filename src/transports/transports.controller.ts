import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import { TransportsService } from "./transports.service";
import { CreateTransportDto } from "./dto/create-transport.dto";
import { CreateTransportMessageDto } from "./dto/create-transport-message.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { StatutTransport } from "@prisma/client";
import { SkipAuth } from "../auth/decorators/skip-auth.decorator";

@ApiTags("transports")
@Controller("transports")
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransportsController {
  constructor(private readonly transportsService: TransportsService) {}

  @Get()
  @SkipAuth()
  @ApiOperation({ summary: "Récupérer la liste des transports" })
  @ApiResponse({
    status: 200,
    description: "Liste des transports récupérée avec succès",
  })
  @ApiQuery({
    name: "skip",
    required: false,
    description: "Nombre d'enregistrements à ignorer",
  })
  @ApiQuery({
    name: "take",
    required: false,
    description: "Nombre d'enregistrements à récupérer",
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filtrer par statut du transport",
  })
  @ApiQuery({
    name: "chauffeurId",
    required: false,
    description: "Filtrer par ID du chauffeur",
  })
  @ApiQuery({
    name: "clientId",
    required: false,
    description: "Filtrer par ID du client",
  })
  @ApiQuery({
    name: "vehiculeId",
    required: false,
    description: "Filtrer par ID du véhicule",
  })
  @ApiQuery({
    name: "dateDebut",
    required: false,
    description: "Date de début (format: YYYY-MM-DD)",
  })
  @ApiQuery({
    name: "dateFin",
    required: false,
    description: "Date de fin (format: YYYY-MM-DD)",
  })
  findAll(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @Query("status") status?: StatutTransport,
    @Query("chauffeurId") chauffeurId?: string,
    @Query("clientId") clientId?: string,
    @Query("vehiculeId") vehiculeId?: string,
    @Query("dateDebut") dateDebut?: string,
    @Query("dateFin") dateFin?: string
  ) {
    const filters: any = {};

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

  @Get(":id")
  @SkipAuth()
  @ApiOperation({ summary: "Récupérer un transport par son ID" })
  @ApiResponse({ status: 200, description: "Transport récupéré avec succès" })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  findOne(@Param("id") id: string) {
    return this.transportsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: "Créer une nouvelle demande de transport" })
  @ApiResponse({ status: 201, description: "Transport créé avec succès" })
  @ApiResponse({
    status: 400,
    description: "Données invalides ou véhicule non disponible",
  })
  @ApiResponse({ status: 404, description: "Client ou véhicule non trouvé" })
  create(@Body() createTransportDto: CreateTransportDto) {
    return this.transportsService.create(createTransportDto);
  }

  @Post(":id/valider/:chauffeurId")
  @SkipAuth()
  @ApiOperation({
    summary: "Valider une demande de transport par un chauffeur",
  })
  @ApiResponse({ status: 200, description: "Transport validé avec succès" })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  validerTransport(
    @Param("id") id: string,
    @Param("chauffeurId") chauffeurId: string
  ) {
    return this.transportsService.validerTransport(+id, +chauffeurId);
  }
  @Patch(":id/position")
  @ApiOperation({ summary: "Mettre à jour la position actuelle du chauffeur" })
  @ApiResponse({ status: 200, description: "Position mise à jour avec succès" })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  updatePosition(
    @Param("id") id: string,
    @Body()
    position: { latitude: number; longitude: number; statusInfo?: string }
  ) {
    return this.transportsService.updatePosition(
      +id,
      position.latitude,
      position.longitude,
      position.statusInfo
    );
  }

  @Get(":id/position")
  @ApiOperation({ summary: "Obtenir la position actuelle du transport" })
  @ApiResponse({ status: 200, description: "Position récupérée avec succès" })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  getCurrentPosition(@Param("id") id: string) {
    return this.transportsService.getCurrentPosition(+id);
  }

  @Get(":id/position/history")
  @ApiOperation({ summary: "Obtenir l'historique des positions du transport" })
  @ApiResponse({
    status: 200,
    description: "Historique des positions récupéré avec succès",
  })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Nombre maximum de positions à retourner",
  })
  getPositionHistory(@Param("id") id: string, @Query("limit") limit?: string) {
    return this.transportsService.getPositionHistory(
      +id,
      limit ? +limit : undefined
    );
  }

  @Post(":id/tracking/start")
  @ApiOperation({ summary: "Démarrer le suivi automatique en temps réel" })
  @ApiResponse({
    status: 200,
    description: "Suivi automatique démarré avec succès",
  })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  startAutomaticTracking(@Param("id") id: string) {
    return this.transportsService.startAutomaticTracking(+id);
  }

  @Post(":id/tracking/stop")
  @ApiOperation({ summary: "Arrêter le suivi automatique en temps réel" })
  @ApiResponse({
    status: 200,
    description: "Suivi automatique arrêté avec succès",
  })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  stopAutomaticTracking(@Param("id") id: string) {
    return this.transportsService.stopAutomaticTracking(+id);
  }
  @Get(":id/tracking/:chauffeurId")
  @ApiOperation({ summary: "Activer le suivi temps réel pour un chauffeur" })
  @ApiResponse({
    status: 200,
    description: "Suivi temps réel activé avec succès",
  })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  trackTransportRealTime(
    @Param("id") id: string,
    @Param("chauffeurId") chauffeurId: string
  ) {
    return this.transportsService.trackTransportRealTime(+id, +chauffeurId);
  }

  @Get("tracking/statistics")
  @ApiOperation({ summary: "Obtenir les statistiques de suivi en temps réel" })
  @ApiResponse({
    status: 200,
    description: "Statistiques récupérées avec succès",
  })
  getTrackingStatistics() {
    return this.transportsService.getTrackingStatistics();
  }

  @Patch(":id/status")
  @SkipAuth()
  @ApiOperation({ summary: "Mettre à jour le statut du transport" })
  @ApiResponse({ status: 200, description: "Statut mis à jour avec succès" })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: Object.values(StatutTransport),
          example: StatutTransport.EN_COURSE,
        },
      },
      required: ["status"],
    },
  })
  updateStatus(
    @Param("id") id: string,
    @Body() data: { status: StatutTransport }
  ) {
    return this.transportsService.updateStatus(+id, data.status);
  }

  @Post(":id/evaluer")
  @ApiOperation({ summary: "Évaluer un transport terminé" })
  @ApiResponse({
    status: 200,
    description: "Évaluation enregistrée avec succès",
  })
  @ApiResponse({ status: 400, description: "Transport non terminé" })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  evaluerTransport(
    @Param("id") id: string,
    @Body() data: { evaluation: number; commentaire?: string }
  ) {
    return this.transportsService.evaluerTransport(
      +id,
      data.evaluation,
      data.commentaire
    );
  }

  @Post(":id/confirmer-paiement")
  @SkipAuth()
  @ApiOperation({ summary: "Confirmer le paiement d'un transport" })
  @ApiResponse({ status: 200, description: "Paiement confirmé avec succès" })
  @ApiResponse({
    status: 400,
    description: "Paiement non autorisé ou transport non disponible",
  })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  async confirmPayment(@Param("id") id: string) {
    return this.transportsService.confirmPayment(+id);
  }

  @Post("finalize-payment-setup")
  @SkipAuth()
  @ApiOperation({
    summary: "Finaliser le transport après configuration du moyen de paiement",
  })
  @ApiResponse({ status: 200, description: "Transport finalisé avec succès" })
  @ApiResponse({
    status: 400,
    description: "Configuration du moyen de paiement incomplète",
  })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        transportId: { type: "number", example: 123 },
        sessionId: { type: "string", example: "sess_abc123xyz" },
      },
      required: ["transportId", "sessionId"],
    },
  })
  finalizeTransportAfterPaymentSetup(
    @Body() data: { transportId: number; sessionId: string }
  ) {
    return this.transportsService.finalizeTransportAfterPaymentSetup(
      data.transportId,
      data.sessionId
    );
  }

  @Post(":id/start")
  @SkipAuth()
  @ApiOperation({ summary: "Démarrer un transport" })
  @ApiResponse({ status: 200, description: "Transport démarré avec succès" })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  async startTransport(@Param("id") id: string) {
    return this.transportsService.startTransport(+id);
  }

  @Post(":id/end")
  @SkipAuth()
  @ApiOperation({
    summary: "Terminer un transport et calculer le montant final",
  })
  @ApiResponse({ status: 200, description: "Transport terminé avec succès" })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  async endTransport(@Param("id") id: string) {
    return this.transportsService.endTransport(+id);
  }

  // === ENDPOINTS POUR LE CHAT TRANSPORT ===

  @Post(":id/messages")
  @SkipAuth()
  @ApiOperation({
    summary: "Envoyer un message dans le contexte d'un transport",
  })
  @ApiResponse({ status: 201, description: "Message envoyé avec succès" })
  @ApiResponse({
    status: 400,
    description: "Données invalides ou accès non autorisé",
  })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  async createTransportMessage(
    @Param("id") id: string,
    @Body() data: CreateTransportMessageDto
  ) {
    return this.transportsService.createTransportMessage(
      +id,
      data.contenu,
      data.expediteurType,
      data.expediteurId
    );
  }

  @Get(":id/messages")
  @SkipAuth()
  @ApiOperation({ summary: "Récupérer les messages d'un transport" })
  @ApiResponse({ status: 200, description: "Messages récupérés avec succès" })
  @ApiResponse({ status: 400, description: "Accès non autorisé" })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  @ApiQuery({
    name: "userId",
    required: true,
    type: "number",
    description: "ID de l'utilisateur",
  })
  @ApiQuery({
    name: "userType",
    required: true,
    enum: ["CLIENT", "CHAUFFEUR"],
    description: "Type d'utilisateur",
  })
  @ApiQuery({
    name: "skip",
    required: false,
    type: "number",
    description: "Nombre d'éléments à ignorer",
  })
  @ApiQuery({
    name: "take",
    required: false,
    type: "number",
    description: "Nombre d'éléments à récupérer",
  })
  async getTransportMessages(
    @Param("id") id: string,
    @Query("userId") userId: string,
    @Query("userType") userType: "CLIENT" | "CHAUFFEUR",
    @Query("skip") skip?: string,
    @Query("take") take?: string
  ) {
    return this.transportsService.getTransportMessages(
      +id,
      +userId,
      userType,
      skip ? +skip : 0,
      take ? +take : 50
    );
  }

  @Get(":id/messages/unread")
  @SkipAuth()
  @ApiOperation({
    summary: "Obtenir le nombre de messages non lus pour un transport",
  })
  @ApiResponse({
    status: 200,
    description: "Nombre de messages non lus récupéré avec succès",
  })
  @ApiResponse({ status: 400, description: "Accès non autorisé" })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  @ApiQuery({
    name: "userId",
    required: true,
    type: "number",
    description: "ID de l'utilisateur",
  })
  @ApiQuery({
    name: "userType",
    required: true,
    enum: ["CLIENT", "CHAUFFEUR"],
    description: "Type d'utilisateur",
  })
  async getTransportUnreadCount(
    @Param("id") id: string,
    @Query("userId") userId: string,
    @Query("userType") userType: "CLIENT" | "CHAUFFEUR"
  ) {
    return this.transportsService.getTransportUnreadCount(
      +id,
      +userId,
      userType
    );
  }

  @Post(":id/messages/mark-read")
  @SkipAuth()
  @ApiOperation({
    summary: "Marquer tous les messages d'un transport comme lus",
  })
  @ApiResponse({
    status: 200,
    description: "Messages marqués comme lus avec succès",
  })
  @ApiResponse({ status: 400, description: "Accès non autorisé" })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  @ApiQuery({
    name: "userId",
    required: true,
    type: "number",
    description: "ID de l'utilisateur",
  })
  @ApiQuery({
    name: "userType",
    required: true,
    enum: ["CLIENT", "CHAUFFEUR"],
    description: "Type d'utilisateur",
  })
  async markAllMessagesAsRead(
    @Param("id") id: string,
    @Query("userId") userId: string,
    @Query("userType") userType: "CLIENT" | "CHAUFFEUR"
  ) {
    return this.transportsService.markAllMessagesAsRead(+id, +userId, userType);
  }

  @Get("conversations/:userId/:userType")
  @SkipAuth()
  @ApiOperation({
    summary: "Obtenir toutes les conversations de transport d'un utilisateur",
  })
  @ApiResponse({
    status: 200,
    description: "Conversations récupérées avec succès",
  })
  @ApiParam({
    name: "userId",
    type: "number",
    description: "ID de l'utilisateur",
  })
  @ApiParam({
    name: "userType",
    enum: ["CLIENT", "CHAUFFEUR"],
    description: "Type d'utilisateur",
  })
  async getTransportConversations(
    @Param("userId") userId: string,
    @Param("userType") userType: "CLIENT" | "CHAUFFEUR"
  ) {
    return this.transportsService.getTransportConversations(+userId, userType);
  }

  @Get("messages/unread-total/:userId/:userType")
  @SkipAuth()
  @ApiOperation({
    summary: "Obtenir le nombre total de messages non lus d'un utilisateur",
  })
  @ApiResponse({
    status: 200,
    description: "Nombre de messages non lus récupéré avec succès",
  })
  @ApiParam({
    name: "userId",
    type: "number",
    description: "ID de l'utilisateur",
  })
  @ApiParam({
    name: "userType",
    enum: ["CLIENT", "CHAUFFEUR"],
    description: "Type d'utilisateur",
  })
  async getTotalUnreadMessagesCount(
    @Param("userId") userId: string,
    @Param("userType") userType: "CLIENT" | "CHAUFFEUR"
  ) {
    return this.transportsService.getTotalUnreadMessagesCount(
      +userId,
      userType
    );
  }

  @Post(":id/messages/quick")
  @SkipAuth()
  @ApiOperation({ summary: "Envoyer un message rapide prédéfini" })
  @ApiResponse({
    status: 201,
    description: "Message rapide envoyé avec succès",
  })
  @ApiResponse({
    status: 400,
    description: "Données invalides ou accès non autorisé",
  })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  @ApiBody({
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
  })
  async sendQuickMessage(
    @Param("id") id: string,
    @Body()
    data: {
      expediteurType: "CLIENT" | "CHAUFFEUR";
      expediteurId: number;
      messageType: "ARRIVED" | "DELAYED" | "STARTED" | "FINISHED";
    }
  ) {
    return this.transportsService.sendQuickMessage(
      +id,
      data.expediteurType,
      data.expediteurId,
      data.messageType
    );
  }

  @Get(":id/chat")
  @SkipAuth()
  @ApiOperation({
    summary: "Obtenir les détails du transport avec les messages pour le chat",
  })
  @ApiResponse({
    status: 200,
    description: "Détails du transport avec messages récupérés avec succès",
  })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  async getTransportWithMessages(@Param("id") id: string) {
    return this.transportsService.findOne(+id);
  }

  @Post(":id/confirm-cash-payment")
  @SkipAuth()
  @ApiOperation({
    summary: "Confirmer le paiement en espèces pour un transport terminé",
  })
  @ApiResponse({
    status: 200,
    description: "Paiement en espèces confirmé avec succès",
  })
  @ApiResponse({
    status: 400,
    description: "Transport non terminé ou mode de paiement incorrect",
  })
  @ApiResponse({ status: 404, description: "Transport non trouvé" })
  @ApiBody({
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
  })
  async confirmCashPayment(
    @Param("id") id: string,
    @Body() data: { chauffeurId: number; montantRecu: number }
  ) {
    return this.transportsService.confirmCashPayment(
      +id,
      data.chauffeurId,
      data.montantRecu
    );
  }

  @Post("validate-promo-code")
  @ApiOperation({ summary: "Valider un code promo pour un montant donné" })
  @ApiResponse({
    status: 200,
    description: "Code promo validé avec informations de réduction",
  })
  @ApiResponse({ status: 400, description: "Code promo invalide" })
  @SkipAuth()
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        code: { type: "string", example: "PROMO2025" },
        montantCourse: { type: "number", example: 100.5 },
      },
      required: ["code", "montantCourse"],
    },
  })
  async validatePromoCode(
    @Body() data: { code: string; montantCourse: number }
  ) {
    return this.transportsService.validatePromoCode(
      data.code,
      data.montantCourse
    );
  }
}
