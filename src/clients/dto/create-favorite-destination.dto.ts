import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDestinationDto {
  @ApiProperty({
    description: 'Titre personnalisé pour la destination favorite',
    example: 'Mon bureau',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Adresse complète de la destination',
    example: '123 Rue du Commerce, 75001 Paris',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Description optionnelle de la destination',
    example: 'Entrée par la porte principale',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Latitude de la destination',
    example: 48.8566,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'Longitude de la destination',
    example: 2.3522,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
