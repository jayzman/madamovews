import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from "@nestjs/common"
import { IncidentsService } from "./incidents.service"
import { CreateIncidentDto } from "./dto/create-incident.dto"
import { UpdateIncidentDto } from "./dto/update-incident.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("incidents")
@Controller("incidents")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel incident' })
  @ApiResponse({ status: 201, description: 'Incident créé avec succès' })
  create(@Body() createIncidentDto: CreateIncidentDto) {
    return this.incidentsService.create(createIncidentDto);
  }

  @Get()
  @ApiOperation({ summary: "Récupérer tous les incidents" })
  @ApiResponse({ status: 200, description: "Liste des incidents récupérée avec succès" })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('chauffeurId') chauffeurId?: string,
    @Query('vehiculeId') vehiculeId?: string,
    @Query('courseId') courseId?: string,
  ) {
    const filters: any = {}

    if (type) {
      filters.type = type
    }

    if (status) {
      filters.status = status
    }

    if (chauffeurId) {
      filters.chauffeurId = Number.parseInt(chauffeurId)
    }

    if (vehiculeId) {
      filters.vehiculeId = Number.parseInt(vehiculeId)
    }

    if (courseId) {
      filters.courseId = Number.parseInt(courseId)
    }

    return this.incidentsService.findAll({
      skip: skip ? Number.parseInt(skip) : undefined,
      take: take ? Number.parseInt(take) : undefined,
      where: Object.keys(filters).length > 0 ? filters : undefined,
      orderBy: { date: "desc" },
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un incident par son ID' })
  @ApiResponse({ status: 200, description: 'Incident récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Incident non trouvé' })
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Mettre à jour un incident" })
  @ApiResponse({ status: 200, description: "Incident mis à jour avec succès" })
  @ApiResponse({ status: 404, description: "Incident non trouvé" })
  update(@Param('id') id: string, @Body() updateIncidentDto: UpdateIncidentDto) {
    return this.incidentsService.update(+id, updateIncidentDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un incident' })
  @ApiResponse({ status: 200, description: 'Incident supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Incident non trouvé' })
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(+id);
  }
}

