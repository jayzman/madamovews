export declare enum TypeReduction {
    PERCENTAGE = "PERCENTAGE",
    FIXED_AMOUNT = "FIXED_AMOUNT"
}
export declare class CreatePromoCodeDto {
    code: string;
    description?: string;
    typeReduction: TypeReduction;
    valeurReduction: number;
    dateExpiration?: string;
    utilisationsMax?: number;
    montantMinimum?: number;
    actif?: boolean;
}
