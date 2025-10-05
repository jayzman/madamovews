import { PartialType } from "@nestjs/swagger"
import { CreateChauffeurDto } from "./create-chauffeur.dto"
import { IsOptional, IsString } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateChauffeurDto extends PartialType(CreateChauffeurDto) {
  @ApiPropertyOptional({
    description: "URL de la photo du chauffeur",
    example: "/uploads/photos/chauffeur-123.jpg",
  })
  @IsString({ message: "L'URL de la photo doit être une chaîne de caractères" })
  @IsOptional()
  photoUrl?: string
}

