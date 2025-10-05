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
  UploadedFile,
  Res,
  NotFoundException,
} from "@nestjs/common";
import { ChauffeursService } from "./chauffeurs.service";
import { CreateChauffeurDto, LoginDriverDto, RegisterChauffeurBySmsDto, SendOtpChauffeurDto, VerifyOtpChauffeurDto, LoginChauffeurBySmsDto, SendCustomSmsDto } from "./dto/create-chauffeur.dto";
import { UpdateChauffeurDto } from "./dto/update-chauffeur.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RechargerCreditDto } from "./dto/recharger-credit.dto";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { diskStorage } from "multer";
import { Express } from "express";
import { SkipAuth } from "../auth/decorators/skip-auth.decorator";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/reset-password.dto";

@ApiTags("chauffeurs")
@Controller("chauffeurs")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChauffeursController {
  constructor(private readonly chauffeursService: ChauffeursService) {}

  @Post()
  @ApiOperation({ summary: "Créer un nouveau chauffeur" })
  @ApiResponse({ status: 201, description: "Chauffeur créé avec succès" })
  create(@Body() createChauffeurDto: CreateChauffeurDto) {
    return this.chauffeursService.create(createChauffeurDto);
  }

  @Post("login")
  @SkipAuth()
  @ApiOperation({ summary: "Connexion d'un chauffeur" })
  @ApiResponse({ status: 200, description: "Connexion réussie" })
  @ApiResponse({ status: 404, description: "Email ou mot de passe incorrect" })
  async loginDriver(@Body() loginDto: LoginDriverDto) {
    return this.chauffeursService.loginDriver(loginDto);
  }

  // === ENDPOINTS SMS/OTP ===
  
  @Post("register-sms")
  @SkipAuth()
  @ApiOperation({ summary: "Inscription d'un chauffeur via SMS" })
  @ApiResponse({ status: 201, description: "Chauffeur inscrit avec succès via SMS" })
  @ApiResponse({ status: 400, description: "Numéro de téléphone déjà utilisé" })
  async registerBySms(@Body() registerDto: RegisterChauffeurBySmsDto) {
    return this.chauffeursService.registerBySms(registerDto);
  }

  @Post("send-otp")
  @SkipAuth()
  @ApiOperation({ summary: "Envoyer un code OTP pour connexion" })
  @ApiResponse({ status: 200, description: "Code OTP envoyé avec succès" })
  @ApiResponse({ status: 404, description: "Chauffeur non trouvé" })
  async sendOtp(@Body() sendOtpDto: SendOtpChauffeurDto) {
    return this.chauffeursService.sendOtpForLogin(sendOtpDto.telephone);
  }

  @Post("verify-otp")
  @SkipAuth()
  @ApiOperation({ summary: "Vérifier le code OTP et se connecter" })
  @ApiResponse({ status: 200, description: "Connexion réussie via OTP" })
  @ApiResponse({ status: 400, description: "Code OTP invalide ou expiré" })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpChauffeurDto) {
    return this.chauffeursService.loginBySms(verifyOtpDto.telephone, verifyOtpDto.otp);
  }

  @Post("login-sms")
  @SkipAuth()
  @ApiOperation({ summary: "Connexion directe via SMS avec OTP" })
  @ApiResponse({ status: 200, description: "Connexion réussie via SMS" })
  @ApiResponse({ status: 400, description: "Code OTP invalide ou chauffeur non trouvé" })
  async loginBySms(@Body() loginSmsDto: LoginChauffeurBySmsDto) {
    return this.chauffeursService.loginBySms(loginSmsDto.telephone, loginSmsDto.otp);
  }

  @Post("resend-otp")
  @SkipAuth()
  @ApiOperation({ summary: "Renvoyer un nouveau code OTP" })
  @ApiResponse({ status: 200, description: "Nouveau code OTP envoyé" })
  @ApiResponse({ status: 404, description: "Chauffeur non trouvé" })
  async resendOtp(@Body() sendOtpDto: SendOtpChauffeurDto) {
    return this.chauffeursService.resendOtp(sendOtpDto.telephone);
  }

  @Post("send-custom-sms")
  @ApiOperation({ summary: "Envoyer un SMS personnalisé" })
  @ApiResponse({ status: 200, description: "SMS envoyé avec succès" })
  @ApiResponse({ status: 400, description: "Erreur lors de l'envoi du SMS" })
  async sendCustomSms(@Body() sendSmsDto: SendCustomSmsDto) {
    return this.chauffeursService.sendCustomSms(sendSmsDto);
  }

  // === FIN ENDPOINTS SMS/OTP ===
  
  @Get("disponibles")
  @SkipAuth()
  @ApiOperation({
    summary:
      "Récupérer tous les chauffeurs disponibles (non affectés à un véhicule)",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des chauffeurs disponibles récupérée avec succès",
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
  findAvailable(@Query("skip") skip?: string, @Query("take") take?: string) {
    return this.chauffeursService.findAvailable({
      skip: skip ? Number.parseInt(skip) : undefined,
      take: take ? Number.parseInt(take) : undefined,
      orderBy: { nom: "asc" },
    });
  }

  @Get()
  @ApiOperation({ summary: "Récupérer tous les chauffeurs" })
  @ApiResponse({
    status: 200,
    description: "Liste des chauffeurs récupérée avec succès",
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
    description: "Filtrer par statut du chauffeur",
  })
  @ApiQuery({
    name: "statutActivite",
    required: false,
    description: "Filtrer par status active du chauffeur",
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Rechercher par nom, prénom, email",
  })
  findAll(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @Query("statut") statut?: string,
    @Query("statutActivite") statutActivite?: string,
    @Query("search") search?: string
  ) {
    const filters: any = {};

    if (statut) {
      filters.statut = statut;
    }

    if (statutActivite) {
      filters.statutActivite = statutActivite;
    }

    if (search) {
      filters.OR = [
        { nom: { contains: search, mode: "insensitive" } },
        { prenom: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    return this.chauffeursService.findAll({
      skip: skip ? Number.parseInt(skip) : undefined,
      take: take ? Number.parseInt(take) : undefined,
      where: Object.keys(filters).length > 0 ? filters : undefined,
      orderBy: { nom: "asc" },
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Récupérer un chauffeur par son ID" })
  @ApiResponse({ status: 200, description: "Chauffeur récupéré avec succès" })
  @ApiResponse({ status: 404, description: "Chauffeur non trouvé" })
  findOne(@Param("id") id: string) {
    return this.chauffeursService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Mettre à jour un chauffeur" })
  @ApiResponse({ status: 200, description: "Chauffeur mis à jour avec succès" })
  @ApiResponse({ status: 404, description: "Chauffeur non trouvé" })
  update(
    @Param("id") id: string,
    @Body() updateChauffeurDto: UpdateChauffeurDto
  ) {
    return this.chauffeursService.update(+id, updateChauffeurDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Supprimer un chauffeur" })
  @ApiResponse({ status: 200, description: "Chauffeur supprimé avec succès" })
  @ApiResponse({ status: 404, description: "Chauffeur non trouvé" })
  remove(@Param("id") id: string) {
    return this.chauffeursService.remove(+id);
  }

  @Post(":id/recharger-credit")
  @ApiOperation({ summary: "Recharger le crédit d'un chauffeur indépendant" })
  @ApiResponse({ status: 200, description: "Crédit rechargé avec succès" })
  @ApiResponse({
    status: 404,
    description: "Chauffeur non trouvé ou non indépendant",
  })
  rechargerCredit(
    @Param("id") id: string,
    @Body() rechargerCreditDto: RechargerCreditDto
  ) {
    return this.chauffeursService.rechargerCredit(
      +id,
      rechargerCreditDto.montant
    );
  }

  @Post(":id/photo")
  @ApiOperation({ summary: "Télécharger une photo pour un chauffeur" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/photos",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          const extension = path.extname(file.originalname);
          cb(null, `chauffeur-${req.params.id}-${randomName}${extension}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(
            new Error("Seuls les fichiers JPG, JPEG et PNG sont autorisés!"),
            false
          );
        }
        cb(null, true);
      },
    })
  )
  async uploadPhoto(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new Error("Aucun fichier n'a été téléchargé");
    }

    // Mettre à jour le chauffeur avec l'URL de la photo
    const photoUrl = `/uploads/photos/${file.filename}`;
    await this.chauffeursService.update(+id, { photoUrl });

    return { photoUrl };
  }

  @Get(":id/documents")
  @ApiOperation({ summary: "Récupérer les documents d'un chauffeur" })
  @ApiResponse({ status: 200, description: "Documents récupérés avec succès" })
  @ApiResponse({ status: 404, description: "Chauffeur non trouvé" })
  getDocuments(@Param("id") id: string) {
    return this.chauffeursService.getDocuments(+id);
  }

  @Post(":id/documents")
  @UseInterceptors(FileInterceptor("file"))
  async addDocument(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto
  ) {
    try {
      console.log(
        "Fichier reçu:",
        file
          ? {
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              path: file.path,
            }
          : "Aucun fichier"
      );

      console.log("DTO reçu:", createDocumentDto);

      if (!file) {
        throw new Error("Aucun fichier n'a été téléchargé");
      }

      const document = await this.chauffeursService.addDocument(+id, {
        ...createDocumentDto,
        fichier: file.path,
        mimeType: file.mimetype,
        taille: file.size,
      });

      return document;
    } catch (error) {
      console.error("Erreur lors de l'ajout du document:", error);
      throw error;
    }
  }

  @Get(":id/documents/:documentId")
  async getDocument(
    @Param("id") id: string,
    @Param("documentId") documentId: string,
    @Res() res: Response
  ) {
    try {
      console.log(
        `Récupération du document ${documentId} pour le chauffeur ${id}`
      );

      const document = await this.chauffeursService.getDocument(
        +id,
        +documentId
      );
      console.log("Document trouvé:", document);

      if (!document.fichier) {
        console.error(`Le document ${documentId} n'a pas de fichier associé`);
        throw new NotFoundException("Le fichier n'existe pas");
      }

      // Vérifier si le fichier existe
      if (!fs.existsSync(document.fichier)) {
        console.error(
          `Le fichier ${document.fichier} n'existe pas sur le serveur`
        );
        throw new NotFoundException("Le fichier n'existe pas sur le serveur");
      }

      console.log(`Envoi du fichier: ${document.fichier}`);

      // Déterminer le type MIME en fonction de l'extension du fichier
      const ext = path.extname(document.fichier).toLowerCase();
      let contentType = document.mimeType || "application/octet-stream";

      if (ext === ".pdf") {
        contentType = "application/pdf";
      } else if (ext === ".jpg" || ext === ".jpeg") {
        contentType = "image/jpeg";
      } else if (ext === ".png") {
        contentType = "image/png";
      }

      // Définir explicitement le type de contenu
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${path.basename(document.fichier)}"`
      );

      // Lire et envoyer le fichier manuellement
      const fileStream = fs.createReadStream(document.fichier);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Erreur lors de la récupération du document:", error);
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        res
          .status(500)
          .json({
            message: "Erreur lors de la récupération du document",
            error: error.message,
          });
      }
    }
  }

  @Delete(":id/documents/:documentId")
  @ApiOperation({ summary: "Supprimer un document d'un chauffeur" })
  @ApiResponse({ status: 200, description: "Document supprimé avec succès" })
  @ApiResponse({ status: 404, description: "Chauffeur ou document non trouvé" })
  removeDocument(
    @Param("id") id: string,
    @Param("documentId") documentId: string
  ) {
    return this.chauffeursService.removeDocument(+id, +documentId);
  }

  @Patch(":id/documents/:documentId")
  @ApiOperation({ summary: "Mettre à jour un document" })
  @ApiResponse({ status: 200, description: "Document mis à jour avec succès" })
  @ApiResponse({ status: 404, description: "Chauffeur ou document non trouvé" })
  async updateDocument(
    @Param("id") id: string,
    @Param("documentId") documentId: string,
    @Body() updateDocumentDto: Partial<CreateDocumentDto>
  ) {
    return this.chauffeursService.updateDocument(
      +id,
      +documentId,
      updateDocumentDto
    );
  }

  @Patch(":id/documents/:documentId/file")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Mettre à jour le fichier d'un document" })
  @ApiResponse({
    status: 200,
    description: "Fichier du document mis à jour avec succès",
  })
  @ApiResponse({ status: 404, description: "Chauffeur ou document non trouvé" })
  async updateDocumentFile(
    @Param("id") id: string,
    @Param("documentId") documentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateDocumentDto: Partial<CreateDocumentDto>
  ) {
    try {
      console.log(
        "Fichier reçu pour mise à jour:",
        file
          ? {
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              path: file.path,
            }
          : "Aucun fichier"
      );

      console.log("DTO reçu pour mise à jour:", updateDocumentDto);

      if (!file) {
        throw new Error("Aucun fichier n'a été téléchargé");
      }

      const document = await this.chauffeursService.updateDocumentWithFile(
        +id,
        +documentId,
        {
          ...updateDocumentDto,
          fichier: file.path,
          mimeType: file.mimetype,
          taille: file.size,
        }
      );

      return document;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du fichier du document:",
        error
      );
      throw error;
    }
  }

  @Patch(":id/documents/:documentId/status")
  @ApiOperation({ summary: "Mettre à jour le statut d'un document" })
  @ApiResponse({
    status: 200,
    description: "Statut du document mis à jour avec succès",
  })
  @ApiResponse({ status: 404, description: "Chauffeur ou document non trouvé" })
  updateDocumentStatus(
    @Param("id") id: string,
    @Param("documentId") documentId: string,
    @Body() body: { status: string }
  ) {
    return this.chauffeursService.updateDocumentStatus(
      +id,
      +documentId,
      body.status
    );
  }

  @Get(":id/courses")
  @ApiOperation({ summary: "Récupérer les courses d'un chauffeur" })
  @ApiResponse({ status: 200, description: "Courses récupérées avec succès" })
  @ApiResponse({ status: 404, description: "Chauffeur non trouvé" })
  getCourses(
    @Param("id") id: string,
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @Query("status") status?: string,
    @Query("dateDebut") dateDebut?: string,
    @Query("dateFin") dateFin?: string
  ) {
    const filters: any = {
      chauffeurId: +id,
    };

    if (status) {
      filters.status = status;
    }

    if (dateDebut || dateFin) {
      filters.startTime = {};

      if (dateDebut) {
        filters.startTime.gte = new Date(dateDebut);
      }

      if (dateFin) {
        filters.startTime.lte = new Date(dateFin);
      }
    }

    return this.chauffeursService.getCourses({
      skip: skip ? Number.parseInt(skip) : undefined,
      take: take ? Number.parseInt(take) : undefined,
      where: filters,
      orderBy: { startTime: "desc" },
    });
  }

  @Get(":id/incidents")
  @ApiOperation({ summary: "Récupérer les incidents d'un chauffeur" })
  @ApiResponse({ status: 200, description: "Incidents récupérés avec succès" })
  @ApiResponse({ status: 404, description: "Chauffeur non trouvé" })
  getIncidents(
    @Param("id") id: string,
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @Query("status") status?: string
  ) {
    const filters: any = {
      chauffeurId: +id,
    };

    if (status) {
      filters.status = status;
    }

    return this.chauffeursService.getIncidents({
      skip: skip ? Number.parseInt(skip) : undefined,
      take: take ? Number.parseInt(take) : undefined,
      where: filters,
      orderBy: { date: "desc" },
    });
  }

  @Get(":id/performance")
  @SkipAuth()
  @ApiOperation({
    summary: "Récupérer les données de performance d'un chauffeur",
  })
  @ApiResponse({
    status: 200,
    description: "Données de performance récupérées avec succès",
  })
  @ApiResponse({ status: 404, description: "Chauffeur non trouvé" })
  getPerformance(@Param("id") id: string, @Query("periode") periode?: string) {
    return this.chauffeursService.getPerformance(+id, periode || "mois");
  }

  @Post("forgot-password")
  @SkipAuth()
  @ApiOperation({
    summary: "Envoyer un code de réinitialisation de mot de passe",
  })
  @ApiResponse({ status: 200, description: "Email de réinitialisation envoyé" })
  @ApiResponse({ status: 404, description: "Chauffeur non trouvé" })
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return this.chauffeursService.forgotPassword(email);
  }

  @Post("reset-password")
  @SkipAuth()
  @ApiOperation({ summary: "Réinitialiser le mot de passe avec le code reçu" })
  @ApiResponse({
    status: 200,
    description: "Mot de passe réinitialisé avec succès",
  })
  @ApiResponse({ status: 404, description: "Code invalide ou expiré" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.chauffeursService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.resetCode,
      resetPasswordDto.password
    );
  }
}
