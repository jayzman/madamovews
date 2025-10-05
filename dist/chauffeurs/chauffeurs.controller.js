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
exports.ChauffeursController = void 0;
const common_1 = require("@nestjs/common");
const chauffeurs_service_1 = require("./chauffeurs.service");
const create_chauffeur_dto_1 = require("./dto/create-chauffeur.dto");
const update_chauffeur_dto_1 = require("./dto/update-chauffeur.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const recharger_credit_dto_1 = require("./dto/recharger-credit.dto");
const create_document_dto_1 = require("./dto/create-document.dto");
const platform_express_1 = require("@nestjs/platform-express");
const fs = require("fs");
const path = require("path");
const multer_1 = require("multer");
const skip_auth_decorator_1 = require("../auth/decorators/skip-auth.decorator");
const reset_password_dto_1 = require("./dto/reset-password.dto");
let ChauffeursController = class ChauffeursController {
    constructor(chauffeursService) {
        this.chauffeursService = chauffeursService;
    }
    create(createChauffeurDto) {
        return this.chauffeursService.create(createChauffeurDto);
    }
    async loginDriver(loginDto) {
        return this.chauffeursService.loginDriver(loginDto);
    }
    async registerBySms(registerDto) {
        return this.chauffeursService.registerBySms(registerDto);
    }
    async sendOtp(sendOtpDto) {
        return this.chauffeursService.sendOtpForLogin(sendOtpDto.telephone);
    }
    async verifyOtp(verifyOtpDto) {
        return this.chauffeursService.loginBySms(verifyOtpDto.telephone, verifyOtpDto.otp);
    }
    async loginBySms(loginSmsDto) {
        return this.chauffeursService.loginBySms(loginSmsDto.telephone, loginSmsDto.otp);
    }
    async resendOtp(sendOtpDto) {
        return this.chauffeursService.resendOtp(sendOtpDto.telephone);
    }
    async sendCustomSms(sendSmsDto) {
        return this.chauffeursService.sendCustomSms(sendSmsDto);
    }
    findAvailable(skip, take) {
        return this.chauffeursService.findAvailable({
            skip: skip ? Number.parseInt(skip) : undefined,
            take: take ? Number.parseInt(take) : undefined,
            orderBy: { nom: "asc" },
        });
    }
    findAll(skip, take, statut, statutActivite, search) {
        const filters = {};
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
    findOne(id) {
        return this.chauffeursService.findOne(+id);
    }
    update(id, updateChauffeurDto) {
        return this.chauffeursService.update(+id, updateChauffeurDto);
    }
    remove(id) {
        return this.chauffeursService.remove(+id);
    }
    rechargerCredit(id, rechargerCreditDto) {
        return this.chauffeursService.rechargerCredit(+id, rechargerCreditDto.montant);
    }
    async uploadPhoto(id, file) {
        if (!file) {
            throw new Error("Aucun fichier n'a été téléchargé");
        }
        const photoUrl = `/uploads/photos/${file.filename}`;
        await this.chauffeursService.update(+id, { photoUrl });
        return { photoUrl };
    }
    getDocuments(id) {
        return this.chauffeursService.getDocuments(+id);
    }
    async addDocument(id, file, createDocumentDto) {
        try {
            console.log("Fichier reçu:", file
                ? {
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                }
                : "Aucun fichier");
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
        }
        catch (error) {
            console.error("Erreur lors de l'ajout du document:", error);
            throw error;
        }
    }
    async getDocument(id, documentId, res) {
        try {
            console.log(`Récupération du document ${documentId} pour le chauffeur ${id}`);
            const document = await this.chauffeursService.getDocument(+id, +documentId);
            console.log("Document trouvé:", document);
            if (!document.fichier) {
                console.error(`Le document ${documentId} n'a pas de fichier associé`);
                throw new common_1.NotFoundException("Le fichier n'existe pas");
            }
            if (!fs.existsSync(document.fichier)) {
                console.error(`Le fichier ${document.fichier} n'existe pas sur le serveur`);
                throw new common_1.NotFoundException("Le fichier n'existe pas sur le serveur");
            }
            console.log(`Envoi du fichier: ${document.fichier}`);
            const ext = path.extname(document.fichier).toLowerCase();
            let contentType = document.mimeType || "application/octet-stream";
            if (ext === ".pdf") {
                contentType = "application/pdf";
            }
            else if (ext === ".jpg" || ext === ".jpeg") {
                contentType = "image/jpeg";
            }
            else if (ext === ".png") {
                contentType = "image/png";
            }
            res.setHeader("Content-Type", contentType);
            res.setHeader("Content-Disposition", `inline; filename="${path.basename(document.fichier)}"`);
            const fileStream = fs.createReadStream(document.fichier);
            fileStream.pipe(res);
        }
        catch (error) {
            console.error("Erreur lors de la récupération du document:", error);
            if (error instanceof common_1.NotFoundException) {
                res.status(404).json({ message: error.message });
            }
            else {
                res
                    .status(500)
                    .json({
                    message: "Erreur lors de la récupération du document",
                    error: error.message,
                });
            }
        }
    }
    removeDocument(id, documentId) {
        return this.chauffeursService.removeDocument(+id, +documentId);
    }
    async updateDocument(id, documentId, updateDocumentDto) {
        return this.chauffeursService.updateDocument(+id, +documentId, updateDocumentDto);
    }
    async updateDocumentFile(id, documentId, file, updateDocumentDto) {
        try {
            console.log("Fichier reçu pour mise à jour:", file
                ? {
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                }
                : "Aucun fichier");
            console.log("DTO reçu pour mise à jour:", updateDocumentDto);
            if (!file) {
                throw new Error("Aucun fichier n'a été téléchargé");
            }
            const document = await this.chauffeursService.updateDocumentWithFile(+id, +documentId, {
                ...updateDocumentDto,
                fichier: file.path,
                mimeType: file.mimetype,
                taille: file.size,
            });
            return document;
        }
        catch (error) {
            console.error("Erreur lors de la mise à jour du fichier du document:", error);
            throw error;
        }
    }
    updateDocumentStatus(id, documentId, body) {
        return this.chauffeursService.updateDocumentStatus(+id, +documentId, body.status);
    }
    getCourses(id, skip, take, status, dateDebut, dateFin) {
        const filters = {
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
    getIncidents(id, skip, take, status) {
        const filters = {
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
    getPerformance(id, periode) {
        return this.chauffeursService.getPerformance(+id, periode || "mois");
    }
    async forgotPassword({ email }) {
        return this.chauffeursService.forgotPassword(email);
    }
    async resetPassword(resetPasswordDto) {
        return this.chauffeursService.resetPassword(resetPasswordDto.email, resetPasswordDto.resetCode, resetPasswordDto.password);
    }
};
exports.ChauffeursController = ChauffeursController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Créer un nouveau chauffeur" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Chauffeur créé avec succès" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chauffeur_dto_1.CreateChauffeurDto]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "create", null);
__decorate([
    (0, common_1.Post)("login"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Connexion d'un chauffeur" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Connexion réussie" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Email ou mot de passe incorrect" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chauffeur_dto_1.LoginDriverDto]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "loginDriver", null);
__decorate([
    (0, common_1.Post)("register-sms"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Inscription d'un chauffeur via SMS" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Chauffeur inscrit avec succès via SMS" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Numéro de téléphone déjà utilisé" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chauffeur_dto_1.RegisterChauffeurBySmsDto]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "registerBySms", null);
__decorate([
    (0, common_1.Post)("send-otp"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Envoyer un code OTP pour connexion" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Code OTP envoyé avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur non trouvé" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chauffeur_dto_1.SendOtpChauffeurDto]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)("verify-otp"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Vérifier le code OTP et se connecter" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Connexion réussie via OTP" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Code OTP invalide ou expiré" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chauffeur_dto_1.VerifyOtpChauffeurDto]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)("login-sms"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Connexion directe via SMS avec OTP" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Connexion réussie via SMS" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Code OTP invalide ou chauffeur non trouvé" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chauffeur_dto_1.LoginChauffeurBySmsDto]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "loginBySms", null);
__decorate([
    (0, common_1.Post)("resend-otp"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Renvoyer un nouveau code OTP" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Nouveau code OTP envoyé" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur non trouvé" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chauffeur_dto_1.SendOtpChauffeurDto]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "resendOtp", null);
__decorate([
    (0, common_1.Post)("send-custom-sms"),
    (0, swagger_1.ApiOperation)({ summary: "Envoyer un SMS personnalisé" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "SMS envoyé avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Erreur lors de l'envoi du SMS" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chauffeur_dto_1.SendCustomSmsDto]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "sendCustomSms", null);
__decorate([
    (0, common_1.Get)("disponibles"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Récupérer tous les chauffeurs disponibles (non affectés à un véhicule)",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Liste des chauffeurs disponibles récupérée avec succès",
    }),
    (0, swagger_1.ApiQuery)({
        name: "skip",
        required: false,
        description: "Nombre d'enregistrements à ignorer",
    }),
    (0, swagger_1.ApiQuery)({
        name: "take",
        required: false,
        description: "Nombre d'enregistrements à récupérer",
    }),
    __param(0, (0, common_1.Query)("skip")),
    __param(1, (0, common_1.Query)("take")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "findAvailable", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer tous les chauffeurs" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Liste des chauffeurs récupérée avec succès",
    }),
    (0, swagger_1.ApiQuery)({
        name: "skip",
        required: false,
        description: "Nombre d'enregistrements à ignorer",
    }),
    (0, swagger_1.ApiQuery)({
        name: "take",
        required: false,
        description: "Nombre d'enregistrements à récupérer",
    }),
    (0, swagger_1.ApiQuery)({
        name: "statut",
        required: false,
        description: "Filtrer par statut du chauffeur",
    }),
    (0, swagger_1.ApiQuery)({
        name: "statutActivite",
        required: false,
        description: "Filtrer par status active du chauffeur",
    }),
    (0, swagger_1.ApiQuery)({
        name: "search",
        required: false,
        description: "Rechercher par nom, prénom, email",
    }),
    __param(0, (0, common_1.Query)("skip")),
    __param(1, (0, common_1.Query)("take")),
    __param(2, (0, common_1.Query)("statut")),
    __param(3, (0, common_1.Query)("statutActivite")),
    __param(4, (0, common_1.Query)("search")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer un chauffeur par son ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Chauffeur récupéré avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour un chauffeur" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Chauffeur mis à jour avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_chauffeur_dto_1.UpdateChauffeurDto]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Supprimer un chauffeur" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Chauffeur supprimé avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(":id/recharger-credit"),
    (0, swagger_1.ApiOperation)({ summary: "Recharger le crédit d'un chauffeur indépendant" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Crédit rechargé avec succès" }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Chauffeur non trouvé ou non indépendant",
    }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, recharger_credit_dto_1.RechargerCreditDto]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "rechargerCredit", null);
__decorate([
    (0, common_1.Post)(":id/photo"),
    (0, swagger_1.ApiOperation)({ summary: "Télécharger une photo pour un chauffeur" }),
    (0, swagger_1.ApiConsumes)("multipart/form-data"),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", {
        storage: (0, multer_1.diskStorage)({
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
                return cb(new Error("Seuls les fichiers JPG, JPEG et PNG sont autorisés!"), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "uploadPhoto", null);
__decorate([
    (0, common_1.Get)(":id/documents"),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer les documents d'un chauffeur" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Documents récupérés avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Post)(":id/documents"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_document_dto_1.CreateDocumentDto]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "addDocument", null);
__decorate([
    (0, common_1.Get)(":id/documents/:documentId"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("documentId")),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Delete)(":id/documents/:documentId"),
    (0, swagger_1.ApiOperation)({ summary: "Supprimer un document d'un chauffeur" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Document supprimé avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur ou document non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("documentId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "removeDocument", null);
__decorate([
    (0, common_1.Patch)(":id/documents/:documentId"),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour un document" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Document mis à jour avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur ou document non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("documentId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "updateDocument", null);
__decorate([
    (0, common_1.Patch)(":id/documents/:documentId/file"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour le fichier d'un document" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Fichier du document mis à jour avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur ou document non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("documentId")),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "updateDocumentFile", null);
__decorate([
    (0, common_1.Patch)(":id/documents/:documentId/status"),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour le statut d'un document" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Statut du document mis à jour avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur ou document non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("documentId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "updateDocumentStatus", null);
__decorate([
    (0, common_1.Get)(":id/courses"),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer les courses d'un chauffeur" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Courses récupérées avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("skip")),
    __param(2, (0, common_1.Query)("take")),
    __param(3, (0, common_1.Query)("status")),
    __param(4, (0, common_1.Query)("dateDebut")),
    __param(5, (0, common_1.Query)("dateFin")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "getCourses", null);
__decorate([
    (0, common_1.Get)(":id/incidents"),
    (0, swagger_1.ApiOperation)({ summary: "Récupérer les incidents d'un chauffeur" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Incidents récupérés avec succès" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("skip")),
    __param(2, (0, common_1.Query)("take")),
    __param(3, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "getIncidents", null);
__decorate([
    (0, common_1.Get)(":id/performance"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Récupérer les données de performance d'un chauffeur",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Données de performance récupérées avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur non trouvé" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("periode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ChauffeursController.prototype, "getPerformance", null);
__decorate([
    (0, common_1.Post)("forgot-password"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: "Envoyer un code de réinitialisation de mot de passe",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Email de réinitialisation envoyé" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Chauffeur non trouvé" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)("reset-password"),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Réinitialiser le mot de passe avec le code reçu" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Mot de passe réinitialisé avec succès",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Code invalide ou expiré" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], ChauffeursController.prototype, "resetPassword", null);
exports.ChauffeursController = ChauffeursController = __decorate([
    (0, swagger_1.ApiTags)("chauffeurs"),
    (0, common_1.Controller)("chauffeurs"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [chauffeurs_service_1.ChauffeursService])
], ChauffeursController);
//# sourceMappingURL=chauffeurs.controller.js.map