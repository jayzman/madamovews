import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { FinancesService } from "./finances.service"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("finances")
@Controller("finances")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Get('resume')
  @ApiOperation({ summary: 'Récupérer le résumé financier' })
  @ApiResponse({ status: 200, description: 'Résumé financier récupéré avec succès' })
  getResumeFinancier(@Query('periode') periode?: string) {
    return this.financesService.getResumeFinancier(periode || 'mois');
  }

  @Get("activites")
  @ApiOperation({ summary: "Récupérer l'historique des activités financières" })
  @ApiResponse({ status: 200, description: "Historique des activités récupéré avec succès" })
  getHistoriqueActivites(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('type') type?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.financesService.getHistoriqueActivites({
      skip: skip ? Number.parseInt(skip) : undefined,
      take: take ? Number.parseInt(take) : undefined,
      type,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
    })
  }
}

