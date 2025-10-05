import { IsNotEmpty, IsNumber, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class RechargerCreditDto {
  @ApiProperty({
    example: 100,
    description: "Montant à recharger",
  })
  @IsNumber({}, { message: "Le montant doit être un nombre" })
  @Min(0, { message: "Le montant doit être supérieur ou égal à 0" })
  @IsNotEmpty({ message: "Le montant est requis" })
  montant: number
}

