import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export enum TypeDocument {
  PERMIS_DE_CONDUIRE = "PERMIS_DE_CONDUIRE",
  ASSURANCE = "ASSURANCE",
  CONTROLE_TECHNIQUE = "CONTROLE_TECHNIQUE",
  CARTE_PROFESSIONNELLE = "CARTE_PROFESSIONNELLE",
  AUTRE = "AUTRE",
}

export class CreateDocumentDto {
  @ApiProperty({ description: "Nom du document" })
  @IsString()
  @IsNotEmpty()
  nom: string

  @ApiProperty({ description: "Type du document", enum: TypeDocument })
  @IsString()
  @IsNotEmpty()
  type: string

  @ApiProperty({ description: "Chemin du fichier stocké", required: false })
  @IsOptional()
  @IsString()
  fichier?: string

  @ApiProperty({ description: "Type MIME du fichier", required: false })
  @IsOptional()
  @IsString()
  mimeType?: string

  @ApiProperty({ description: "Taille du fichier en octets", required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  taille?: number

  @ApiProperty({ description: "Date d'expiration du document", required: false })
  @IsDateString()
  @IsOptional()
  dateExpiration?: string
}

