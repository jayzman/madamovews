import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { StatutMaintenance } from "@prisma/client"

export class CreateMaintenanceDto {
  @ApiProperty({
    example: "2023-07-15",
    description: "Date de la maintenance",
  })
  @IsDateString({}, { message: "La date doit être une date valide" })
  @IsNotEmpty({ message: "La date est requise" })
  date: string

  @ApiProperty({
    example: "Vidange",
    description: "Type de maintenance",
  })
  @IsString({ message: "Le type doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le type est requis" })
  type: string

  @ApiPropertyOptional({
    example: "Changement d'huile et filtres",
    description: "Description de la maintenance",
  })
  @IsString({ message: "La description doit être une chaîne de caractères" })
  @IsOptional()
  description?: string

  @ApiProperty({
    example: 150,
    description: "Coût de la maintenance",
  })
  @IsNumber({}, { message: "Le coût doit être un nombre" })
  @Min(0, { message: "Le coût doit être supérieur ou égal à 0" })
  @IsNotEmpty({ message: "Le coût est requis" })
  cout: number

  @ApiProperty({
    example: 15000,
    description: "Kilométrage du véhicule au moment de la maintenance",
  })
  @IsNumber({}, { message: "Le kilométrage doit être un nombre" })
  @Min(0, { message: "Le kilométrage doit être supérieur ou égal à 0" })
  @IsNotEmpty({ message: "Le kilométrage est requis" })
  kilometrage: number

  @ApiProperty({
    enum: StatutMaintenance,
    example: "PLANIFIE",
    description: "Statut de la maintenance",
    default: "PLANIFIE",
  })
  @IsEnum(StatutMaintenance, { message: "Le statut doit être l'un des suivants: PLANIFIE, EN_COURS, TERMINE, ANNULE" })
  @IsNotEmpty({ message: "Le statut est requis" })
  statut: StatutMaintenance
}

