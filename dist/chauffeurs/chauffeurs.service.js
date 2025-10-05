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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChauffeursService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const email_service_1 = require("../email.service");
const sms_service_1 = require("../sms.service");
const jwt_1 = require("@nestjs/jwt");
let ChauffeursService = class ChauffeursService {
    constructor(prisma, emailService, smsService, jwtService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.smsService = smsService;
        this.jwtService = jwtService;
    }
    async create(createChauffeurDto) {
        const { vehiculeId, ...chauffeurData } = createChauffeurDto;
        const temporaryPassword = Math.random().toString(36).slice(-8);
        await this.emailService.sendEmail({
            to: chauffeurData.email,
            subject: "Bienvenue sur MADAMOVE - Vos identifiants de connexion",
            template: path.join(process.cwd(), "src/templates/invitationDriver.hbs"),
        }, {
            name: chauffeurData.nom,
            email: chauffeurData.email,
            password: temporaryPassword,
            currentYear: new Date().getFullYear(),
        });
        const chauffeur = await this.prisma.chauffeur.create({
            data: {
                ...chauffeurData,
                password: await bcrypt.hash(temporaryPassword, 10),
                vehicule: vehiculeId
                    ? {
                        connect: { id: vehiculeId },
                    }
                    : undefined,
                ...(chauffeurData.statut === "INDEPENDANT" && {
                    credits: {
                        create: { solde: 0 },
                    },
                }),
            },
            include: {
                vehicule: true,
                credits: true,
            },
        });
        const { password, ...chauffeurWithoutPassword } = chauffeur;
        return chauffeurWithoutPassword;
    }
    async loginDriver(loginDto) {
        const { email, password } = loginDto;
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { email },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException("Email ou mot de passe incorrect");
        }
        const isPasswordValid = await bcrypt.compare(password, chauffeur.password);
        if (!isPasswordValid) {
            throw new common_1.NotFoundException("Email ou mot de passe incorrect");
        }
        const token = this.jwtService.sign({
            sub: chauffeur.id,
            email: chauffeur.email,
        }, {
            expiresIn: "7d",
            secret: process.env.JWT_SECRET_DRIVER || "madamove_driver",
        });
        const { password: _, ...chauffeurWithoutPassword } = chauffeur;
        return {
            token,
            chauffeur: chauffeurWithoutPassword,
        };
    }
    async findAll(params) {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.chauffeur.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include: {
                vehicule: true,
                credits: true,
            },
        });
    }
    async findOne(id) {
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id },
            include: {
                vehicule: true,
                credits: true,
                documents: true,
                Transport: true,
                courses: {
                    take: 5,
                    orderBy: { startTime: "desc" },
                    include: {
                        client: true,
                    },
                },
            },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${id} non trouvé`);
        }
        return chauffeur;
    }
    async update(id, updateChauffeurDto) {
        const { vehiculeId, ...chauffeurData } = updateChauffeurDto;
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id },
            include: { credits: true },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${id} non trouvé`);
        }
        return this.prisma.chauffeur.update({
            where: { id },
            data: {
                ...chauffeurData,
                vehicule: vehiculeId !== undefined
                    ? vehiculeId
                        ? { connect: { id: vehiculeId } }
                        : { disconnect: true }
                    : undefined,
                ...(chauffeurData.statut === "INDEPENDANT" &&
                    !chauffeur.credits && {
                    credits: {
                        create: { solde: 0 },
                    },
                }),
            },
            include: {
                vehicule: true,
                credits: true,
            },
        });
    }
    async remove(id) {
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${id} non trouvé`);
        }
        return this.prisma.chauffeur.delete({
            where: { id },
        });
    }
    async rechargerCredit(chauffeurId, montant) {
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: chauffeurId },
            include: { credits: true },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
        }
        if (chauffeur.statut !== "INDEPENDANT") {
            throw new common_1.NotFoundException(`Seuls les chauffeurs indépendants peuvent avoir des crédits`);
        }
        if (chauffeur.credits) {
            return this.prisma.credit.update({
                where: { chauffeurId },
                data: { solde: { increment: montant } },
            });
        }
        else {
            return this.prisma.credit.create({
                data: {
                    solde: montant,
                    chauffeur: { connect: { id: chauffeurId } },
                },
            });
        }
    }
    async getDocuments(chauffeurId) {
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: chauffeurId },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
        }
        return this.prisma.document.findMany({
            where: { chauffeurId },
            orderBy: { updatedAt: "desc" },
        });
    }
    async getDocument(chauffeurId, documentId) {
        try {
            console.log(`Service - Récupération du document ${documentId} pour le chauffeur ${chauffeurId}`);
            const chauffeur = await this.prisma.chauffeur.findUnique({
                where: { id: chauffeurId },
            });
            if (!chauffeur) {
                console.error(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
                throw new common_1.NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
            }
            const document = await this.prisma.document.findFirst({
                where: {
                    id: documentId,
                    chauffeurId,
                },
            });
            console.log("Document trouvé:", document);
            if (!document) {
                console.error(`Document avec l'ID ${documentId} non trouvé pour ce chauffeur`);
                throw new common_1.NotFoundException(`Document avec l'ID ${documentId} non trouvé pour ce chauffeur`);
            }
            return document;
        }
        catch (error) {
            console.error("Erreur service getDocument:", error);
            throw error;
        }
    }
    async addDocument(chauffeurId, createDocumentDto) {
        try {
            console.log("Service - Ajout document:", {
                chauffeurId,
                createDocumentDto,
            });
            const chauffeur = await this.prisma.chauffeur.findUnique({
                where: { id: chauffeurId },
            });
            if (!chauffeur) {
                throw new common_1.NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
            }
            const document = await this.prisma.document.create({
                data: {
                    nom: createDocumentDto.nom,
                    type: createDocumentDto.type,
                    fichier: createDocumentDto.fichier,
                    mimeType: createDocumentDto.mimeType,
                    taille: createDocumentDto.taille,
                    dateExpiration: createDocumentDto.dateExpiration
                        ? new Date(createDocumentDto.dateExpiration)
                        : null,
                    status: "EN_ATTENTE",
                    chauffeur: { connect: { id: chauffeurId } },
                },
            });
            console.log("Document créé:", document);
            return document;
        }
        catch (error) {
            console.error("Erreur service addDocument:", error);
            throw error;
        }
    }
    async updateDocument(chauffeurId, documentId, updateDocumentDto) {
        try {
            console.log("Service - Mise à jour document:", {
                chauffeurId,
                documentId,
                updateDocumentDto,
            });
            const chauffeur = await this.prisma.chauffeur.findUnique({
                where: { id: chauffeurId },
            });
            if (!chauffeur) {
                throw new common_1.NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
            }
            const document = await this.prisma.document.findFirst({
                where: {
                    id: documentId,
                    chauffeurId,
                },
            });
            if (!document) {
                throw new common_1.NotFoundException(`Document avec l'ID ${documentId} non trouvé pour ce chauffeur`);
            }
            const updatedDocument = await this.prisma.document.update({
                where: { id: documentId },
                data: {
                    nom: updateDocumentDto.nom,
                    type: updateDocumentDto.type,
                    dateExpiration: updateDocumentDto.dateExpiration
                        ? new Date(updateDocumentDto.dateExpiration)
                        : undefined,
                },
            });
            console.log("Document mis à jour:", updatedDocument);
            return updatedDocument;
        }
        catch (error) {
            console.error("Erreur service updateDocument:", error);
            throw error;
        }
    }
    async updateDocumentWithFile(chauffeurId, documentId, updateDocumentDto) {
        try {
            console.log("Service - Mise à jour document avec fichier:", {
                chauffeurId,
                documentId,
                updateDocumentDto,
            });
            const chauffeur = await this.prisma.chauffeur.findUnique({
                where: { id: chauffeurId },
            });
            if (!chauffeur) {
                throw new common_1.NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
            }
            const document = await this.prisma.document.findFirst({
                where: {
                    id: documentId,
                    chauffeurId,
                },
            });
            if (!document) {
                throw new common_1.NotFoundException(`Document avec l'ID ${documentId} non trouvé pour ce chauffeur`);
            }
            if (document.fichier &&
                fs.existsSync(document.fichier) &&
                updateDocumentDto.fichier) {
                try {
                    fs.unlinkSync(document.fichier);
                    console.log(`Ancien fichier supprimé: ${document.fichier}`);
                }
                catch (error) {
                    console.error(`Erreur lors de la suppression de l'ancien fichier: ${error.message}`);
                }
            }
            const updatedDocument = await this.prisma.document.update({
                where: { id: documentId },
                data: {
                    nom: updateDocumentDto.nom,
                    type: updateDocumentDto.type,
                    fichier: updateDocumentDto.fichier,
                    mimeType: updateDocumentDto.mimeType,
                    taille: updateDocumentDto.taille,
                    dateExpiration: updateDocumentDto.dateExpiration
                        ? new Date(updateDocumentDto.dateExpiration)
                        : undefined,
                    updatedAt: new Date(),
                },
            });
            console.log("Document mis à jour avec nouveau fichier:", updatedDocument);
            return updatedDocument;
        }
        catch (error) {
            console.error("Erreur service updateDocumentWithFile:", error);
            throw error;
        }
    }
    async removeDocument(chauffeurId, documentId) {
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: chauffeurId },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
        }
        const document = await this.prisma.document.findFirst({
            where: {
                id: documentId,
                chauffeurId,
            },
        });
        if (!document) {
            throw new common_1.NotFoundException(`Document avec l'ID ${documentId} non trouvé pour ce chauffeur`);
        }
        return this.prisma.document.delete({
            where: { id: documentId },
        });
    }
    async updateDocumentStatus(chauffeurId, documentId, status) {
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: chauffeurId },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
        }
        const document = await this.prisma.document.findFirst({
            where: {
                id: documentId,
                chauffeurId,
            },
        });
        if (!document) {
            throw new common_1.NotFoundException(`Document avec l'ID ${documentId} non trouvé pour ce chauffeur`);
        }
        return this.prisma.document.update({
            where: { id: documentId },
            data: { status },
        });
    }
    async getCourses(params) {
        const { skip, take, where, orderBy } = params;
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: where.chauffeurId },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${where.chauffeurId} non trouvé`);
        }
        return this.prisma.course.findMany({
            skip,
            take,
            where,
            orderBy,
            include: {
                client: true,
            },
        });
    }
    async getIncidents(params) {
        const { skip, take, where, orderBy } = params;
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: where.chauffeurId },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${where.chauffeurId} non trouvé`);
        }
        return this.prisma.incident.findMany({
            skip,
            take,
            where,
            orderBy,
            include: {
                course: true,
            },
        });
    }
    async getPerformance(chauffeurId, periode) {
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { id: chauffeurId },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
        }
        const maintenant = new Date();
        let dateDebut = new Date();
        switch (periode) {
            case "today":
                dateDebut.setHours(0, 0, 0, 0);
                break;
            case "semaine":
                dateDebut.setDate(maintenant.getDate() - 7);
                dateDebut.setHours(0, 0, 0, 0);
                break;
            case "mois":
                dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, maintenant.getDate());
                dateDebut.setHours(0, 0, 0, 0);
                break;
            case "trimestre":
                dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth() - 3, maintenant.getDate());
                dateDebut.setHours(0, 0, 0, 0);
                break;
            case "annee":
                dateDebut = new Date(maintenant.getFullYear() - 1, maintenant.getMonth(), maintenant.getDate());
                dateDebut.setHours(0, 0, 0, 0);
                break;
            default:
                dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, maintenant.getDate());
                dateDebut.setHours(0, 0, 0, 0);
        }
        const courses = await this.prisma.course.findMany({
            where: {
                chauffeurId,
                status: "TERMINEE",
                startTime: {
                    gte: dateDebut,
                    lte: maintenant,
                },
            },
            orderBy: {
                startTime: "asc",
            },
        });
        const revenuTotal = courses.reduce((total, course) => total + (course.finalPrice || 0), 0);
        const coursesParPeriode = {};
        const revenusParPeriode = {};
        courses.forEach((course) => {
            let key;
            const date = new Date(course.startTime);
            switch (periode) {
                case "today":
                    key = `${date.getHours().toString().padStart(2, "0")}:00`;
                    break;
                case "semaine":
                    const options = {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                    };
                    key = date.toLocaleDateString("fr-FR", options);
                    break;
                case "mois":
                    const premierJourMois = new Date(date.getFullYear(), date.getMonth(), 1);
                    const jourDansLeMois = date.getDate();
                    const semaineNumero = Math.ceil((jourDansLeMois + premierJourMois.getDay()) / 7);
                    key = `Semaine ${semaineNumero}`;
                    break;
                case "trimestre":
                    const moisNoms = [
                        "Jan",
                        "Fév",
                        "Mar",
                        "Avr",
                        "Mai",
                        "Jun",
                        "Jul",
                        "Aoû",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Déc",
                    ];
                    key = `${moisNoms[date.getMonth()]} ${date.getFullYear()}`;
                    break;
                case "annee":
                    const trimestre = Math.ceil((date.getMonth() + 1) / 3);
                    key = `T${trimestre} ${date.getFullYear()}`;
                    break;
                default:
                    const premierJourMoisDef = new Date(date.getFullYear(), date.getMonth(), 1);
                    const jourDansLeMoisDef = date.getDate();
                    const semaineNumeroDef = Math.ceil((jourDansLeMoisDef + premierJourMoisDef.getDay()) / 7);
                    key = `Semaine ${semaineNumeroDef}`;
            }
            coursesParPeriode[key] = (coursesParPeriode[key] || 0) + 1;
            revenusParPeriode[key] =
                (revenusParPeriode[key] || 0) + (course.finalPrice || 0);
        });
        const performanceData = Object.keys(coursesParPeriode)
            .sort()
            .map((key) => ({
            periode: key,
            courses: coursesParPeriode[key],
            revenus: revenusParPeriode[key],
        }));
        return {
            chauffeurId,
            periode,
            dateDebut: dateDebut.toISOString(),
            dateFin: maintenant.toISOString(),
            nbCourses: courses.length,
            revenuTotal,
            performanceData,
        };
    }
    async findAvailable(params) {
        const chauffeurs = await this.prisma.chauffeur.findMany({
            where: {
                vehicule: null,
                statutActivite: "ACTIF",
            },
            select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                telephone: true,
                photoUrl: true,
                evaluation: true,
            },
            skip: params.skip,
            take: params.take,
            orderBy: params.orderBy,
        });
        return {
            data: chauffeurs,
            count: await this.prisma.chauffeur.count({
                where: {
                    vehicule: null,
                    statutActivite: "ACTIF",
                },
            }),
        };
    }
    async forgotPassword(email) {
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { email },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException("Aucun chauffeur trouvé avec cet email");
        }
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetCodeExpiry = new Date(Date.now() + 30 * 60000);
        await this.prisma.chauffeur.update({
            where: { email },
            data: {
                resetCode,
                resetCodeExpiry,
            },
        });
        await this.emailService.sendEmail({
            to: email,
            subject: "Réinitialisation de votre mot de passe",
            template: path.join(process.cwd(), "src/templates/resetPassword.hbs"),
        }, {
            clientName: `${chauffeur.nom} ${chauffeur.prenom}`,
            resetCode,
            year: new Date().getFullYear(),
        });
        return {
            message: "Un code de réinitialisation a été envoyé à votre adresse email",
        };
    }
    async resetPassword(email, resetCode, newPassword) {
        console.log(`Service - Réinitialisation du mot de passe pour l'email: ${email}, code: ${resetCode}`);
        const chauffeur = await this.prisma.chauffeur.findFirst({
            where: {
                email,
                resetCode,
                resetCodeExpiry: {
                    gt: new Date(),
                },
            },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException("Code de réinitialisation invalide ou expiré");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.chauffeur.update({
            where: { id: chauffeur.id },
            data: {
                password: hashedPassword,
                resetCode: null,
                resetCodeExpiry: null,
            },
        });
        return { message: "Votre mot de passe a été réinitialisé avec succès" };
    }
    async registerBySms(registerDto) {
        const { vehiculeId, telephone, ...chauffeurData } = registerDto;
        const existingChauffeur = await this.prisma.chauffeur.findUnique({
            where: { telephone },
        });
        if (existingChauffeur) {
            throw new Error('Un chauffeur avec ce numéro de téléphone existe déjà.');
        }
        const chauffeur = await this.prisma.chauffeur.create({
            data: {
                ...chauffeurData,
                telephone,
                password: null,
                vehicule: vehiculeId
                    ? {
                        connect: { id: vehiculeId },
                    }
                    : undefined,
                ...(chauffeurData.statut === "INDEPENDANT" && {
                    credits: {
                        create: { solde: 0 },
                    },
                }),
            },
            include: {
                vehicule: true,
                credits: true,
            },
        });
        const welcomeMessage = `Bienvenue ${chauffeurData.nom} ! Votre compte chauffeur MADAMOVE a été créé avec succès. Vous pouvez maintenant vous connecter en utilisant votre numéro de téléphone.`;
        await this.smsService.sendSms(telephone, welcomeMessage);
        return chauffeur;
    }
    async sendOtpForLogin(telephone) {
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { telephone },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException('Aucun chauffeur trouvé avec ce numéro de téléphone');
        }
        const otp = await this.smsService.sendOtp(telephone);
        return {
            message: 'Code OTP envoyé avec succès',
            telephone,
        };
    }
    async loginBySms(telephone, otp) {
        const isOtpValid = await this.smsService.verifyOtp(telephone, otp);
        if (!isOtpValid) {
            throw new common_1.NotFoundException('Code OTP invalide ou expiré');
        }
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { telephone },
            include: {
                vehicule: true,
                credits: true,
            },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException('Chauffeur non trouvé');
        }
        const token = this.jwtService.sign({
            sub: chauffeur.id,
            telephone: chauffeur.telephone,
        }, {
            expiresIn: "7d",
            secret: process.env.JWT_SECRET_DRIVER || "madamove_driver",
        });
        const { password, ...chauffeurWithoutPassword } = chauffeur;
        return {
            token,
            chauffeur: chauffeurWithoutPassword,
        };
    }
    async resendOtp(telephone) {
        const chauffeur = await this.prisma.chauffeur.findUnique({
            where: { telephone },
        });
        if (!chauffeur) {
            throw new common_1.NotFoundException('Aucun chauffeur trouvé avec ce numéro de téléphone');
        }
        await this.smsService.resendOtp(telephone);
        return {
            message: 'Nouveau code OTP envoyé avec succès',
            telephone,
        };
    }
    async sendCustomSms(sendSmsDto) {
        return await this.smsService.sendCustomSms(sendSmsDto);
    }
};
exports.ChauffeursService = ChauffeursService;
exports.ChauffeursService = ChauffeursService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.MailService,
        sms_service_1.SmsService,
        jwt_1.JwtService])
], ChauffeursService);
//# sourceMappingURL=chauffeurs.service.js.map