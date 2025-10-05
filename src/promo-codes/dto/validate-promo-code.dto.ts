import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class ValidatePromoCodeDto {
  @ApiProperty({
    example: "PROMO2025",
    description: "Code promo à valider",
  })
  @IsString({ message: "Le code doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le code est requis" })
  code: string;

  @ApiProperty({
    example: 100.50,
    description: "Montant de la course pour validation",
  })
  @IsNumber({}, { message: "Le montant de la course doit être un nombre" })
  @IsNotEmpty({ message: "Le montant de la course est requis" })
  montantCourse: number;
}
