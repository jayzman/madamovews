import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from "class-validator"

export enum PaymentMethod {
  STRIPE = "STRIPE",
  CASH = "CASH"
}

export class CreateTransportDto {
  @ApiProperty({
    example: 1,
    description: "ID du client",
  })
  @IsNumber({}, { message: "L'ID du client doit être un nombre" })
  @IsNotEmpty({ message: "L'ID du client est requis" })
  clientId: number

  @ApiProperty({
    example: 1,
    description: "ID du véhicule",
  })
  @IsNumber({}, { message: "L'ID du véhicule doit être un nombre" })
  @IsNotEmpty({ message: "L'ID du véhicule est requis" })
  vehiculeId: number

  @ApiProperty({
    example: "123 rue de Paris, 75001 Paris",
    description: "Adresse de départ",
  })
  @IsString({ message: "L'adresse de départ doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "L'adresse de départ est requise" })
  adresseDepart: string

  @ApiProperty({
    example: "456 avenue des Champs-Élysées, 75008 Paris",
    description: "Adresse de destination",
  })
  @IsString({ message: "L'adresse de destination doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "L'adresse de destination est requise" })
  adresseDestination: string

  @ApiProperty({
    example: 48.8566,
    description: "Latitude du point de départ",
  })
  @IsNumber({}, { message: "La latitude de départ doit être un nombre" })
  @IsNotEmpty({ message: "La latitude de départ est requise" })
  departLatitude: number

  @ApiProperty({
    example: 2.3522,
    description: "Longitude du point de départ",
  })
  @IsNumber({}, { message: "La longitude de départ doit être un nombre" })
  @IsNotEmpty({ message: "La longitude de départ est requise" })
  departLongitude: number

  @ApiProperty({
    example: 48.8534,
    description: "Latitude du point de destination",
  })
  @IsNumber({}, { message: "La latitude de destination doit être un nombre" })
  @IsNotEmpty({ message: "La latitude de destination est requise" })
  destinationLatitude: number

  @ApiProperty({
    example: 2.3488,
    description: "Longitude du point de destination",
  })
  @IsNumber({}, { message: "La longitude de destination doit être un nombre" })
  @IsNotEmpty({ message: "La longitude de destination est requise" })
  destinationLongitude: number

  @ApiProperty({
    example: PaymentMethod.STRIPE,
    description: "Mode de paiement choisi",
    enum: PaymentMethod,
    default: PaymentMethod.STRIPE,
  })
  @IsEnum(PaymentMethod, { message: "Le mode de paiement doit être STRIPE ou CASH" })
  @IsOptional()
  paymentMethod?: PaymentMethod

  @ApiProperty({
    example: "PROMO2025",
    description: "Code promo à appliquer",
    required: false,
  })
  @IsString({ message: "Le code promo doit être une chaîne de caractères" })
  @IsOptional()
  promoCode?: string
}