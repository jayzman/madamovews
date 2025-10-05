import { IsNotEmpty, IsNumber, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class TerminerCourseDto {
  @ApiProperty({
    example: 25,
    description: "Prix final de la course",
  })
  @IsNumber({}, { message: "Le prix final doit être un nombre" })
  @Min(0, { message: "Le prix final doit être supérieur ou égal à 0" })
  @IsNotEmpty({ message: "Le prix final est requis" })
  finalPrice: number
}

