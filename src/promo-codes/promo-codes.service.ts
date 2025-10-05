import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePromoCodeDto, TypeReduction } from "./dto/create-promo-code.dto";
import { UpdatePromoCodeDto } from "./dto/update-promo-code.dto";

@Injectable()
export class PromoCodesService {
  constructor(private prisma: PrismaService) {}

  async create(createPromoCodeDto: CreatePromoCodeDto) {
    const { dateExpiration, ...rest } = createPromoCodeDto;
    
    // Vérifier si le code existe déjà
    const existingCode = await (this.prisma as any).promoCode.findUnique({
      where: { code: createPromoCodeDto.code }
    });

    if (existingCode) {
      throw new BadRequestException("Ce code promo existe déjà");
    }

    return (this.prisma as any).promoCode.create({
      data: {
        ...rest,
        dateExpiration: dateExpiration ? new Date(dateExpiration) : null,
      },
    });
  }

  async findAll() {
    return (this.prisma as any).promoCode.findMany({
      include: {
        _count: {
          select: { transports: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number) {
    const promoCode = await (this.prisma as any).promoCode.findUnique({
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
      throw new NotFoundException("Code promo non trouvé");
    }

    return promoCode;
  }

  async update(id: number, updatePromoCodeDto: UpdatePromoCodeDto) {
    const { dateExpiration, ...rest } = updatePromoCodeDto;

    // Vérifier si le code existe
    await this.findOne(id);

    // Si on change le code, vérifier qu'il n'existe pas déjà
    if (updatePromoCodeDto.code) {
      const existingCode = await (this.prisma as any).promoCode.findUnique({
        where: { 
          code: updatePromoCodeDto.code,
          NOT: { id }
        }
      });

      if (existingCode) {
        throw new BadRequestException("Ce code promo existe déjà");
      }
    }

    return (this.prisma as any).promoCode.update({
      where: { id },
      data: {
        ...rest,
        dateExpiration: dateExpiration ? new Date(dateExpiration) : undefined,
      },
    });
  }

  async remove(id: number) {
    // Vérifier si le code existe
    await this.findOne(id);

    return (this.prisma as any).promoCode.delete({
      where: { id },
    });
  }

  /**
   * Valide un code promo et le retourne s'il est valide
   */
  async validateAndGetCode(code: string, montantCourse: number) {
    const promoCode = await (this.prisma as any).promoCode.findUnique({
      where: { code }
    });

    if (!promoCode) {
      throw new BadRequestException("Code promo invalide");
    }

    if (!promoCode.actif) {
      throw new BadRequestException("Code promo inactif");
    }

    // Vérifier la date d'expiration
    if (promoCode.dateExpiration && new Date() > promoCode.dateExpiration) {
      throw new BadRequestException("Code promo expiré");
    }

    // Vérifier le nombre d'utilisations maximum
    if (promoCode.utilisationsMax && promoCode.utilisations >= promoCode.utilisationsMax) {
      throw new BadRequestException("Code promo épuisé (limite d'utilisation atteinte)");
    }

    // Vérifier le montant minimum
    if (promoCode.montantMinimum && montantCourse < promoCode.montantMinimum) {
      throw new BadRequestException(`Montant minimum de ${promoCode.montantMinimum}€ requis pour utiliser ce code`);
    }

    return promoCode;
  }

  /**
   * Calcule le montant de la réduction
   */
  calculateDiscount(promoCode: any, montantCourse: number): number {
    if (promoCode.typeReduction === TypeReduction.PERCENTAGE) {
      return Math.round((montantCourse * promoCode.valeurReduction / 100) * 100) / 100;
    } else if (promoCode.typeReduction === TypeReduction.FIXED_AMOUNT) {
      return Math.min(promoCode.valeurReduction, montantCourse);
    }
    return 0;
  }

  /**
   * Incrémente le compteur d'utilisation d'un code promo
   */
  async incrementUsage(promoCodeId: number) {
    return (this.prisma as any).promoCode.update({
      where: { id: promoCodeId },
      data: {
        utilisations: {
          increment: 1
        }
      }
    });
  }

  /**
   * Valide un code promo et retourne les informations de réduction
   */
  async validatePromoCode(code: string, montantCourse: number) {
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

  /**
   * Obtient les statistiques des codes promo
   */
  async getStats() {
    console.log("🔄 Obtention des statistiques des codes promo");
    const now = new Date();
    
    // Compter tous les codes
    const totalCodes = await (this.prisma as any).promoCode.count();
    
    // Compter les codes actifs
    const activeCodes = await (this.prisma as any).promoCode.count({
      where: {
        actif: true,
        dateExpiration: {
          gt: now
        }
      }
    });
    
    // Compter les codes expirés
    const expiredCodes = await (this.prisma as any).promoCode.count({
      where: {
        dateExpiration: {
          lte: now
        }
      }
    });
    
    // Compter les codes inactifs
    const inactiveCodes = await (this.prisma as any).promoCode.count({
      where: {
        actif: false
      }
    });
    
    // Obtenir les codes les plus utilisés
    const topUsedCodes = await (this.prisma as any).promoCode.findMany({
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
}
