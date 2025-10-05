import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TypeExpediteur } from '@prisma/client';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Contenu du message',
    example: 'Bonjour, je vais être en retard de 5 minutes.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le contenu du message est requis' })
  contenu: string;

  @ApiPropertyOptional({
    description: 'ID du client',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  clientId?: number;

  @ApiPropertyOptional({
    description: 'ID du chauffeur',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  chauffeurId?: number;

  @ApiPropertyOptional({
    description: 'ID de la réservation',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  reservationId?: number;

  @ApiPropertyOptional({
    description: 'ID de la course',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  courseId?: number;

  @ApiPropertyOptional({
    description: 'ID du transport',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  transportId?: number;

  @ApiProperty({
    description: 'Type d\'expéditeur',
    enum: TypeExpediteur,
    example: 'CLIENT',
  })
  @IsEnum(TypeExpediteur, { message: 'Le type d\'expéditeur doit être CLIENT ou CHAUFFEUR' })
  @IsNotEmpty({ message: 'Le type d\'expéditeur est requis' })
  expediteurType: TypeExpediteur;
}