import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, RawBodyRequest, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { ClientJwtAuthGuard } from '../clients/guards/client-jwt-auth.guard';
import { StatutLocation } from '@prisma/client';

@ApiTags('locations')
@Controller('locations')
// @UseGuards(JwtAuthGuard)
// @UseGuards(ClientJwtAuthGuard)
@ApiBearerAuth()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) { }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle location de véhicule' })
  @ApiResponse({ status: 201, description: 'Location créée avec succès, retourne l\'URL de paiement Stripe' })
  @ApiResponse({ status: 400, description: 'Données invalides ou véhicule non disponible' })
  @ApiResponse({ status: 404, description: 'Client ou véhicule non trouvé' })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer la liste des locations de véhicule' })
  @ApiResponse({ status: 200, description: 'Liste des locations récupérée avec succès' })
  @ApiQuery({ name: 'skip', required: false, description: 'Nombre d\'enregistrements à ignorer' })
  @ApiQuery({ name: 'take', required: false, description: 'Nombre d\'enregistrements à récupérer' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut de la location' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Filtrer par ID du client' })
  @ApiQuery({ name: 'vehiculeId', required: false, description: 'Filtrer par ID du véhicule' })
  @ApiQuery({ name: 'dateDebut', required: false, description: 'Date de début (format: YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateFin', required: false, description: 'Date de fin (format: YYYY-MM-DD)' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: StatutLocation,
    @Query('clientId') clientId?: string,
    @Query('vehiculeId') vehiculeId?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    const filters: any = {};

    if (status) {
      filters.status = status;
    }

    if (clientId) {
      filters.clientId = Number.parseInt(clientId);
    }

    if (vehiculeId) {
      filters.vehiculeId = Number.parseInt(vehiculeId);
    }

    if (dateDebut || dateFin) {
      filters.dateDebut = {};

      if (dateDebut) {
        filters.dateDebut.gte = new Date(dateDebut);
      }

      if (dateFin) {
        filters.dateFin = { lte: new Date(dateFin) };
      }
    }

    return this.locationsService.findAll({
      skip: skip ? Number.parseInt(skip) : undefined,
      take: take ? Number.parseInt(take) : undefined,
      where: Object.keys(filters).length > 0 ? filters : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une location de véhicule par son ID' })
  @ApiResponse({ status: 200, description: 'Location récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Location non trouvée' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(+id);
  }

  @Post(':id/confirmation')
  @ApiOperation({ summary: 'Confirmer une location de véhicule' })
  @ApiResponse({ status: 200, description: 'Location confirmée avec succès' })
  @ApiResponse({ status: 404, description: 'Location non trouvée' })
  confirmLocation(@Param('id') id: string) {
    return this.locationsService.confirmLocation(+id);
  }

  @Post(':id/debut')
  @ApiOperation({ summary: 'Démarrer une location de véhicule' })
  @ApiResponse({ status: 200, description: 'Location démarrée avec succès' })
  @ApiResponse({ status: 400, description: 'La location n\'est pas confirmée' })
  @ApiResponse({ status: 404, description: 'Location non trouvée' })
  startLocation(@Param('id') id: string) {
    return this.locationsService.startLocation(+id);
  }

  @Post(':id/fin')
  @ApiOperation({ summary: 'Terminer une location de véhicule' })
  @ApiResponse({ status: 200, description: 'Location terminée avec succès' })
  @ApiResponse({ status: 400, description: 'La location n\'est pas en cours' })
  @ApiResponse({ status: 404, description: 'Location non trouvée' })
  endLocation(@Param('id') id: string) {
    return this.locationsService.endLocation(+id);
  }

  @Post(':id/annulation')
  @ApiOperation({ summary: 'Annuler une location de véhicule' })
  @ApiResponse({ status: 200, description: 'Location annulée avec succès' })
  @ApiResponse({ status: 400, description: 'Impossible d\'annuler une location terminée' })
  @ApiResponse({ status: 404, description: 'Location non trouvée' })
  cancelLocation(@Param('id') id: string) {
    return this.locationsService.cancelLocation(+id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Endpoint pour les webhooks Stripe' })
  @ApiResponse({ status: 200, description: 'Webhook traité avec succès' })
  handleStripeWebhook(@Req() request: RawBodyRequest<Request>) {
    const signature = request.headers['stripe-signature'] as string;
    const payload = request.rawBody;

    try {
      const event = this.locationsService.stripeService.constructEventFromPayload(signature, payload);
      return this.locationsService.handleStripeWebhook(event);
    } catch (error) {
      console.error('Erreur webhook:', error);
      return { error: error.message };
    }
  }
}