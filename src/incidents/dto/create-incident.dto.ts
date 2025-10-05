import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { StatutIncident, TypeIncident } from "@prisma/client"

export class CreateIncidentDto {
  @ApiProperty({
    enum: TypeIncident,
    example: "RETARD",
    description: "Type d'incident",
  })
  @IsEnum(TypeIncident, {
    message: "Le type doit être l'un des suivants: RETARD, LITIGE, PROBLEME_TECHNIQUE, ACCIDENT, AUTRE",
  })
  @IsNotEmpty({ message: "Le type est requis" })
  type: TypeIncident

  @ApiProperty({
    example: "Retard de 15 minutes dû à un embouteillage",
    description: "Description de l'incident",
  })
  @IsString({ message: "La description doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "La description est requise" })
  description: string

  @ApiPropertyOptional({
    example: "2023-08-15T10:30:00",
    description: "Date de l'incident",
    default: "Date actuelle",
  })
  @IsDateString({}, { message: "La date doit être une date valide" })
  @IsOptional()
  date?: string

  @ApiPropertyOptional({
    enum: StatutIncident,
    example: "NON_RESOLU",
    description: "Statut de l'incident",
    default: "NON_RESOLU",
  })
  @IsEnum(StatutIncident, {
    message: "Le statut doit être l'un des suivants: NON_RESOLU, EN_COURS_DE_RESOLUTION, RESOLU",
  })
  @IsOptional()
  status?: StatutIncident

  @ApiPropertyOptional({
    example: 1,
    description: "ID de la course associée",
  })
  @IsNumber({}, { message: "L'ID de la course doit être un nombre" })
  @IsOptional()
  courseId?: number

  @ApiPropertyOptional({
    example: 1,
    description: "ID du chauffeur associé",
  })
  @IsNumber({}, { message: "L'ID du chauffeur doit être un nombre" })
  @IsOptional()
  chauffeurId?: number

  @ApiPropertyOptional({
    example: 1,
    description: "ID du véhicule associé",
  })
  @IsNumber({}, { message: "L'ID du véhicule doit être un nombre" })
  @IsOptional()
  vehiculeId?: number
}

