import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Numéro de téléphone du client (MSISDN)' })
  @IsNotEmpty()
  @IsString()
  customerMsisdn: string;

  @ApiProperty({ description: 'Montant du paiement' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Description du paiement' })
  @IsNotEmpty()
  @IsString()
  description: string;
}