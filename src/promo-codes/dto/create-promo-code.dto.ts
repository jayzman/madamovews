import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString } from "class-validator";

export enum TypeReduction {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT"
}

export class CreatePromoCodeDto {
  @ApiProperty({
    example: "PROMO2025",
    description: "Code promo unique",
  })
  @IsString({ message: "Le code doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le code est requis" })
  code: string;

  @ApiProperty({
    example: "Réduction de bienvenue pour les nouveaux clients",
    description: "Description du code promo",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "La description doit être une chaîne de caractères" })
  description?: string;

  @ApiProperty({
    enum: TypeReduction,
    example: TypeReduction.PERCENTAGE,
    description: "Type de réduction (pourcentage ou montant fixe)",
  })
  @IsEnum(TypeReduction, { message: "Le type de réduction doit être PERCENTAGE ou FIXED_AMOUNT" })
  @IsNotEmpty({ message: "Le type de réduction est requis" })
  typeReduction: TypeReduction;

  @ApiProperty({
    example: 20,
    description: "Valeur de la réduction (20 pour 20% ou 20€)",
  })
  @IsNumber({}, { message: "La valeur de réduction doit être un nombre" })
  @IsNotEmpty({ message: "La valeur de réduction est requise" })
  valeurReduction: number;

  @ApiProperty({
    example: "2025-12-31T23:59:59.000Z",
    description: "Date d'expiration du code",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "La date d'expiration doit être une date valide" })
  dateExpiration?: string;

  @ApiProperty({
    example: 100,
    description: "Nombre maximum d'utilisations",
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Le nombre d'utilisations maximum doit être un nombre" })
  utilisationsMax?: number;

  @ApiProperty({
    example: 50,
    description: "Montant minimum de la course pour utiliser le code",
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Le montant minimum doit être un nombre" })
  montantMinimum?: number;

  @ApiProperty({
    example: true,
    description: "Statut actif du code promo",
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: "Le statut actif doit être un booléen" })
  actif?: boolean = true;
}
