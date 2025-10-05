import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientJwtAuthGuard } from '../clients/guards/client-jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('messages')
@Controller('messages')
@UseGuards(AuthGuard(["jwt", "client-jwt"]))
@UseGuards(ClientJwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau message' })
  @ApiResponse({ status: 201, description: 'Message créé avec succès' })
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get('conversation/reservation/:reservationId')
  @ApiOperation({ summary: 'Récupérer les messages d\'une conversation pour une réservation spécifique' })
  @ApiParam({ name: 'reservationId', type: 'number', description: 'ID de la réservation' })
  @ApiQuery({ name: 'clientId', required: false, type: 'number', description: 'ID du client (pour marquer les messages comme lus)' })
  @ApiQuery({ name: 'chauffeurId', required: false, type: 'number', description: 'ID du chauffeur (pour marquer les messages comme lus)' })
  @ApiQuery({ name: 'skip', required: false, type: 'number', description: 'Nombre d\'enregistrements à ignorer' })
  @ApiQuery({ name: 'take', required: false, type: 'number', description: 'Nombre d\'enregistrements à récupérer' })
  @ApiResponse({ status: 200, description: 'Messages récupérés avec succès' })
  getReservationMessages(
    @Param('reservationId') reservationId: string,
    @Query('clientId') clientId?: string,
    @Query('chauffeurId') chauffeurId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.messagesService.findAllForConversation({
      reservationId: +reservationId,
      clientId: clientId ? +clientId : undefined,
      chauffeurId: chauffeurId ? +chauffeurId : undefined,
      skip: skip ? +skip : 0,
      take: take ? +take : 50,
    });
  }

  @Get('conversation/course/:courseId')
  @ApiOperation({ summary: 'Récupérer les messages d\'une conversation pour une course spécifique' })
  @ApiParam({ name: 'courseId', type: 'number', description: 'ID de la course' })
  @ApiQuery({ name: 'clientId', required: false, type: 'number', description: 'ID du client (pour marquer les messages comme lus)' })
  @ApiQuery({ name: 'chauffeurId', required: false, type: 'number', description: 'ID du chauffeur (pour marquer les messages comme lus)' })
  @ApiQuery({ name: 'skip', required: false, type: 'number', description: 'Nombre d\'enregistrements à ignorer' })
  @ApiQuery({ name: 'take', required: false, type: 'number', description: 'Nombre d\'enregistrements à récupérer' })
  @ApiResponse({ status: 200, description: 'Messages récupérés avec succès' })
  getCourseMessages(
    @Param('courseId') courseId: string,
    @Query('clientId') clientId?: string,
    @Query('chauffeurId') chauffeurId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.messagesService.findAllForConversation({
      courseId: +courseId,
      clientId: clientId ? +clientId : undefined,
      chauffeurId: chauffeurId ? +chauffeurId : undefined,
      skip: skip ? +skip : 0,
      take: take ? +take : 50,
    });
  }

  @Get('conversation/transport/:transportId')
  @ApiOperation({ summary: 'Récupérer les messages d\'une conversation pour un transport spécifique' })
  @ApiParam({ name: 'transportId', type: 'number', description: 'ID du transport' })
  @ApiQuery({ name: 'clientId', required: false, type: 'number', description: 'ID du client (pour marquer les messages comme lus)' })
  @ApiQuery({ name: 'chauffeurId', required: false, type: 'number', description: 'ID du chauffeur (pour marquer les messages comme lus)' })
  @ApiQuery({ name: 'skip', required: false, type: 'number', description: 'Nombre d\'enregistrements à ignorer' })
  @ApiQuery({ name: 'take', required: false, type: 'number', description: 'Nombre d\'enregistrements à récupérer' })
  @ApiResponse({ status: 200, description: 'Messages récupérés avec succès' })
  getTransportMessages(
    @Param('transportId') transportId: string,
    @Query('clientId') clientId?: string,
    @Query('chauffeurId') chauffeurId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.messagesService.findAllForConversation({
      transportId: +transportId,
      clientId: clientId ? +clientId : undefined,
      chauffeurId: chauffeurId ? +chauffeurId : undefined,
      skip: skip ? +skip : 0,
      take: take ? +take : 50,
    });
  }

  @Get('client/:clientId/conversations')
  @ApiOperation({ summary: 'Récupérer toutes les conversations d\'un client' })
  @ApiParam({ name: 'clientId', type: 'number', description: 'ID du client' })
  @ApiResponse({ status: 200, description: 'Conversations récupérées avec succès' })
  getClientConversations(@Param('clientId') clientId: string) {
    return this.messagesService.getConversationsForClient(+clientId);
  }

  @Get('chauffeur/:chauffeurId/conversations')
  @ApiOperation({ summary: 'Récupérer toutes les conversations d\'un chauffeur' })
  @ApiParam({ name: 'chauffeurId', type: 'number', description: 'ID du chauffeur' })
  @ApiResponse({ status: 200, description: 'Conversations récupérées avec succès' })
  getChauffeurConversations(@Param('chauffeurId') chauffeurId: string) {
    return this.messagesService.getConversationsForChauffeur(+chauffeurId);
  }

  @Get('client/:clientId/unread')
  @ApiOperation({ summary: 'Compter les messages non lus d\'un client' })
  @ApiParam({ name: 'clientId', type: 'number', description: 'ID du client' })
  @ApiResponse({ status: 200, description: 'Nombre de messages non lus récupéré avec succès' })
  getClientUnreadCount(@Param('clientId') clientId: string) {
    return this.messagesService.findUnreadCount(+clientId);
  }

  @Get('chauffeur/:chauffeurId/unread')
  @ApiOperation({ summary: 'Compter les messages non lus d\'un chauffeur' })
  @ApiParam({ name: 'chauffeurId', type: 'number', description: 'ID du chauffeur' })
  @ApiResponse({ status: 200, description: 'Nombre de messages non lus récupéré avec succès' })
  getChauffeurUnreadCount(@Param('chauffeurId') chauffeurId: string) {
    return this.messagesService.findUnreadCount(undefined, +chauffeurId);
  }
}