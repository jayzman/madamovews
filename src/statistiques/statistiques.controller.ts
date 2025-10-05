import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { StatistiquesService } from "./statistiques.service"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("statistiques")
@Controller("statistiques")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatistiquesController {
  constructor(private readonly statistiquesService: StatistiquesService) {}

  @Get("kpis")
  @ApiOperation({ summary: "Récupérer les KPIs généraux" })
  @ApiResponse({ status: 200, description: "KPIs récupérés avec succès" })
  getKPIs() {
    return this.statistiquesService.getKPIs()
  }

  @Get("kpis-dashboard")
  @ApiOperation({ summary: "Récupérer les KPIs généraux" })
  @ApiResponse({ status: 200, description: "KPIs récupérés avec succès" })
  getKPIsDashboard() {
    return this.statistiquesService.getKPIsEvolution()
  }


  @Get('courses')
  @ApiOperation({ summary: 'Récupérer les statistiques des courses' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès' })
  getStatistiquesCourses(@Query('periode') periode?: string) {
    return this.statistiquesService.getStatistiquesCourses(periode || 'mois');
  }

  @Get('revenus')
  @ApiOperation({ summary: 'Récupérer les statistiques des revenus' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès' })
  getStatistiquesRevenus(@Query('periode') periode?: string) {
    return this.statistiquesService.getStatistiquesRevenus(periode || 'mois');
  }

  @Get('incidents')
  @ApiOperation({ summary: 'Récupérer les statistiques des incidents' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès' })
  getStatistiquesIncidents(@Query('periode') periode?: string) {
    return this.statistiquesService.getStatistiquesIncidents(periode || 'mois');
  }
}

