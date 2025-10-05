import { PromoCodesService } from "./promo-codes.service";
import { CreatePromoCodeDto } from "./dto/create-promo-code.dto";
import { UpdatePromoCodeDto } from "./dto/update-promo-code.dto";
import { ValidatePromoCodeDto } from "./dto/validate-promo-code.dto";
export declare class PromoCodesController {
    private readonly promoCodesService;
    constructor(promoCodesService: PromoCodesService);
    create(createPromoCodeDto: CreatePromoCodeDto): Promise<any>;
    findAll(): Promise<any>;
    getStats(): Promise<{
        totalCodes: any;
        activeCodes: any;
        expiredCodes: any;
        inactiveCodes: any;
        topUsedCodes: any;
    }>;
    findOne(id: number): Promise<any>;
    update(id: number, updatePromoCodeDto: UpdatePromoCodeDto): Promise<any>;
    remove(id: number): Promise<any>;
    validatePromoCode(validatePromoCodeDto: ValidatePromoCodeDto): Promise<{
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
}
