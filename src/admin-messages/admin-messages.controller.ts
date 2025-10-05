import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminMessagesService } from './admin-messages.service';
import { CreateAdminMessageDto } from './dto/create-admin-message.dto';
import { UpdateAdminMessageDto } from './dto/update-admin-message.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { QueryAdminMessageDto } from './dto/query-admin-message.dto';

@ApiTags('admin-messages')
@Controller('admin-messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@SkipAuth()
export class AdminMessagesController {
  constructor(private readonly adminMessagesService: AdminMessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau message entre admin et chauffeur' })
  @ApiResponse({ status: 201, description: 'Message créé avec succès' })
  create(@Body() createAdminMessageDto: CreateAdminMessageDto) {
    return this.adminMessagesService.create(createAdminMessageDto);
  }

  @Get('user/:userId/chauffeur/:chauffeurId/conversation')
  @ApiOperation({ summary: 'Récupérer une conversation entre un admin et un chauffeur' })
  @ApiResponse({ status: 200, description: 'Conversation récupérée avec succès' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur admin' })
  @ApiParam({ name: 'chauffeurId', description: 'ID du chauffeur' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  getConversation(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('chauffeurId', ParseIntPipe) chauffeurId: number,
    @Query() queryDto: QueryAdminMessageDto,
  ) {
    return this.adminMessagesService.getConversation(userId, chauffeurId, queryDto.skip, queryDto.take);
  }

  @Get('user/:userId/conversations')
  @ApiOperation({ summary: 'Récupérer toutes les conversations d\'un admin' })
  @ApiResponse({ status: 200, description: 'Conversations récupérées avec succès' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur admin' })
  getUserConversations(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminMessagesService.getChauffeurConversations(userId);
  }

  @Get('chauffeur/:chauffeurId/conversations')
  @ApiOperation({ summary: 'Récupérer toutes les conversations d\'un chauffeur' })
  @ApiResponse({ status: 200, description: 'Conversations récupérées avec succès' })
  @ApiParam({ name: 'chauffeurId', description: 'ID du chauffeur' })
  getChauffeurConversations(@Param('chauffeurId', ParseIntPipe) chauffeurId: number) {
    return this.adminMessagesService.getUserConversations(chauffeurId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Récupérer les messages d\'un utilisateur admin' })
  @ApiResponse({ status: 200, description: 'Messages récupérés avec succès' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur admin' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'lu', required: false, description: 'Filtrer par statut de lecture' })
  findAllForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() queryDto: QueryAdminMessageDto,
  ) {
    const filters = queryDto.lu !== undefined ? { lu: queryDto.lu } : {};
    return this.adminMessagesService.findAllForUser(userId, queryDto.skip, queryDto.take, filters);
  }

  @Get('chauffeur/:chauffeurId')
  @ApiOperation({ summary: 'Récupérer les messages d\'un chauffeur' })
  @ApiResponse({ status: 200, description: 'Messages récupérés avec succès' })
  @ApiParam({ name: 'chauffeurId', description: 'ID du chauffeur' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'lu', required: false, description: 'Filtrer par statut de lecture' })
  findAllForChauffeur(
    @Param('chauffeurId', ParseIntPipe) chauffeurId: number,
    @Query() queryDto: QueryAdminMessageDto,
  ) {
    const filters = queryDto.lu !== undefined ? { lu: queryDto.lu } : {};
    return this.adminMessagesService.findAllForChauffeur(chauffeurId, queryDto.skip, queryDto.take, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un message par son ID' })
  @ApiResponse({ status: 200, description: 'Message récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Message non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminMessagesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un message' })
  @ApiResponse({ status: 200, description: 'Message mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Message non trouvé' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAdminMessageDto: UpdateAdminMessageDto) {
    return this.adminMessagesService.update(id, updateAdminMessageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un message' })
  @ApiResponse({ status: 200, description: 'Message supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Message non trouvé' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminMessagesService.remove(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer un message comme lu' })
  @ApiResponse({ status: 200, description: 'Message marqué comme lu avec succès' })
  @ApiResponse({ status: 404, description: 'Message non trouvé' })
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.adminMessagesService.markAsRead(id);
  }

  @Get('user/:userId/unread')
  @ApiOperation({ summary: 'Compter les messages non lus d\'un utilisateur admin' })
  @ApiResponse({ status: 200, description: 'Nombre de messages non lus récupéré avec succès' })
  getUserUnreadCount(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminMessagesService.findUnreadCount(userId);
  }

  @Get('chauffeur/:chauffeurId/unread')
  @ApiOperation({ summary: 'Compter les messages non lus d\'un chauffeur' })
  @ApiResponse({ status: 200, description: 'Nombre de messages non lus récupéré avec succès' })
  getChauffeurUnreadCount(@Param('chauffeurId', ParseIntPipe) chauffeurId: number) {
    return this.adminMessagesService.findUnreadCount(undefined, chauffeurId);
  }
}