import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { PromoCodesService } from "./promo-codes.service";
import { CreatePromoCodeDto } from "./dto/create-promo-code.dto";
import { UpdatePromoCodeDto } from "./dto/update-promo-code.dto";
import { ValidatePromoCodeDto } from "./dto/validate-promo-code.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SkipAuth } from "../auth/decorators/skip-auth.decorator";

@ApiTags("Codes Promo")
@Controller("promo-codes")
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Post()
  @SkipAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Créer un nouveau code promo (Admin uniquement)" })
  @ApiResponse({ status: 201, description: "Code promo créé avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  create(@Body() createPromoCodeDto: CreatePromoCodeDto) {
    return this.promoCodesService.create(createPromoCodeDto);
  }

  @Get()
  @SkipAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lister tous les codes promo (Admin uniquement)" })
  @ApiResponse({ status: 200, description: "Liste des codes promo" })
  findAll() {
    return this.promoCodesService.findAll();
  }

  @Get("stats")
  @SkipAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtenir les statistiques des codes promo (Admin uniquement)" })
  @ApiResponse({ status: 200, description: "Statistiques des codes promo" })
  getStats() {
    return this.promoCodesService.getStats();
  }

  @Get(":id")
  @SkipAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer un code promo par ID (Admin uniquement)" })
  @ApiResponse({ status: 200, description: "Code promo trouvé" })
  @ApiResponse({ status: 404, description: "Code promo non trouvé" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.promoCodesService.findOne(id);
  }

  @Patch(":id")
  @SkipAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour un code promo (Admin uniquement)" })
  @ApiResponse({ status: 200, description: "Code promo mis à jour" })
  @ApiResponse({ status: 404, description: "Code promo non trouvé" })
  update(@Param("id", ParseIntPipe) id: number, @Body() updatePromoCodeDto: UpdatePromoCodeDto) {
    return this.promoCodesService.update(id, updatePromoCodeDto);
  }

  @Delete(":id")
  @SkipAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer un code promo (Admin uniquement)" })
  @ApiResponse({ status: 200, description: "Code promo supprimé" })
  @ApiResponse({ status: 404, description: "Code promo non trouvé" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.promoCodesService.remove(id);
  }

  @Post("validate")
  @SkipAuth()
  @ApiOperation({ summary: "Valider un code promo" })
  @ApiResponse({ status: 200, description: "Code promo validé avec succès" })
  @ApiResponse({ status: 400, description: "Code promo invalide" })
  validatePromoCode(@Body() validatePromoCodeDto: ValidatePromoCodeDto) {
    return this.promoCodesService.validatePromoCode(
      validatePromoCodeDto.code,
      validatePromoCodeDto.montantCourse
    );
  }
}
