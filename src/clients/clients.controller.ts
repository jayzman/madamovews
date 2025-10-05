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
  Request,
  UnauthorizedException,
} from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";
import { Response } from "express";
import { ClientsService } from "./clients.service";
import {
  CreateClientDto,
  CreateClientWithImageDto,
  ForgotPasswordDto,
  RegisterClientDto,
  ResetPasswordDto,
  SendEmailDto,
  SendSmsDto,
  CheckExistenceDto,
  RegisterClientBySmsDto,
  SendOtpClientDto,
  VerifyOtpClientDto,
  LoginClientBySmsDto,
  SendCustomSmsClientDto,
} from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { CreateFavoriteDestinationDto } from "./dto/create-favorite-destination.dto";
import { UpdateFavoriteDestinationDto } from "./dto/update-favorite-destination.dto";
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
import { FileInterceptor } from "@nestjs/platform-express";
import { ClientJwtAuthGuard } from "./guards/client-jwt-auth.guard";
import { SkipAuth } from "../auth/decorators/skip-auth.decorator";

export const clientStorage = {
  storage: diskStorage({
    destination: "./uploads/photos/clients",
    filename: (req, file, callback) => {
      // Génère un nom de fichier unique : fileFieldName-timestamp-random.ext
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtName = extname(file.originalname);
      callback(null, `${file.fieldname}-${uniqueSuffix}${fileExtName}`);
    },
  }),
};
@ApiTags("clients")
@Controller("clients")
// @UseGuards(ClientJwtAuthGuard)
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post("with-photo")
  @SkipAuth()
  @ApiOperation({ summary: "Créer un nouveau client avec upload de photo" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({
    status: 201,
    description: "Le client a été créé avec succès.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Fichier image à uploader",
        },
        nom: { type: "string", description: "Nom du client" },
        prenom: { type: "string", description: "Prénom du client" },
        email: { type: "string", description: "Email du client" },
        telephone: { type: "string", description: "Téléphone du client" },
        adresse: { type: "string", description: "Adresse du client" },
        ville: { type: "string", description: "Ville du client" },
        preferences: { type: "string", description: "Préférences du client" },
      },
      required: ["nom", "prenom", "email", "telephone", "ville"],
    },
  })
  @UseInterceptors(FileInterceptor("file", clientStorage))
  async createWithPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() createClientDto: CreateClientWithImageDto
  ) {
    // Mise à jour du profileUrl avec le chemin relatif du fichier uploadé
    if (file) {
      createClientDto.profileUrl = `uploads/photos/clients/${file.filename}`;
    }
    return this.clientsService.create(createClientDto);
  }

  @Post()
  @SkipAuth()
  @ApiOperation({ summary: "Créer un nouveau client" })
  @ApiResponse({ status: 201, description: "Client créé avec succès" })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Post("/message")
  @SkipAuth()
  @ApiOperation({ summary: "envoyer un email à un client" })
  @ApiResponse({ status: 201, description: "message envoyer" })
  message(@Body() data: SendEmailDto) {
    return this.clientsService.sendEmail(data);
  }

  @Post("/register")
  @SkipAuth()
  @ApiOperation({ summary: "Enregistrer un nouveau client" })
  @ApiResponse({ status: 201, description: "Client enregistré avec succès" })
  @ApiResponse({
    status: 400,
    description: "Un client avec cet email existe déjà",
  })
  async register(@Body() data: RegisterClientDto) {
    return this.clientsService.registerClient(data);
  }

  // === ENDPOINTS SMS/OTP CLIENTS ===

  @Post("/register-sms")
  @SkipAuth()
  @ApiOperation({ summary: "Inscription d'un client via SMS" })
  @ApiResponse({
    status: 201,
    description: "Client inscrit avec succès via SMS",
  })
  @ApiResponse({ status: 400, description: "Numéro de téléphone déjà utilisé" })
  async registerBySms(@Body() registerDto: RegisterClientBySmsDto) {
    return this.clientsService.registerBySms(registerDto);
  }

  @Post("/send-otp")
  @SkipAuth()
  @ApiOperation({ summary: "Envoyer un code OTP pour connexion client" })
  @ApiResponse({ status: 200, description: "Code OTP envoyé avec succès" })
  @ApiResponse({ status: 404, description: "Client non trouvé" })
  async sendOtpClient(@Body() sendOtpDto: SendOtpClientDto) {
    return this.clientsService.sendOtpForLogin(sendOtpDto.telephone);
  }

  @Post("/verify-otp")
  @SkipAuth()
  @ApiOperation({ summary: "Vérifier le code OTP et se connecter" })
  @ApiResponse({ status: 200, description: "Connexion réussie via OTP" })
  @ApiResponse({ status: 400, description: "Code OTP invalide ou expiré" })
  async verifyOtpClient(@Body() verifyOtpDto: VerifyOtpClientDto) {
    return this.clientsService.loginBySms(
      verifyOtpDto.telephone,
      verifyOtpDto.otp
    );
  }

  @Post("/login-sms")
  @SkipAuth()
  @ApiOperation({ summary: "Connexion directe client via SMS avec OTP" })
  @ApiResponse({ status: 200, description: "Connexion réussie via SMS" })
  @ApiResponse({
    status: 400,
    description: "Code OTP invalide ou client non trouvé",
  })
  async loginBySms(@Body() loginSmsDto: LoginClientBySmsDto) {
    return this.clientsService.loginBySms(
      loginSmsDto.telephone,
      loginSmsDto.otp
    );
  }

  @Post("/resend-otp")
  @SkipAuth()
  @ApiOperation({ summary: "Renvoyer un nouveau code OTP pour client" })
  @ApiResponse({ status: 200, description: "Nouveau code OTP envoyé" })
  @ApiResponse({ status: 404, description: "Client non trouvé" })
  async resendOtpClient(@Body() sendOtpDto: SendOtpClientDto) {
    return this.clientsService.resendOtpClient(sendOtpDto.telephone);
  }

  @Post("/send-custom-sms")
  @ApiOperation({ summary: "Envoyer un SMS personnalisé aux clients" })
  @ApiResponse({ status: 200, description: "SMS envoyé avec succès" })
  @ApiResponse({ status: 400, description: "Erreur lors de l'envoi du SMS" })
  async sendCustomSmsClient(@Body() sendSmsDto: SendCustomSmsClientDto) {
    return this.clientsService.sendCustomSmsClient(sendSmsDto);
  }

  // === FIN ENDPOINTS SMS/OTP CLIENTS ===

  @Post("/sms")
  @SkipAuth()
  @ApiOperation({ summary: "envoyer un sms à un client" })
  @ApiResponse({ status: 201, description: "message envoyer" })
  sms(@Body() data: SendSmsDto) {
    return this.clientsService.sendSms(data);
  }

  @Post("/verify-email")
  @SkipAuth()
  @ApiOperation({ summary: "Vérifier l'email d'un client avec un OTP" })
  @ApiResponse({ status: 200, description: "Email vérifié avec succès" })
  @ApiResponse({ status: 404, description: "Client non trouvé" })
  @ApiResponse({ status: 400, description: "Code de validation incorrect" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email du client" },
        otp: { type: "string", description: "Code OTP envoyé au client" },
      },
      required: ["email", "otp"],
    },
  })
  async verifyEmail(@Body("email") email: string, @Body("otp") otp: string) {
    return this.clientsService.validateOtp(email, otp);
  }

  @Post("/login")
  @SkipAuth()
  @ApiOperation({ summary: "Connexion client" })
  @ApiResponse({ status: 200, description: "Connexion réussie" })
  @ApiResponse({ status: 404, description: "Client non trouvé" })
  @ApiResponse({ status: 400, description: "Email ou mot de passe incorrect" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Email du client",
          example: "jean.dupont@yopmail.com",
        },
        password: {
          type: "string",
          description: "Mot de passe du client",
          example: "MotDePasse123!",
        },
      },
      required: ["email", "password"],
    },
  })
  async login(
    @Body("email") email: string,
    @Body("password") password: string
  ) {
    return this.clientsService.login(email, password);
  }

  @Post("/forgot-password")
  @SkipAuth()
  @ApiOperation({ summary: "Demande de réinitialisation de mot de passe" })
  @ApiResponse({ status: 200, description: "Email de réinitialisation envoyé" })
  @ApiResponse({ status: 404, description: "Client non trouvé" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Email du client",
          example: "jean.dupont@example.com",
        },
      },
      required: ["email"],
    },
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.clientsService.forgotPassword(forgotPasswordDto);
  }

  @Post("/reset-password")
  @SkipAuth()
  @ApiOperation({ summary: "Réinitialisation du mot de passe avec code" })
  @ApiResponse({
    status: 200,
    description: "Mot de passe réinitialisé avec succès",
  })
  @ApiResponse({ status: 404, description: "Client non trouvé" })
  @ApiResponse({ status: 401, description: "Code incorrect ou expiré" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Email du client",
          example: "jean.dupont@example.com",
        },
        resetCode: {
          type: "string",
          description: "Code de réinitialisation",
          example: "123456",
        },
        password: {
          type: "string",
          description: "Nouveau mot de passe",
          example: "NouveauMotDePasse123!",
        },
      },
      required: ["email", "resetCode", "password"],
    },
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.clientsService.resetPassword(resetPasswordDto);
  }

  @Post("/resend-confirmation-email")
  @SkipAuth()
  @ApiOperation({ summary: "Renvoyer un email de confirmation d'inscription" })
  @ApiResponse({
    status: 200,
    description: "Email de confirmation renvoyé avec succès",
  })
  @ApiResponse({ status: 404, description: "Client non trouvé" })
  @ApiResponse({ status: 406, description: "Le compte est déjà vérifié" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Email du client",
          example: "jean.dupont@example.com",
        },
      },
      required: ["email"],
    },
  })
  async resendConfirmationEmail(@Body("email") email: string) {
    return this.clientsService.resendConfirmationEmail(email);
  }

  @Post("/check-existence")
  @SkipAuth()
  @ApiOperation({
    summary: "Vérifier l'existence d'un email ou téléphone client",
  })
  @ApiResponse({
    status: 200,
    description: "Vérification effectuée avec succès",
  })
  @ApiResponse({
    status: 406,
    description: "Veuillez fournir un email ou un numéro de téléphone",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email du client à vérifier" },
        telephone: {
          type: "string",
          description: "Téléphone du client à vérifier",
        },
      },
      description: "Au moins un des champs doit être fourni",
    },
  })
  async checkExistence(@Body() checkExistenceDto: CheckExistenceDto) {
    return this.clientsService.checkExistence(
      checkExistenceDto.email,
      checkExistenceDto.telephone
    );
  }

  @Get("me")
  @UseGuards(ClientJwtAuthGuard)
  @ApiOperation({ summary: "Récupérer le profil du client connecté" })
  @ApiResponse({ status: 200, description: "Profil récupéré avec succès" })
  @ApiResponse({ status: 401, description: "Non autorisé" })
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    // Attendre que req.user existe et ait un id
    if (!req.user || !req.user.id) {
      console.log("User or user.id is missing, waiting...");

      // Optionnel : attendre un court délai
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Re-vérifier après le délai
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException(
          "Utilisateur non authentifié ou ID manquant"
        );
      }
    }

    console.log("User validated:", req.user);
    return this.clientsService.findOne(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Récupérer tous les clients" })
  @ApiResponse({
    status: 200,
    description: "Liste des clients récupérée avec succès",
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
    description: "Filtrer par statut du client",
  })
  @ApiQuery({
    name: "ville",
    required: false,
    description: "Filtrer par ville du client",
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Rechercher par nom, prénom, email ou téléphone",
  })
  findAll(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @Query("statut") statut?: string,
    @Query("ville") ville?: string,
    @Query("search") search?: string
  ) {
    const filters: any = {};

    if (statut) {
      filters.statut = statut;
    }

    if (ville) {
      filters.ville = ville;
    }

    if (search) {
      filters.OR = [
        { nom: { contains: search, mode: "insensitive" } },
        { prenom: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { telephone: { contains: search, mode: "insensitive" } },
      ];
    }

    return this.clientsService.findAll({
      skip: skip ? Number.parseInt(skip) : undefined,
      take: take ? Number.parseInt(take) : undefined,
      where: Object.keys(filters).length > 0 ? filters : undefined,
      orderBy: { nom: "asc" },
    });
  }

  @Get(":id/photo")
  @SkipAuth()
  async getClientPhoto(@Param("id") id: string, @Res() res: Response) {
    const client = await this.clientsService.findOne(Number(id));
    if (!client || !client.profileUrl) {
      throw new NotFoundException("Client ou photo non trouvé.");
    }
    return res.sendFile(client.profileUrl.replace("uploads/", ""), {
      root: "uploads",
    });
  }

  @Get("count")
  @ApiOperation({ summary: "Compter le nombre de clients" })
  @ApiResponse({
    status: 200,
    description: "Nombre de clients récupéré avec succès",
  })
  count() {
    return this.clientsService.count();
  }

  @Get(":id")
  @ApiOperation({ summary: "Récupérer un client par son ID" })
  @ApiResponse({ status: 200, description: "Client récupéré avec succès" })
  @ApiResponse({ status: 404, description: "Client non trouvé" })
  findOne(@Param("id") id: string) {
    return this.clientsService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Mettre à jour un client" })
  @ApiResponse({ status: 200, description: "Client mis à jour avec succès" })
  @ApiResponse({ status: 404, description: "Client non trouvé" })
  update(@Param("id") id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(+id, updateClientDto);
  }

  @Patch("avatar/:id")
  @ApiOperation({ summary: "Mettre à jour la photo de pofil d'un client" })
  @ApiResponse({ status: 200, description: "Client mis à jour avec succès" })
  @ApiResponse({ status: 404, description: "Client non trouvé" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Fichier image à uploader",
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file", clientStorage))
  updateAvatar(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.clientsService.updateProfileUrl(+id, file.filename);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Supprimer un client" })
  @ApiResponse({ status: 200, description: "Client supprimé avec succès" })
  @ApiResponse({ status: 404, description: "Client non trouvé" })
  remove(@Param("id") id: string) {
    return this.clientsService.remove(+id);
  }

  @Post(":id/favorites")
  @UseGuards(ClientJwtAuthGuard)
  @ApiOperation({ summary: "Ajouter une destination favorite pour un client" })
  @ApiResponse({
    status: 201,
    description: "La destination favorite a été ajoutée avec succès.",
  })
  async addFavoriteDestination(
    @Param("id") id: string,
    @Body() createFavoriteDto: CreateFavoriteDestinationDto
  ) {
    return this.clientsService.addFavoriteDestination(+id, createFavoriteDto);
  }

  @Get(":id/favorites")
  @UseGuards(ClientJwtAuthGuard)
  @ApiOperation({ summary: "Récupérer les destinations favorites d'un client" })
  @ApiResponse({
    status: 200,
    description: "Liste des destinations favorites récupérée avec succès.",
  })
  async getFavoriteDestinations(@Param("id") id: string) {
    return this.clientsService.getFavoriteDestinations(+id);
  }

  @Patch(":id/favorites/:favoriteId")
  @UseGuards(ClientJwtAuthGuard)
  @ApiOperation({ summary: "Mettre à jour une destination favorite" })
  @ApiResponse({
    status: 200,
    description: "La destination favorite a été mise à jour avec succès.",
  })
  async updateFavoriteDestination(
    @Param("id") id: string,
    @Param("favoriteId") favoriteId: string,
    @Body() updateFavoriteDto: UpdateFavoriteDestinationDto
  ) {
    return this.clientsService.updateFavoriteDestination(
      +id,
      +favoriteId,
      updateFavoriteDto
    );
  }

  @Delete(":id/favorites/:favoriteId")
  @UseGuards(ClientJwtAuthGuard)
  @ApiOperation({ summary: "Supprimer une destination favorite" })
  @ApiResponse({
    status: 200,
    description: "La destination favorite a été supprimée avec succès.",
  })
  async deleteFavoriteDestination(
    @Param("id") id: string,
    @Param("favoriteId") favoriteId: string
  ) {
    return this.clientsService.deleteFavoriteDestination(+id, +favoriteId);
  }
}
