import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TypeNotification {
  PAIEMENT = 'PAIEMENT',
  RESERVATION = 'RESERVATION',
  COURSE = 'COURSE',
  SYSTEME = 'SYSTEME',
  OFFRE = 'OFFRE',
  CARTE = 'CARTE',
  MAINTENANCE = 'MAINTENANCE',
  AUTRE = 'AUTRE',
}

export class CreateNotificationDto {
  @ApiProperty({ description: 'Titre de la notification' })
  @IsNotEmpty()
  @IsString()
  titre: string;

  @ApiProperty({ description: 'Message de la notification' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ 
    description: 'Type de notification',
    enum: TypeNotification,
    example: TypeNotification.PAIEMENT 
  })
  @IsEnum(TypeNotification)
  type: TypeNotification;

  @ApiPropertyOptional({ description: 'ID de l\'utilisateur (admin/staff) concerné' })
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional({ description: 'ID du chauffeur concerné' })
  @IsOptional()
  chauffeurId?: number;

  @ApiPropertyOptional({ description: 'ID du client concerné' })
  @IsOptional()
  clientId?: number;

  @ApiPropertyOptional({ description: 'Données supplémentaires au format JSON' })
  @IsOptional()
  @IsString()
  donnees?: string;
}