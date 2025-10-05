"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsController = exports.clientStorage = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const path_1 = require("path");
const clients_service_1 = require("./clients.service");
const create_client_dto_1 = require("./dto/create-client.dto");
const update_client_dto_1 = require("./dto/update-client.dto");
const create_favorite_destination_dto_1 = require("./dto/create-favorite-destination.dto");
const update_favorite_destination_dto_1 = require("./dto/update-favorite-destination.dto");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const client_jwt_auth_guard_1 = require("./guards/client-jwt-auth.guard");
const skip_auth_decorator_1 = require("../auth/decorators/skip-auth.decorator");
exports.clientStorage = {
    storage: (0, multer_1.diskStorage)({
        destination: './uploads/photos/clients',
        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const fileExtName = (0, path_1.extname)(file.originalname);
            callback(null, `${file.fieldname}-${uniqueSuffix}${fileExtName}`);
        },
    }),
};
let ClientsController = class ClientsController {
    constructor(clientsService) {
        this.clientsService = clientsService;
    }
    async createWithPhoto(file, createClientDto) {
        if (file) {
            createClientDto.profileUrl = `uploads/photos/clients/${file.filename}`;
        }
        return this.clientsService.create(createClientDto);
    }
    create(createClientDto) {
        return this.clientsService.create(createClientDto);
    }
    message(data) {
        return this.clientsService.sendEmail(data);
    }
    async register(data) {
        return this.clientsService.registerClient(data);
    }
    async registerBySms(registerDto) {
        return this.clientsService.registerBySms(registerDto);
    }
    async sendOtpClient(sendOtpDto) {
        return this.clientsService.sendOtpForLogin(sendOtpDto.telephone);
    }
    async verifyOtpClient(verifyOtpDto) {
        return this.clientsService.loginBySms(verifyOtpDto.telephone, verifyOtpDto.otp);
    }
    async loginBySms(loginSmsDto) {
        return this.clientsService.loginBySms(loginSmsDto.telephone, loginSmsDto.otp);
    }
    async resendOtpClient(sendOtpDto) {
        return this.clientsService.resendOtpClient(sendOtpDto.telephone);
    }
    async sendCustomSmsClient(sendSmsDto) {
        return this.clientsService.sendCustomSmsClient(sendSmsDto);
    }
    sms(data) {
        return this.clientsService.sendSms(data);
    }
    async verifyEmail(email, otp) {
        return this.clientsService.validateOtp(email, otp);
    }
    async login(email, password) {
        return this.clientsService.login(email, password);
    }
    async forgotPassword(forgotPasswordDto) {
        return this.clientsService.forgotPassword(forgotPasswordDto);
    }
    async resetPassword(resetPasswordDto) {
        return this.clientsService.resetPassword(resetPasswordDto);
    }
    async resendConfirmationEmail(email) {
        return this.clientsService.resendConfirmationEmail(email);
    }
    async checkExistence(checkExistenceDto) {
        return this.clientsService.checkExistence(checkExistenceDto.email, checkExistenceDto.telephone);
    }
    getProfile(req) {
        return req.user;
    }
    findAll(skip, take, statut, ville, search) {
        const filters = {};
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
    async getClientPhoto(id, res) {
        const client = await this.clientsService.findOne(Number(id));
        if (!client || !client.profileUrl) {
            throw new common_1.NotFoundException('Client ou photo non trouvé.');
        }
        return res.sendFile(client.profileUrl.replace('uploads/', ''), { root: 'uploads' });
    }
    count() {
        return this.clientsService.count();
    }
    findOne(id) {
        return this.clientsService.findOne(+id);
    }
    update(id, updateClientDto) {
        return this.clientsService.update(+id, updateClientDto);
    }
    updateAvatar(id, file) {
        return this.clientsService.updateProfileUrl(+id, file.filename);
    }
    remove(id) {
        return this.clientsService.remove(+id);
    }
    async addFavoriteDestination(id, createFavoriteDto) {
        return this.clientsService.addFavoriteDestination(+id, createFavoriteDto);
    }
    async getFavoriteDestinations(id) {
        return this.clientsService.getFavoriteDestinations(+id);
    }
    async updateFavoriteDestination(id, favoriteId, updateFavoriteDto) {
        return this.clientsService.updateFavoriteDestination(+id, +favoriteId, updateFavoriteDto);
    }
    async deleteFavoriteDestination(id, favoriteId) {
        return this.clientsService.deleteFavoriteDestination(+id, +favoriteId);
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Post)('with-photo'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau client avec upload de photo' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Le client a été créé avec succès.' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Fichier image à uploader',
                },
                nom: { type: 'string', description: 'Nom du client' },
                prenom: { type: 'string', description: 'Prénom du client' },
                email: { type: 'string', description: 'Email du client' },
                telephone: { type: 'string', description: 'Téléphone du client' },
                adresse: { type: 'string', description: 'Adresse du client' },
                ville: { type: 'string', description: 'Ville du client' },
                preferences: { type: 'string', description: 'Préférences du client' },
            },
            required: ['nom', 'prenom', 'email', 'telephone', 'ville'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', exports.clientStorage)),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_client_dto_1.CreateClientWithImageDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "createWithPhoto", null);
__decorate([
    (0, common_1.Post)(),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau client' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Client créé avec succès' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.CreateClientDto]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('/message'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'envoyer un email à un client' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'message envoyer' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.SendEmailDto]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "message", null);
__decorate([
    (0, common_1.Post)('/register'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer un nouveau client' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Client enregistré avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Un client avec cet email existe déjà' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.RegisterClientDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('/register-sms'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Inscription d\'un client via SMS' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Client inscrit avec succès via SMS' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Numéro de téléphone déjà utilisé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.RegisterClientBySmsDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "registerBySms", null);
__decorate([
    (0, common_1.Post)('/send-otp'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer un code OTP pour connexion client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Code OTP envoyé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client non trouvé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.SendOtpClientDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "sendOtpClient", null);
__decorate([
    (0, common_1.Post)('/verify-otp'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier le code OTP et se connecter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connexion réussie via OTP' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Code OTP invalide ou expiré' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.VerifyOtpClientDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "verifyOtpClient", null);
__decorate([
    (0, common_1.Post)('/login-sms'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Connexion directe client via SMS avec OTP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connexion réussie via SMS' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Code OTP invalide ou client non trouvé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.LoginClientBySmsDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "loginBySms", null);
__decorate([
    (0, common_1.Post)('/resend-otp'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Renvoyer un nouveau code OTP pour client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nouveau code OTP envoyé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client non trouvé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.SendOtpClientDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "resendOtpClient", null);
__decorate([
    (0, common_1.Post)('/send-custom-sms'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer un SMS personnalisé aux clients' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SMS envoyé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Erreur lors de l\'envoi du SMS' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.SendCustomSmsClientDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "sendCustomSmsClient", null);
__decorate([
    (0, common_1.Post)('/sms'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'envoyer un sms à un client' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'message envoyer' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.SendSmsDto]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "sms", null);
__decorate([
    (0, common_1.Post)('/verify-email'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier l\'email d\'un client avec un OTP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email vérifié avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Code de validation incorrect' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', description: 'Email du client' },
                otp: { type: 'string', description: 'Code OTP envoyé au client' },
            },
            required: ['email', 'otp'],
        }
    }),
    __param(0, (0, common_1.Body)('email')),
    __param(1, (0, common_1.Body)('otp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('/login'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Connexion client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connexion réussie' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Email ou mot de passe incorrect' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', description: 'Email du client', example: 'jean.dupont@yopmail.com' },
                password: { type: 'string', description: 'Mot de passe du client', example: 'MotDePasse123!' },
            },
            required: ['email', 'password'],
        },
    }),
    __param(0, (0, common_1.Body)('email')),
    __param(1, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('/forgot-password'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Demande de réinitialisation de mot de passe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email de réinitialisation envoyé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client non trouvé' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', description: 'Email du client', example: 'jean.dupont@example.com' },
            },
            required: ['email'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('/reset-password'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Réinitialisation du mot de passe avec code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mot de passe réinitialisé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Code incorrect ou expiré' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', description: 'Email du client', example: 'jean.dupont@example.com' },
                resetCode: { type: 'string', description: 'Code de réinitialisation', example: '123456' },
                password: { type: 'string', description: 'Nouveau mot de passe', example: 'NouveauMotDePasse123!' },
            },
            required: ['email', 'resetCode', 'password'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('/resend-confirmation-email'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Renvoyer un email de confirmation d\'inscription' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email de confirmation renvoyé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client non trouvé' }),
    (0, swagger_1.ApiResponse)({ status: 406, description: 'Le compte est déjà vérifié' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', description: 'Email du client', example: 'jean.dupont@example.com' },
            },
            required: ['email'],
        },
    }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "resendConfirmationEmail", null);
__decorate([
    (0, common_1.Post)('/check-existence'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier l\'existence d\'un email ou téléphone client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vérification effectuée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 406, description: 'Veuillez fournir un email ou un numéro de téléphone' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', description: 'Email du client à vérifier' },
                telephone: { type: 'string', description: 'Téléphone du client à vérifier' },
            },
            description: 'Au moins un des champs doit être fourni'
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.CheckExistenceDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "checkExistence", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(client_jwt_auth_guard_1.ClientJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer le profil du client connecté' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profil récupéré avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer tous les clients" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Liste des clients récupérée avec succès" }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, description: 'Nombre d\'enregistrements à ignorer' }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, description: 'Nombre d\'enregistrements à récupérer' }),
    (0, swagger_1.ApiQuery)({ name: 'statut', required: false, description: 'Filtrer par statut du client' }),
    (0, swagger_1.ApiQuery)({ name: 'ville', required: false, description: 'Filtrer par ville du client' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Rechercher par nom, prénom, email ou téléphone' }),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('statut')),
    __param(3, (0, common_1.Query)('ville')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/photo'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "getClientPhoto", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, swagger_1.ApiOperation)({ summary: 'Compter le nombre de clients' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nombre de clients récupéré avec succès' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "count", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer un client par son ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Client récupéré avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour un client" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Client mis à jour avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Client non trouvé" }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_client_dto_1.UpdateClientDto]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)("avatar/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour la photo de pofil d'un client" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Client mis à jour avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Client non trouvé" }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Fichier image à uploader',
                },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', exports.clientStorage)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "updateAvatar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Client supprimé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/favorites'),
    (0, common_1.UseGuards)(client_jwt_auth_guard_1.ClientJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter une destination favorite pour un client' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'La destination favorite a été ajoutée avec succès.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_favorite_destination_dto_1.CreateFavoriteDestinationDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "addFavoriteDestination", null);
__decorate([
    (0, common_1.Get)(':id/favorites'),
    (0, common_1.UseGuards)(client_jwt_auth_guard_1.ClientJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les destinations favorites d\'un client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des destinations favorites récupérée avec succès.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "getFavoriteDestinations", null);
__decorate([
    (0, common_1.Patch)(':id/favorites/:favoriteId'),
    (0, common_1.UseGuards)(client_jwt_auth_guard_1.ClientJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour une destination favorite' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'La destination favorite a été mise à jour avec succès.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('favoriteId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_favorite_destination_dto_1.UpdateFavoriteDestinationDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "updateFavoriteDestination", null);
__decorate([
    (0, common_1.Delete)(':id/favorites/:favoriteId'),
    (0, common_1.UseGuards)(client_jwt_auth_guard_1.ClientJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une destination favorite' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'La destination favorite a été supprimée avec succès.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('favoriteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "deleteFavoriteDestination", null);
exports.ClientsController = ClientsController = __decorate([
    (0, swagger_1.ApiTags)("clients"),
    (0, common_1.Controller)("clients"),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [clients_service_1.ClientsService])
], ClientsController);
//# sourceMappingURL=clients.controller.js.map