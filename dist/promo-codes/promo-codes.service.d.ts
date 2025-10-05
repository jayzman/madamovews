import { PrismaService } from "../prisma/prisma.service";
import { CreatePromoCodeDto } from "./dto/create-promo-code.dto";
import { UpdatePromoCodeDto } from "./dto/update-promo-code.dto";
export declare class PromoCodesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPromoCodeDto: CreatePromoCodeDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, updatePromoCodeDto: UpdatePromoCodeDto): Promise<any>;
    remove(id: number): Promise<any>;
    validateAndGetCode(code: string, montantCourse: number): Promise<any>;
    calculateDiscount(promoCode: any, montantCourse: number): number;
    incrementUsage(promoCodeId: number): Promise<any>;
    validatePromoCode(code: string, montantCourse: number): Promise<{
        valid: boolean;
        promoCode: {
            id: any;
            code: any;
            typeReduction: any;
            valeurReduction: any;
        };
        montantOriginal: number;
        montantReduction: number;
        montantFinal: number;
    }>;
    getStats(): Promise<{
        totalCodes: any;
        activeCodes: any;
        expiredCodes: any;
        inactiveCodes: any;
        topUsedCodes: any;
    }>;
}
