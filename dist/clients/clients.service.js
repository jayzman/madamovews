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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = require("fs");
const bcrypt = require("bcrypt");
const email_service_1 = require("../email.service");
const path = require("path");
const sms_service_1 = require("../sms.service");
const jwt_1 = require("@nestjs/jwt");
let ClientsService = class ClientsService {
    constructor(prisma, emailService, smsService, jwtService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.smsService = smsService;
        this.jwtService = jwtService;
    }
    async create(createClientDto) {
        try {
            return this.prisma.client.create({
                data: createClientDto,
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async registerClient(data) {
        const { email, password, ...details } = data;
        const existingClient = await this.prisma.client.findUnique({
            where: { email },
        });
        if (existingClient) {
            throw new Error('Un client avec cet email existe déjà.');
        }
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const newClient = await this.prisma.client.create({
            data: {
                email,
                password: hashedPassword,
                validationCode,
                verified: false,
                ...details,
            },
        });
        await this.emailService.sendEmail({
            to: email,
            subject: 'Confirmation de votre inscription',
            template: path.join(process.cwd(), 'src/templates/confirmRegistration.hbs'),
        }, {
            clientName: `${details.nom} ${details.prenom}`,
            validationCode,
            year: new Date().getFullYear(),
        });
        return newClient;
    }
    async validateOtp(email, otp) {
        const client = await this.prisma.client.findUnique({
            where: { email },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'email ${email} non trouvé`);
        }
        if (client.validationCode !== otp) {
            throw new Error('Le code de validation est incorrect.');
        }
        const updatedClient = await this.prisma.client.update({
            where: { email },
            data: {
                verified: true,
                validationCode: null,
            },
        });
        const token = this.jwtService.sign({
            sub: updatedClient.id,
            email: updatedClient.email
        }, {
            expiresIn: '7d',
            secret: process.env.JWT_SECRET_CLIENT || "mema_group_client"
        });
        const { password, validationCode, ...clientData } = updatedClient;
        return { token, client: clientData };
    }
    async resendConfirmationEmail(email) {
        const client = await this.prisma.client.findUnique({
            where: { email },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'email ${email} non trouvé`);
        }
        if (client.verified) {
            throw new common_1.NotAcceptableException('Le compte client est déjà vérifié.');
        }
        const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
        await this.prisma.client.update({
            where: { email },
            data: {
                validationCode,
            },
        });
        await this.emailService.sendEmail({
            to: email,
            subject: 'Confirmation de votre inscription',
            template: path.join(process.cwd(), 'src/templates/confirmRegistration.hbs'),
        }, {
            clientName: `${client.nom} ${client.prenom}`,
            validationCode,
            year: new Date().getFullYear(),
        });
        return { message: 'Un nouveau code de validation a été envoyé à votre adresse email.' };
    }
    async login(email, password) {
        const client = await this.prisma.client.findUnique({
            where: { email },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'email ${email} non trouvé`);
        }
        if (!client.verified) {
            throw new common_1.NotAcceptableException('Le compte client n\'est pas encore vérifié.');
        }
        const isPasswordValid = await bcrypt.compare(password, client.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email ou mot de passe incorrect.');
        }
        const token = this.jwtService.sign({
            sub: client.id,
            email: client.email
        }, {
            expiresIn: '7d',
            secret: process.env.JWT_SECRET_CLIENT || "mema_group_client"
        });
        const { password: _, validationCode, ...clientData } = client;
        return { token, client: clientData };
    }
    async findAll(params) {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.client.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }
    async findOne(id) {
        const client = await this.prisma.client.findUnique({
            where: { id },
            include: {
                courses: {
                    take: 10,
                    orderBy: { startTime: "desc" },
                    include: {
                        chauffeur: true,
                    },
                },
                Transport: true,
                locations: true,
            },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'ID ${id} non trouvé`);
        }
        return client;
    }
    async update(id, updateClientDto) {
        const client = await this.prisma.client.findUnique({
            where: { id },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'ID ${id} non trouvé`);
        }
        return this.prisma.client.update({
            where: { id },
            data: updateClientDto,
        });
    }
    async updateProfileUrl(id, profileUrl) {
        const client = await this.prisma.client.findUnique({
            where: { id },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'ID ${id} non trouvé`);
        }
        if (client.profileUrl !== null) {
            const oldAvatarPath = path.join('./uploads/photos/clients', path.basename(client.profileUrl));
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }
        return this.prisma.client.update({
            where: { id },
            data: { profileUrl: `uploads/photos/clients/${profileUrl}` },
        });
    }
    async remove(id) {
        const client = await this.prisma.client.findUnique({
            where: { id },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'ID ${id} non trouvé`);
        }
        return this.prisma.client.delete({
            where: { id },
        });
    }
    async count() {
        return this.prisma.client.count();
    }
    async sendEmail(data) {
        const { email, message } = data;
        const client = await this.prisma.client.findUnique({
            where: {
                email
            }
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'ID ${email} non trouvé`);
        }
        await this.emailService.sendEmail({
            to: email,
            subject: 'Message',
            template: path.join(process.cwd(), 'src/templates/messageClient.hbs'),
        }, {
            message,
            clientName: `${client.nom} ${client.prenom}`,
            year: new Date().getFullYear(),
        });
    }
    async sendSms(data) {
        const testPhoneNumber = 'whatsapp:+33774665378';
        const testMessage = 'Hano ny tay eee';
        const { phone, message } = data;
        try {
            await this.smsService.sendSms(phone, message);
            console.log('Test SMS sent successfully.');
        }
        catch (error) {
            console.error('Failed to send test SMS:', error);
        }
    }
    async forgotPassword(data) {
        const { email } = data;
        const client = await this.prisma.client.findUnique({
            where: { email },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'email ${email} non trouvé`);
        }
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = new Date();
        resetExpires.setMinutes(resetExpires.getMinutes() + 30);
        await this.prisma.client.update({
            where: { email },
            data: {
                resetCode,
                resetCodeExpires: resetExpires,
            },
        });
        await this.emailService.sendEmail({
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            template: path.join(process.cwd(), 'src/templates/resetPassword.hbs'),
        }, {
            clientName: `${client.nom} ${client.prenom}`,
            resetCode,
            year: new Date().getFullYear(),
        });
        return { message: 'Un code de réinitialisation a été envoyé à votre adresse email.' };
    }
    async resetPassword(data) {
        const { email, resetCode, password } = data;
        const client = await this.prisma.client.findUnique({
            where: { email },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client avec l'email ${email} non trouvé`);
        }
        if (client.resetCode !== resetCode) {
            throw new common_1.UnauthorizedException('Le code de réinitialisation est incorrect.');
        }
        if (!client.resetCodeExpires || new Date() > client.resetCodeExpires) {
            throw new common_1.UnauthorizedException('Le code de réinitialisation a expiré.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.prisma.client.update({
            where: { email },
            data: {
                password: hashedPassword,
                resetCode: null,
                resetCodeExpires: null,
            },
        });
        return { message: 'Votre mot de passe a été réinitialisé avec succès.' };
    }
    async checkExistence(email, telephone) {
        if (!email && !telephone) {
            throw new common_1.NotAcceptableException('Veuillez fournir un email ou un numéro de téléphone à vérifier.');
        }
        const filters = { OR: [] };
        if (email) {
            filters.OR.push({ email });
        }
        if (telephone) {
            filters.OR.push({ telephone });
        }
        const client = await this.prisma.client.findFirst({
            where: filters,
            select: {
                id: true,
                email: true,
                telephone: true,
            },
        });
        return {
            exists: !!client,
            field: client ? (client.email === email ? 'email' : 'telephone') : null,
            data: client || null,
        };
    }
    async addFavoriteDestination(clientId, data) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client non trouvé');
        }
        return this.prisma.favoriteDestination.create({
            data: {
                ...data,
                client: {
                    connect: { id: clientId },
                },
            },
        });
    }
    async getFavoriteDestinations(clientId) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
            include: {
                favorites: true,
            },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client non trouvé');
        }
        return client.favorites;
    }
    async updateFavoriteDestination(clientId, favoriteId, data) {
        const favorite = await this.prisma.favoriteDestination.findFirst({
            where: {
                id: favoriteId,
                clientId: clientId,
            },
        });
        if (!favorite) {
            throw new common_1.NotFoundException('Destination favorite non trouvée');
        }
        return this.prisma.favoriteDestination.update({
            where: { id: favoriteId },
            data,
        });
    }
    async deleteFavoriteDestination(clientId, favoriteId) {
        const favorite = await this.prisma.favoriteDestination.findFirst({
            where: {
                id: favoriteId,
                clientId: clientId,
            },
        });
        if (!favorite) {
            throw new common_1.NotFoundException('Destination favorite non trouvée');
        }
        return this.prisma.favoriteDestination.delete({
            where: { id: favoriteId },
        });
    }
    async registerBySms(registerDto) {
        const { telephone, ...clientData } = registerDto;
        const existingClient = await this.prisma.client.findUnique({
            where: { telephone },
        });
        if (existingClient) {
            throw new Error('Un client avec ce numéro de téléphone existe déjà.');
        }
        const client = await this.prisma.client.create({
            data: {
                ...clientData,
                telephone,
                password: null,
                verified: true,
            },
        });
        const welcomeMessage = `Bienvenue ${clientData.nom} ! Votre compte client MEMA a été créé avec succès. Vous pouvez maintenant vous connecter en utilisant votre numéro de téléphone.`;
        await this.smsService.sendSms(telephone, welcomeMessage);
        return client;
    }
    async sendOtpForLogin(telephone) {
        const client = await this.prisma.client.findUnique({
            where: { telephone },
        });
        if (!client) {
            throw new common_1.NotFoundException('Aucun client trouvé avec ce numéro de téléphone');
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
        const client = await this.prisma.client.findUnique({
            where: { telephone },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client non trouvé');
        }
        const token = this.jwtService.sign({
            sub: client.id,
            telephone: client.telephone,
        }, {
            expiresIn: "7d",
            secret: process.env.JWT_SECRET_CLIENT || "mema_group_client",
        });
        const { password, validationCode, ...clientWithoutSensitiveData } = client;
        return {
            token,
            client: clientWithoutSensitiveData,
        };
    }
    async resendOtpClient(telephone) {
        const client = await this.prisma.client.findUnique({
            where: { telephone },
        });
        if (!client) {
            throw new common_1.NotFoundException('Aucun client trouvé avec ce numéro de téléphone');
        }
        await this.smsService.resendOtp(telephone);
        return {
            message: 'Nouveau code OTP envoyé avec succès',
            telephone,
        };
    }
    async sendCustomSmsClient(sendSmsDto) {
        return await this.smsService.sendCustomSms(sendSmsDto);
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.MailService,
        sms_service_1.SmsService,
        jwt_1.JwtService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map