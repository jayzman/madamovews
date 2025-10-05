import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { StatutCourse } from "@prisma/client"

export class CreateCourseDto {
  @ApiProperty({
    example: 1,
    description: "ID du chauffeur",
  })
  @IsNumber({}, { message: "L'ID du chauffeur doit être un nombre" })
  @IsNotEmpty({ message: "L'ID du chauffeur est requis" })
  chauffeurId: number

  @ApiProperty({
    example: 1,
    description: "ID du client",
  })
  @IsNumber({}, { message: "L'ID du client doit être un nombre" })
  @IsNotEmpty({ message: "L'ID du client est requis" })
  clientId: number

  @ApiProperty({
    example: "Place de la République, Paris",
    description: "Lieu de départ",
  })
  @IsString({ message: "Le lieu de départ doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le lieu de départ est requis" })
  startLocation: string

  @ApiProperty({
    example: "Tour Eiffel, Paris",
    description: "Lieu d'arrivée",
  })
  @IsString({ message: "Le lieu d'arrivée doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le lieu d'arrivée est requis" })
  endLocation: string

  @ApiProperty({
    example: "2023-08-15T10:30:00",
    description: "Heure de début",
  })
  @IsDateString({}, { message: "L'heure de début doit être une date valide" })
  @IsNotEmpty({ message: "L'heure de début est requise" })
  startTime: string

  @ApiPropertyOptional({
    example: "2023-08-15T11:00:00",
    description: "Heure de fin",
  })
  @IsDateString({}, { message: "L'heure de fin doit être une date valide" })
  @IsOptional()
  endTime?: string

  @ApiProperty({
    example: "25 min",
    description: "Durée estimée",
  })
  @IsString({ message: "La durée estimée doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "La durée estimée est requise" })
  estimatedDuration: string

  @ApiPropertyOptional({
    example: "Rue de la Paix, Paris",
    description: "Localisation actuelle",
  })
  @IsString({ message: "La localisation actuelle doit être une chaîne de caractères" })
  @IsOptional()
  currentLocation?: string

  @ApiProperty({
    example: 25,
    description: "Prix estimé",
  })
  @IsNumber({}, { message: "Le prix estimé doit être un nombre" })
  @Min(0, { message: "Le prix estimé doit être supérieur ou égal à 0" })
  @IsNotEmpty({ message: "Le prix estimé est requis" })
  estimatedPrice: number

  @ApiPropertyOptional({
    example: 25,
    description: "Prix final",
  })
  @IsNumber({}, { message: "Le prix final doit être un nombre" })
  @Min(0, { message: "Le prix final doit être supérieur ou égal à 0" })
  @IsOptional()
  finalPrice?: number

  @ApiProperty({
    example: "Carte bancaire",
    description: "Méthode de paiement",
  })
  @IsString({ message: "La méthode de paiement doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "La méthode de paiement est requise" })
  paymentMethod: string

  @ApiPropertyOptional({
    enum: StatutCourse,
    example: "EN_ATTENTE",
    description: "Statut de la course",
    default: "EN_ATTENTE",
  })
  @IsEnum(StatutCourse, { message: "Le statut doit être l'un des suivants: EN_ATTENTE, EN_COURS, TERMINEE, ANNULEE" })
  @IsOptional()
  status?: StatutCourse
}

