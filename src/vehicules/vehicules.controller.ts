import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
  Res,
  StreamableFile,
} from "@nestjs/common";
import { VehiculesService } from "./vehicules.service";
import { CreateVehiculeDto } from "./dto/create-vehicule.dto";
import { UpdateVehiculeDto } from "./dto/update-vehicule.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { Response } from "express";
import { createReadStream } from "fs";
import { extname } from "path";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateMaintenanceDto } from "./dto/create-maintenance.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { SkipAuth } from "../auth/decorators/skip-auth.decorator";
import { CategoryVehicule } from "@prisma/client";

@ApiTags("vehicules")
@Controller("vehicules")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VehiculesController {
  constructor(private readonly vehiculesService: VehiculesService) {}

  @Post()
  @ApiOperation({ summary: "Créer un nouveau véhicule" })
  @ApiResponse({ status: 201, description: "Véhicule créé avec succès" })
  create(@Body() createVehiculeDto: CreateVehiculeDto) {
    return this.vehiculesService.create(createVehiculeDto);
  }

  @Post("with-images/create")
  @ApiOperation({ summary: "Créer un nouveau véhicule avec des images" })
  @ApiResponse({ status: 201, description: "Véhicule créé avec succès." })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Données du véhicule et fichiers d'images",
    type: CreateVehiculeDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "photos", maxCount: 5 }], {
      storage: diskStorage({
        destination: "./uploads/photos/vehicle",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException("Seuls les fichiers image sont autorisés"),
            false
          );
        }
        cb(null, true);
      },
    })
  )
  createVehicule(
    @Body() createVehiculeDto: CreateVehiculeDto,
    @UploadedFiles() files: { photos?: Express.Multer.File[] }
  ) {
    if (files?.photos) {
      createVehiculeDto.photos = files.photos.map((file) => file.filename);
    }

    return this.vehiculesService.create(createVehiculeDto);
  }

  @Get()
  @SkipAuth()
  @ApiOperation({ summary: "Récupérer tous les véhicules" })
  @ApiResponse({
    status: 200,
    description: "Liste des véhicules récupérée avec succès",
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
    name: "statut",
    required: false,
    description: "Filtrer par statut du véhicule",
  })
  @ApiQuery({
    name: "type",
    required: false,
    description: "Filtrer par type de véhicule",
  })
  @ApiQuery({
    name: "categorie",
    required: false,
    description: "Filtrer par catégorie de véhicule",
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Rechercher par marque, modèle, immatriculation",
  })
  findAll(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @Query("type") type?: string,
    @Query("statut") statut?: string,
    @Query("categorie") categorie?: string,
    @Query("search") search?: string
  ) {
    const filters: any = {};

    if (type) {
      filters.type = type;
    }

    if (statut) {
      filters.statut = statut;
    }

    if (categorie) {
      filters.categorie = categorie;
    }

    if (search) {
      filters.OR = [
        { marque: { contains: search, mode: "insensitive" } },
        { modele: { contains: search, mode: "insensitive" } },
        { immatriculation: { contains: search, mode: "insensitive" } },
      ];
    }

    return this.vehiculesService.findAll({
      skip: skip ? Number.parseInt(skip) : undefined,
      take: take ? Number.parseInt(take) : undefined,
      where: Object.keys(filters).length > 0 ? filters : undefined,
      orderBy: { marque: "asc" },
    });
  }

  @Get(":id")
  @SkipAuth()
  @ApiOperation({ summary: "Récupérer un véhicule par son ID" })
  @ApiResponse({ status: 200, description: "Véhicule récupéré avec succès" })
  @ApiResponse({ status: 404, description: "Véhicule non trouvé" })
  findOne(@Param("id") id: string) {
    return this.vehiculesService.findOne(+id);
  }

  @Get("/available-vehicles/all")
  @SkipAuth()
  @ApiOperation({ summary: "Récupérer les vehicule disponible" })
  @ApiResponse({ status: 200, description: "Véhicules récupéré avec succès" })
  @ApiResponse({ status: 404, description: "aucun véhicule disponible trouvé" })
  findAvalilableVehicle() {
    return this.vehiculesService.getAvailableVehicles();
  }

  @Get("types/available")
  @SkipAuth()
  @ApiOperation({ summary: "Récupérer les types de véhicules disponibles" })
  @ApiResponse({
    status: 200,
    description: "Types de véhicules disponibles récupérés avec succès",
  })
  getAvailableVehicleTypes() {
    return this.vehiculesService.getAvailableVehicleTypes();
  }

  @Get("categories/available")
  @SkipAuth()
  @ApiOperation({
    summary: "Récupérer les catégories de véhicules disponibles",
  })
  @ApiResponse({
    status: 200,
    description: "Catégories de véhicules disponibles récupérées avec succès",
  })
  getAvailableCategories() {
    return this.vehiculesService.getAvailableCategories();
  }

  @Get("category/:category")
  @SkipAuth()
  @ApiOperation({ summary: "Récupérer les véhicules par catégorie" })
  @ApiResponse({ status: 200, description: "Véhicules récupérés avec succès" })
  findByCategory(@Param("category") category: string) {
    return this.vehiculesService.findByCategory(category as CategoryVehicule);
  }
  @Get("marque/:marque")
  @SkipAuth()
  @ApiOperation({ summary: "Récupérer les véhicules par marque" })
  @ApiResponse({ status: 200, description: "Véhicules récupérés avec succès" })
  findByMarque(@Param("marque") marque: string) {
    return this.vehiculesService.getByMarque(marque);
  }

  @Patch(":id")
  @SkipAuth()
  @ApiOperation({ summary: "Mettre à jour un véhicule" })
  @ApiResponse({ status: 200, description: "Véhicule mis à jour avec succès" })
  @ApiResponse({ status: 404, description: "Véhicule non trouvé" })
  update(
    @Param("id") id: string,
    @Body() updateVehiculeDto: UpdateVehiculeDto
  ) {
    return this.vehiculesService.update(+id, updateVehiculeDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Supprimer un véhicule" })
  @ApiResponse({ status: 200, description: "Véhicule supprimé avec succès" })
  @ApiResponse({ status: 404, description: "Véhicule non trouvé" })
  remove(@Param("id") id: string) {
    return this.vehiculesService.remove(+id);
  }

  @Post(":id/maintenances")
  @ApiOperation({ summary: "Ajouter une maintenance à un véhicule" })
  @ApiResponse({ status: 201, description: "Maintenance ajoutée avec succès" })
  @ApiResponse({ status: 404, description: "Véhicule non trouvé" })
  addMaintenance(
    @Param("id") id: string,
    @Body() createMaintenanceDto: CreateMaintenanceDto
  ) {
    return this.vehiculesService.addMaintenance(+id, createMaintenanceDto);
  }

  @Get(":id/maintenances")
  @ApiOperation({ summary: "Récupérer les maintenances d'un véhicule" })
  @ApiResponse({
    status: 200,
    description: "Maintenances récupérées avec succès",
  })
  @ApiResponse({ status: 404, description: "Véhicule non trouvé" })
  getMaintenances(@Param("id") id: string) {
    return this.vehiculesService.getMaintenances(+id);
  }
  @Get(":id/photos")
  @ApiOperation({ summary: "Récupérer les URLs des photos d'un véhicule" })
  @ApiResponse({
    status: 200,
    description: "URLs des photos récupérées avec succès",
  })
  @ApiResponse({ status: 404, description: "Véhicule non trouvé" })
  async getVehiclePhotos(@Param("id") id: string) {
    const photoUrls = await this.vehiculesService.getVehiclePhotos(+id);
    return { photos: photoUrls };
  }

  @Get(":id/photos/:filename")
  @SkipAuth()
  @ApiOperation({ summary: "Récupérer une photo spécifique d'un véhicule" })
  @ApiResponse({ status: 200, description: "Photo récupérée avec succès" })
  @ApiResponse({ status: 404, description: "Véhicule ou photo non trouvé" })
  async getVehiclePhoto(
    @Param("id") id: string,
    @Param("filename") filename: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const file = await this.vehiculesService.getVehiclePhoto(+id, filename);
    const stream = createReadStream(file);

    res.set({
      "Content-Type": `image/${extname(file).substring(1)}`,
      "Content-Disposition": `inline; filename="${filename}"`,
    });

    return new StreamableFile(stream);
  }
}
