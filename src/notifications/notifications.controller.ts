import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, ParseIntPipe, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle notification' })
  @ApiResponse({ status: 201, description: 'Notification créée avec succès' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les notifications' })
  @ApiResponse({ status: 200, description: 'Liste des notifications récupérée avec succès' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.notificationsService.findAll(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Récupérer les notifications d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Notifications de l\'utilisateur récupérées avec succès' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findAllForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.notificationsService.findAllForUser(
      userId,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
    );
  }

  @Get('chauffeur/:chauffeurId')
  @ApiOperation({ summary: 'Récupérer les notifications d\'un chauffeur' })
  @ApiResponse({ status: 200, description: 'Notifications du chauffeur récupérées avec succès' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findAllForChauffeur(
    @Param('chauffeurId', ParseIntPipe) chauffeurId: number,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.notificationsService.findAllForChauffeur(
      chauffeurId,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
    );
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Récupérer les notifications d\'un client' })
  @ApiResponse({ status: 200, description: 'Notifications du client récupérées avec succès' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findAllForClient(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.notificationsService.findAllForClient(
      clientId,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une notification par son ID' })
  @ApiResponse({ status: 200, description: 'Notification récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiResponse({ status: 200, description: 'Notification marquée comme lue' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  @ApiOperation({ summary: 'Marquer toutes les notifications d\'un utilisateur comme lues' })
  @ApiResponse({ status: 200, description: 'Toutes les notifications de l\'utilisateur ont été marquées comme lues' })
  markAllAsReadForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.markAllAsReadForUser(userId);
  }

  @Patch('chauffeur/:chauffeurId/read-all')
  @ApiOperation({ summary: 'Marquer toutes les notifications d\'un chauffeur comme lues' })
  @ApiResponse({ status: 200, description: 'Toutes les notifications du chauffeur ont été marquées comme lues' })
  markAllAsReadForChauffeur(@Param('chauffeurId', ParseIntPipe) chauffeurId: number) {
    return this.notificationsService.markAllAsReadForChauffeur(chauffeurId);
  }

  @Patch('client/:clientId/read-all')
  @ApiOperation({ summary: 'Marquer toutes les notifications d\'un client comme lues' })
  @ApiResponse({ status: 200, description: 'Toutes les notifications du client ont été marquées comme lues' })
  markAllAsReadForClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.notificationsService.markAllAsReadForClient(clientId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une notification' })
  @ApiResponse({ status: 200, description: 'Notification supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.remove(id);
  }

  @Post('special-offer')
  @ApiOperation({ summary: 'Créer une notification pour une offre spéciale' })
  @ApiResponse({ status: 201, description: 'Notifications d\'offre spéciale créées avec succès' })
  createSpecialOffer(
    @Body() data: {
      clientIds?: number[];
      chauffeurIds?: number[];
      titre: string;
      message: string;
      offreDetails: any;
    },
  ) {
    return this.notificationsService.createSpecialOfferNotification(
      data.clientIds || null,
      data.chauffeurIds || null,
      data.titre,
      data.message,
      data.offreDetails,
    );
  }

  @Post('system')
  @ApiOperation({ summary: 'Créer une notification système' })
  @ApiResponse({ status: 201, description: 'Notification système créée avec succès' })
  createSystemNotification(
    @Body() data: {
      userId?: number;
      clientId?: number;
      chauffeurId?: number;
      titre: string;
      message: string;
      donnees?: any;
    },
  ) {
    return this.notificationsService.createSystemNotification(
      data.userId || null,
      data.clientId || null,
      data.chauffeurId || null,
      data.titre,
      data.message,
      data.donnees,
    );
  }
}