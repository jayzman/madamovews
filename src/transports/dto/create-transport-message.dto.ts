import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';

export class CreateTransportMessageDto {
  @ApiProperty({
    description: 'Contenu du message',
    example: 'Bonjour, je suis en route vers votre adresse',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le contenu du message est requis' })
  contenu: string;

  @ApiProperty({
    description: 'Type d\'expéditeur',
    enum: ['CLIENT', 'CHAUFFEUR'],
    example: 'CHAUFFEUR',
  })
  @IsEnum(['CLIENT', 'CHAUFFEUR'], { message: 'Le type d\'expéditeur doit être CLIENT ou CHAUFFEUR' })
  @IsNotEmpty({ message: 'Le type d\'expéditeur est requis' })
  expediteurType: 'CLIENT' | 'CHAUFFEUR';

  @ApiProperty({
    description: 'ID de l\'expéditeur',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'L\'ID de l\'expéditeur est requis' })
  expediteurId: number;
}
