import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from "@nestjs/common"
import { CoursesService } from "./courses.service"
import { CreateCourseDto } from "./dto/create-course.dto"
import { UpdateCourseDto } from "./dto/update-course.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { TerminerCourseDto } from "./dto/terminer-course.dto"

@ApiTags("courses")
@Controller("courses")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle course' })
  @ApiResponse({ status: 201, description: 'Course créée avec succès' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: "Récupérer toutes les courses" })
  @ApiResponse({ status: 200, description: "Liste des courses récupérée avec succès" })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('chauffeurId') chauffeurId?: string,
    @Query('clientId') clientId?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    const filters: any = {}

    if (status) {
      filters.status = status
    }

    if (chauffeurId) {
      filters.chauffeurId = Number.parseInt(chauffeurId)
    }

    if (clientId) {
      filters.clientId = Number.parseInt(clientId)
    }

    if (dateDebut || dateFin) {
      filters.startTime = {}

      if (dateDebut) {
        filters.startTime.gte = new Date(dateDebut)
      }

      if (dateFin) {
        filters.startTime.lte = new Date(dateFin)
      }
    }

    return this.coursesService.findAll({
      skip: skip ? Number.parseInt(skip) : undefined,
      take: take ? Number.parseInt(take) : undefined,
      where: Object.keys(filters).length > 0 ? filters : undefined,
      orderBy: { startTime: "desc" },
    })
  }

  @Get('count')
  countCourses(): Promise<number> {
    console.log('Appel de la méthode countCourses dans le contrôleur');
    return this.coursesService.count();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une course par son ID' })
  @ApiResponse({ status: 200, description: 'Course récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Course non trouvée' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Mettre à jour une course" })
  @ApiResponse({ status: 200, description: "Course mise à jour avec succès" })
  @ApiResponse({ status: 404, description: "Course non trouvée" })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(+id, updateCourseDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une course' })
  @ApiResponse({ status: 200, description: 'Course supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Course non trouvée' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }

  @Post(":id/terminer")
  @ApiOperation({ summary: "Terminer une course" })
  @ApiResponse({ status: 200, description: "Course terminée avec succès" })
  @ApiResponse({ status: 404, description: "Course non trouvée ou non en cours" })
  terminerCourse(@Param('id') id: string, @Body() terminerCourseDto: TerminerCourseDto) {
    return this.coursesService.terminerCourse(+id, terminerCourseDto.finalPrice)
  }


  @Post(":id/annuler")
  @ApiOperation({ summary: "Annuler une course" })
  @ApiResponse({ status: 200, description: "Course annulée avec succès" })
  @ApiResponse({ status: 404, description: "Course non trouvée ou déjà terminée/annulée" })
  annulerCourse(@Param('id') id: string) {
    return this.coursesService.annulerCourse(+id);
  }
}

