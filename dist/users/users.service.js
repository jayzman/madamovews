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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const email_service_1 = require("../email.service");
const path = require("path");
let UsersService = class UsersService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async create(createUserDto) {
        const { email, password, nom, prenom, role } = createUserDto;
        const userExists = await this.prisma.user.findUnique({
            where: { email },
        });
        if (userExists) {
            throw new common_1.ConflictException("Un utilisateur avec cet email existe déjà");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                nom,
                prenom,
                role,
            },
        });
        const { password: _, ...result } = user;
        return result;
    }
    async inviteUser(createUserDto) {
        const { email, nom, prenom, role } = createUserDto;
        const userExists = await this.prisma.user.findUnique({
            where: { email },
        });
        if (userExists) {
            throw new common_1.ConflictException("Un utilisateur avec cet email existe déjà");
        }
        const temporaryPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                nom,
                prenom,
                role,
            },
        });
        await this.emailService.sendMailVerification({
            to: email,
            subject: 'Email confirmation',
            template: path.join(process.cwd(), 'src/templates/emailInvitation.hbs'),
        }, {
            link: temporaryPassword
        });
        console.log(`Envoyer un email à ${email} avec le mot de passe provisoire: ${temporaryPassword}`);
        const { password: _, ...result } = user;
        return result;
    }
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async update(id, updateUserDto) {
        const { email, password, nom, prenom, role } = updateUserDto;
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }
        if (email && email !== user.email) {
            const userWithEmail = await this.prisma.user.findUnique({
                where: { email },
            });
            if (userWithEmail) {
                throw new common_1.ConflictException("Cet email est déjà utilisé par un autre utilisateur");
            }
        }
        const data = {};
        if (email)
            data.email = email;
        if (nom)
            data.nom = nom;
        if (prenom)
            data.prenom = prenom;
        if (role)
            data.role = role;
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                nom: true,
                prenom: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return updatedUser;
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: `Utilisateur avec l'ID ${id} supprimé avec succès` };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, email_service_1.MailService])
], UsersService);
//# sourceMappingURL=users.service.js.map