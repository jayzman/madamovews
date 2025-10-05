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
exports.PromoCodesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const create_promo_code_dto_1 = require("./dto/create-promo-code.dto");
let PromoCodesService = class PromoCodesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPromoCodeDto) {
        const { dateExpiration, ...rest } = createPromoCodeDto;
        const existingCode = await this.prisma.promoCode.findUnique({
            where: { code: createPromoCodeDto.code }
        });
        if (existingCode) {
            throw new common_1.BadRequestException("Ce code promo existe déjà");
        }
        return this.prisma.promoCode.create({
            data: {
                ...rest,
                dateExpiration: dateExpiration ? new Date(dateExpiration) : null,
            },
        });
    }
    async findAll() {
        return this.prisma.promoCode.findMany({
            include: {
                _count: {
                    select: { transports: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id) {
        const promoCode = await this.prisma.promoCode.findUnique({
            where: { id },
            include: {
                transports: {
                    include: {
                        client: {
                            select: { nom: true, prenom: true, email: true }
                        }
                    }
                },
                _count: {
                    select: { transports: true }
                }
            }
        });
        if (!promoCode) {
            throw new common_1.NotFoundException("Code promo non trouvé");
        }
        return promoCode;
    }
    async update(id, updatePromoCodeDto) {
        const { dateExpiration, ...rest } = updatePromoCodeDto;
        await this.findOne(id);
        if (updatePromoCodeDto.code) {
            const existingCode = await this.prisma.promoCode.findUnique({
                where: {
                    code: updatePromoCodeDto.code,
                    NOT: { id }
                }
            });
            if (existingCode) {
                throw new common_1.BadRequestException("Ce code promo existe déjà");
            }
        }
        return this.prisma.promoCode.update({
            where: { id },
            data: {
                ...rest,
                dateExpiration: dateExpiration ? new Date(dateExpiration) : undefined,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.promoCode.delete({
            where: { id },
        });
    }
    async validateAndGetCode(code, montantCourse) {
        const promoCode = await this.prisma.promoCode.findUnique({
            where: { code }
        });
        if (!promoCode) {
            throw new common_1.BadRequestException("Code promo invalide");
        }
        if (!promoCode.actif) {
            throw new common_1.BadRequestException("Code promo inactif");
        }
        if (promoCode.dateExpiration && new Date() > promoCode.dateExpiration) {
            throw new common_1.BadRequestException("Code promo expiré");
        }
        if (promoCode.utilisationsMax && promoCode.utilisations >= promoCode.utilisationsMax) {
            throw new common_1.BadRequestException("Code promo épuisé (limite d'utilisation atteinte)");
        }
        if (promoCode.montantMinimum && montantCourse < promoCode.montantMinimum) {
            throw new common_1.BadRequestException(`Montant minimum de ${promoCode.montantMinimum}€ requis pour utiliser ce code`);
        }
        return promoCode;
    }
    calculateDiscount(promoCode, montantCourse) {
        if (promoCode.typeReduction === create_promo_code_dto_1.TypeReduction.PERCENTAGE) {
            return Math.round((montantCourse * promoCode.valeurReduction / 100) * 100) / 100;
        }
        else if (promoCode.typeReduction === create_promo_code_dto_1.TypeReduction.FIXED_AMOUNT) {
            return Math.min(promoCode.valeurReduction, montantCourse);
        }
        return 0;
    }
    async incrementUsage(promoCodeId) {
        return this.prisma.promoCode.update({
            where: { id: promoCodeId },
            data: {
                utilisations: {
                    increment: 1
                }
            }
        });
    }
    async validatePromoCode(code, montantCourse) {
        const promoCode = await this.validateAndGetCode(code, montantCourse);
        const montantReduction = this.calculateDiscount(promoCode, montantCourse);
        const montantFinal = Math.max(0, montantCourse - montantReduction);
        return {
            valid: true,
            promoCode: {
                id: promoCode.id,
                code: promoCode.code,
                typeReduction: promoCode.typeReduction,
                valeurReduction: promoCode.valeurReduction
            },
            montantOriginal: montantCourse,
            montantReduction,
            montantFinal
        };
    }
    async getStats() {
        console.log("🔄 Obtention des statistiques des codes promo");
        const now = new Date();
        const totalCodes = await this.prisma.promoCode.count();
        const activeCodes = await this.prisma.promoCode.count({
            where: {
                actif: true,
                dateExpiration: {
                    gt: now
                }
            }
        });
        const expiredCodes = await this.prisma.promoCode.count({
            where: {
                dateExpiration: {
                    lte: now
                }
            }
        });
        const inactiveCodes = await this.prisma.promoCode.count({
            where: {
                actif: false
            }
        });
        const topUsedCodes = await this.prisma.promoCode.findMany({
            select: {
                code: true,
                description: true,
                utilisations: true,
                utilisationsMax: true,
                typeReduction: true,
                valeurReduction: true
            },
            orderBy: {
                utilisations: 'desc'
            },
            take: 5
        });
        return {
            totalCodes,
            activeCodes,
            expiredCodes,
            inactiveCodes,
            topUsedCodes
        };
    }
};
exports.PromoCodesService = PromoCodesService;
exports.PromoCodesService = PromoCodesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromoCodesService);
//# sourceMappingURL=promo-codes.service.js.map