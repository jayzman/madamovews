import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { StatutVehicule, TypeVehicule, CategoryVehicule, FuelType, GearType } from "@prisma/client"
import { Transform } from "class-transformer"

export class CreateVehiculeDto {
  @ApiProperty({
    example: "Renault",
    description: "Marque du véhicule",
  })
  @IsString({ message: "La marque doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "La marque est requise" })
  marque: string

  @ApiProperty({
    example: "Clio",
    description: "Modèle du véhicule",
  })
  @IsString({ message: "Le modèle doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le modèle est requis" })
  modele: string

  @ApiProperty({
    example: "AB-123-CD",
    description: "Immatriculation du véhicule",
  })
  @IsString({ message: "L'immatriculation doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "L'immatriculation est requise" })
  immatriculation: string

  @ApiProperty({
    enum: TypeVehicule,
    example: "BERLINE",
    description: "Type du véhicule",
  })
  @IsEnum(TypeVehicule, { message: "Le type doit être l'un des suivants: VAN, BUS, BERLINE, SUV, AUTOCAR" })
  @IsNotEmpty({ message: "Le type est requis" })
  type: TypeVehicule

  @ApiProperty({
    enum: StatutVehicule,
    example: "DISPONIBLE",
    description: "Statut du véhicule",
    default: "DISPONIBLE",
  })
  @IsEnum(StatutVehicule, { message: "Le statut doit être l'un des suivants: DISPONIBLE, ASSIGNE, EN_MAINTENANCE" })
  @IsNotEmpty({ message: "Le statut est requis" })
  statut: StatutVehicule

  @ApiProperty({
    example: "2020-12-23T12:45:00.000Z",
    description: "Date d'acquisition du véhicule",
  })
  @IsDateString({}, { message: "La date d'acquisition doit être une date valide" })
  @IsNotEmpty({ message: "La date d'acquisition est requise" })
  dateAcquisition: string
  @ApiProperty({
    example: 15000,
    description: "Kilométrage du véhicule",
  })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  kilometrage: number

  @ApiProperty({
    example: "2020-12-23T12:45:00.000Z",
    description: "Date du contrôle technique",
  })
  @IsDateString({}, { message: "La date du contrôle technique doit être une date valide" })
  @IsNotEmpty({ message: "La date du contrôle technique est requise" })
  dateControleTechnique: string

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'Attachments',
    type: 'array',
    items: {
      type: 'file',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  photos: string[];

  @ApiProperty({
    enum: CategoryVehicule,
    example: "BASIC",
    description: "Catégorie du véhicule",
    default: "BASIC",
  })
  @IsEnum(CategoryVehicule, { message: "La catégorie doit être l'une des suivantes: BASIC, CONFORT, FAMILIALE, VIP, BUS" })
  @IsNotEmpty({ message: "La catégorie est requise" })
  categorie: CategoryVehicule
  @ApiProperty({
    example: 25.5,
    description: "Tarif horaire pour le transport",
  })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: "Le tarif horaire doit être un nombre" })
  @Min(0, { message: "Le tarif horaire doit être supérieur ou égal à 0" })
  @IsNotEmpty({ message: "Le tarif horaire est requis" })
  tarifHoraire: number
  @ApiProperty({
    example: 150,
    description: "Tarif journalier pour la location",
  })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: "Le tarif journalier doit être un nombre" })
  @Min(0, { message: "Le tarif journalier doit être supérieur ou égal à 0" })
  @IsNotEmpty({ message: "Le tarif journalier est requis" })
  tarifJournalier: number
  @ApiProperty({
    example: 350.5,
    description: "Puissance maximale en chevaux (hp)",
    required: false
  })
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsNumber({}, { message: "La puissance maximale doit être un nombre" })
  @IsOptional()
  maxPower?: number
  @ApiProperty({
    example: 12.5,
    description: "Consommation de carburant en km/L",
    required: false
  })
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsNumber({}, { message: "La consommation doit être un nombre" })
  @IsOptional()
  fuelConsumption?: number

  @ApiProperty({
    example: 250,
    description: "Vitesse maximale en km/h",
    required: false
  })
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsNumber({}, { message: "La vitesse maximale doit être un nombre" })
  @IsOptional()
  maxSpeed?: number

  @ApiProperty({
    example: 4.5,
    description: "Accélération 0-60mph en secondes",
    required: false
  })
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsNumber({}, { message: "L'accélération doit être un nombre" })
  @IsOptional()
  acceleration?: number

  @ApiProperty({
    example: 5,
    description: "Capacité (nombre de places)",
    required: false
  })
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsNumber({}, { message: "La capacité doit être un nombre" })
  @IsOptional()
  capacity?: number

  @ApiProperty({
    example: "Noir",
    description: "Couleur du véhicule",
    required: false
  })
  @IsString({ message: "La couleur doit être une chaîne de caractères" })
  @IsOptional()
  color?: string

  @ApiProperty({
    enum: FuelType,
    example: "ESSENCE",
    description: "Type de carburant",
    required: false
  })
  @IsEnum(FuelType, { message: "Le type de carburant doit être l'un des suivants: ESSENCE, DIESEL, ELECTRIQUE, HYBRIDE, GPL" })
  @IsOptional()
  fuelType?: FuelType

  @ApiProperty({
    enum: GearType,
    example: "AUTOMATIQUE",
    description: "Type de boîte de vitesses",
    required: false
  })
  @IsEnum(GearType, { message: "Le type de boîte de vitesses doit être l'un des suivants: MANUEL, AUTOMATIQUE, SEMI_AUTOMATIQUE" })
  @IsOptional()
  gearType?: GearType
}

