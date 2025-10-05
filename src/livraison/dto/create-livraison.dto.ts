import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StatutLivraison, StatutPaiement } from '@prisma/client';

export class CreateLivraisonDto {
  @ApiProperty({
    example: 'LIV12345',
    description: 'Code unique pour identifier la livraison',
  })
  @IsString()
  @IsNotEmpty()
  codeLivraison: string;

  @ApiProperty({
    example: 1,
    description: "ID du client expéditeur",
  })
  @IsNumber()
  @IsNotEmpty()
  expediteurId: number;

  @ApiProperty({
    example: '5 rue des Fleurs, 75000 Paris',
    description: 'Adresse où le colis sera ramassé',
  })
  @IsString()
  @IsNotEmpty()
  adresseRamassage: string;

  @ApiProperty({
    example: 'Jean Dupont',
    description: 'Nom complet du destinataire',
  })
  @IsString()
  @IsNotEmpty()
  destinataireNom: string;

  @ApiProperty({
    example: '+33612345678',
    description: 'Numéro de téléphone du destinataire',
  })
  @IsString()
  @IsNotEmpty()
  destinataireTel: string;

  @ApiProperty({
    example: '10 rue des Lilas, 75000 Paris',
    description: 'Adresse complète du destinataire',
  })
  @IsString()
  @IsNotEmpty()
  destinataireAdresse: string;

  @ApiProperty({
    example: 'Un colis fragile',
    description: 'Description du colis (optionnel)',
    required: false,
  })
  @IsString()
  @IsOptional()
  colisDescription?: string;

  @ApiProperty({
    example: 2.5,
    description: 'Poids du colis en kilogrammes',
  })
  @IsNumber()
  @IsNotEmpty()
  poids: number;

  @ApiProperty({
    example: '30x20x15 cm',
    description: 'Dimensions du colis (optionnel)',
    required: false,
  })
  @IsString()
  @IsOptional()
  dimensions?: string;

  @ApiProperty({
    example: 'EN_ATTENTE',
    description: 'Statut de la livraison (optionnel)',
    enum: StatutLivraison,
    default: StatutLivraison.EN_ATTENTE,
    required: false,
  })
  @IsEnum(StatutLivraison)
  @IsOptional()
  statut?: StatutLivraison;

  @ApiProperty({
    example: 50.0,
    description: 'Prix de la livraison',
  })
  @IsNumber()
  @IsNotEmpty()
  prix: number;

  @ApiProperty({
    example: 'EN_ATTENTE',
    description: 'Statut du paiement (optionnel)',
    enum: StatutPaiement,
    default: StatutPaiement.EN_ATTENTE,
    required: false,
  })
  @IsEnum(StatutPaiement)
  @IsOptional()
  paiementStatut?: StatutPaiement;

  @ApiProperty({
    example: '2023-12-25T10:00:00.000Z',
    description: 'Date prévue ou réelle de livraison (optionnel)',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: 'La date de livraison doit être une date valide' })
  @Type(() => Date) // Transformer la chaîne en objet Date
  dateLivraison?: Date;

  @ApiProperty({
    example: 3,
    description: "ID du chauffeur assigné à la livraison (optionnel)",
    required: false,
  })
  @IsNumber()
  @IsOptional()
  chauffeurId?: number;
}