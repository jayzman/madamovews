import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsString } from "class-validator";
import { TypeExpediteur } from "@prisma/client";

export class CreateAdminMessageDto {
  @ApiProperty({
    description: 'Contenu du message',
    example: 'Bonjour, veuillez me confirmer votre emplacement actuel.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le contenu du message est requis' })
  contenu: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur administrateur',
    example: 1,
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'ID du chauffeur',
    example: 1,
  })
  @IsInt()
  chauffeurId: number;

  @ApiProperty({
    description: 'Type d\'expéditeur',
    enum: TypeExpediteur,
    example: 'ADMIN',
  })
  @IsEnum(TypeExpediteur, { message: 'Le type d\'expéditeur doit être ADMIN ou CHAUFFEUR' })
  expediteurType: TypeExpediteur;
}