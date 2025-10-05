import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdatePositionDto {
  @ApiProperty({
    example: 48.8566,
    description: 'Latitude de la position actuelle'
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    example: 2.3522,
    description: 'Longitude de la position actuelle'
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    example: 'En route vers le client',
    description: 'Information optionnelle sur le statut',
    required: false
  })
  @IsOptional()
  @IsString()
  statusInfo?: string;

  @ApiProperty({
    example: true,
    description: 'Indique si le suivi automatique doit être activé',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  enableAutoTracking?: boolean;
}

export class PositionUpdateEventDto {
  transportId: number;
  chauffeurId: number;
  position: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
  statusInfo?: string;
}

export class ETAUpdateDto {
  transportId: number;
  estimatedArrival: Date;
  distanceRemaining: number; // en kilomètres
  durationRemaining: number; // en minutes
  timestamp: Date;
}
