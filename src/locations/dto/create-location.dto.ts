import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, Max } from "class-validator";

export class CreateLocationDto {
  @ApiProperty({
    example: 1,
    description: "ID du client qui effectue la location",
  })
  @IsNumber()
  @IsNotEmpty({ message: "L'ID du client est requis" })
  clientId: number;

  @ApiProperty({
    example: 1,
    description: "ID du véhicule à louer",
  })
  @IsNumber()
  @IsNotEmpty({ message: "L'ID du véhicule est requis" })
  vehiculeId: number;

  @ApiProperty({
    example: "2025-05-01T10:00:00Z",
    description: "Date de début de la location",
  })
  @IsDateString()
  @IsNotEmpty({ message: "La date de début est requise" })
  dateDebut: string;

  @ApiProperty({
    example: "2025-05-05T10:00:00Z",
    description: "Date de fin de la location",
  })
  @IsDateString()
  @IsNotEmpty({ message: "La date de fin est requise" })
  dateFin: string;

  @ApiProperty({
    example: "Antananarivo, Madagascar",
    description: "Lieu de départ de la location",
  })
  @IsString()
  @IsNotEmpty({ message: "Le lieu de départ est requis" })
  lieuDepart: string;

  @ApiProperty({
    example: "Tamatave, Madagascar",
    description: "Lieu de destination de la location",
  })
  @IsString()
  @IsNotEmpty({ message: "Le lieu de destination est requis" })
  lieuDestination: string;

  @ApiPropertyOptional({
    example: -18.879190,
    description: "Latitude du lieu de départ",
  })
  @IsNumber()
  @Min(-90, { message: "La latitude doit être comprise entre -90 et 90" })
  @Max(90, { message: "La latitude doit être comprise entre -90 et 90" })
  @IsOptional()
  departLatitude?: number;

  @ApiPropertyOptional({
    example: 47.507905,
    description: "Longitude du lieu de départ",
  })
  @IsNumber()
  @Min(-180, { message: "La longitude doit être comprise entre -180 et 180" })
  @Max(180, { message: "La longitude doit être comprise entre -180 et 180" })
  @IsOptional()
  departLongitude?: number;

  @ApiPropertyOptional({
    example: -18.114729,
    description: "Latitude du lieu de destination",
  })
  @IsNumber()
  @Min(-90, { message: "La latitude doit être comprise entre -90 et 90" })
  @Max(90, { message: "La latitude doit être comprise entre -90 et 90" })
  @IsOptional()
  destinationLatitude?: number;

  @ApiPropertyOptional({
    example: 49.396800,
    description: "Longitude du lieu de destination",
  })
  @IsNumber()
  @Min(-180, { message: "La longitude doit être comprise entre -180 et 180" })
  @Max(180, { message: "La longitude doit être comprise entre -180 et 180" })
  @IsOptional()
  destinationLongitude?: number;

  @ApiPropertyOptional({
    example: 370.5,
    description: "Distance entre le lieu de départ et la destination en kilomètres",
  })
  @IsNumber()
  @IsPositive({ message: "La distance doit être positive" })
  @IsOptional()
  distance?: number;

  @ApiProperty({
    example: 250.00,
    description: "Montant total de la location",
  })
  @IsNumber()
  @IsPositive({ message: "Le montant total doit être positif" })
  @IsNotEmpty({ message: "Le montant total est requis" })
  montantTotal: number;
}