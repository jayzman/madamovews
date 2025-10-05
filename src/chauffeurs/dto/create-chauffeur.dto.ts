import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { StatutActivite, StatutChauffeur } from "@prisma/client"

export class CreateChauffeurDto {
  @ApiProperty({
    example: "Dupont",
    description: "Nom du chauffeur",
  })
  @IsString({ message: "Le nom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le nom est requis" })
  nom: string

  @ApiProperty({
    example: "Jean",
    description: "Prénom du chauffeur",
  })
  @IsString({ message: "Le prénom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le prénom est requis" })
  prenom: string

  @ApiProperty({
    example: "jean.dupont@example.com",
    description: "Email du chauffeur",
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string

  @ApiProperty({
    example: "0123456789",
    description: "Numéro de téléphone du chauffeur",
  })
  @IsPhoneNumber(undefined, { message: "Veuillez fournir un numéro de téléphone valide" })
  @IsNotEmpty({ message: "Le numéro de téléphone est requis" })
  telephone: string

  @ApiProperty({
    enum: StatutChauffeur,
    example: "SALARIE",
    description: "Statut du chauffeur (SALARIE ou INDEPENDANT)",
  })
  @IsEnum(StatutChauffeur, { message: "Le statut doit être SALARIE ou INDEPENDANT" })
  @IsNotEmpty({ message: "Le statut est requis" })
  statut: StatutChauffeur

  @ApiPropertyOptional({
    enum: StatutActivite,
    example: "ACTIF",
    description: "Statut d'activité du chauffeur (ACTIF, INACTIF ou SUSPENDU)",
    default: "ACTIF",
  })
  @IsEnum(StatutActivite, { message: "Le statut d'activité doit être ACTIF, INACTIF ou SUSPENDU" })
  @IsOptional()
  statutActivite?: StatutActivite

  @ApiPropertyOptional({
    example: 1,
    description: "ID du véhicule assigné au chauffeur",
  })
  @IsOptional()
  vehiculeId?: number
}

export class LoginDriverDto {
  @ApiProperty({
    example: "driver.madamove@yopmail.com",
    description: "Adresse email du chauffeur",
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string

  @ApiProperty({
    example: "driver123",
    description: "Mot de passe du chauffeur",
  })
  @IsString({ message: "Le mot de passe doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le mot de passe est requis" })
  password: string
}

export class RegisterChauffeurBySmsDto {
  @ApiProperty({
    example: "Dupont",
    description: "Nom du chauffeur",
  })
  @IsString({ message: "Le nom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le nom est requis" })
  nom: string

  @ApiProperty({
    example: "Jean",
    description: "Prénom du chauffeur",
  })
  @IsString({ message: "Le prénom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le prénom est requis" })
  prenom: string

  @ApiProperty({
    example: "+33123456789",
    description: "Numéro de téléphone du chauffeur avec indicatif",
  })
  @IsPhoneNumber(undefined, { message: "Veuillez fournir un numéro de téléphone valide" })
  @IsNotEmpty({ message: "Le numéro de téléphone est requis" })
  telephone: string

  @ApiProperty({
    enum: StatutChauffeur,
    example: "SALARIE",
    description: "Statut du chauffeur (SALARIE ou INDEPENDANT)",
  })
  @IsEnum(StatutChauffeur, { message: "Le statut doit être SALARIE ou INDEPENDANT" })
  @IsNotEmpty({ message: "Le statut est requis" })
  statut: StatutChauffeur

  @ApiPropertyOptional({
    example: "jean.dupont@example.com",
    description: "Email du chauffeur (optionnel)",
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsOptional()
  email: string

  @ApiPropertyOptional({
    example: 1,
    description: "ID du véhicule assigné au chauffeur",
  })
  @IsOptional()
  vehiculeId?: number
}

export class SendOtpChauffeurDto {
  @ApiProperty({
    example: "+33123456789",
    description: "Numéro de téléphone pour recevoir l'OTP",
  })
  @IsPhoneNumber(undefined, { message: "Veuillez fournir un numéro de téléphone valide" })
  @IsNotEmpty({ message: "Le numéro de téléphone est requis" })
  telephone: string
}

export class VerifyOtpChauffeurDto {
  @ApiProperty({
    example: "+33123456789",
    description: "Numéro de téléphone",
  })
  @IsPhoneNumber(undefined, { message: "Veuillez fournir un numéro de téléphone valide" })
  @IsNotEmpty({ message: "Le numéro de téléphone est requis" })
  telephone: string

  @ApiProperty({
    example: "123456",
    description: "Code OTP reçu par SMS",
  })
  @IsString({ message: "Le code OTP doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le code OTP est requis" })
  otp: string
}

export class LoginChauffeurBySmsDto {
  @ApiProperty({
    example: "+33123456789",
    description: "Numéro de téléphone du chauffeur",
  })
  @IsPhoneNumber(undefined, { message: "Veuillez fournir un numéro de téléphone valide" })
  @IsNotEmpty({ message: "Le numéro de téléphone est requis" })
  telephone: string

  @ApiProperty({
    example: "123456",
    description: "Code OTP reçu par SMS",
  })
  @IsString({ message: "Le code OTP doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le code OTP est requis" })
  otp: string
}

export class SendCustomSmsDto {
  @ApiProperty({
    example: ["+33123456789", "+33987654321"],
    description: "Numéro(s) de téléphone destinataire(s)",
    type: [String],
  })
  @IsNotEmpty({ message: "Au moins un destinataire est requis" })
  to: string | string[]

  @ApiProperty({
    example: "Votre course est confirmée. Le chauffeur arrivera dans 5 minutes.",
    description: "Message à envoyer",
  })
  @IsString({ message: "Le message doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le message est requis" })
  message: string
}
