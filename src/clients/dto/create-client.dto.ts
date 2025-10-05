import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { StatutClient } from "@prisma/client"

export class CreateClientDto {
  @ApiProperty({
    example: "Dupont",
    description: "Nom du client",
  })
  @IsString({ message: "Le nom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le nom est requis" })
  nom: string

  @ApiProperty({
    example: "Jean",
    description: "Prénom du client",
  })
  @IsString({ message: "Le prénom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le prénom est requis" })
  prenom: string

  @ApiProperty({
    example: "jean.dupont@example.com",
    description: "Email du client",
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string

  @ApiProperty({
    example: "0123456789",
    description: "Numéro de téléphone du client",
  })
  @IsPhoneNumber(undefined, { message: "Veuillez fournir un numéro de téléphone valide" })
  @IsNotEmpty({ message: "Le numéro de téléphone est requis" })
  telephone: string

  @ApiPropertyOptional({
    example: "123 Rue de Paris",
    description: "Adresse du client",
  })
  @IsString({ message: "L'adresse doit être une chaîne de caractères" })
  @IsOptional()
  adresse?: string

  @ApiProperty({
    example: "Paris",
    description: "Ville du client",
  })
  @IsString({ message: "La ville doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "La ville est requise" })
  ville: string

  @ApiPropertyOptional({
    enum: StatutClient,
    example: "ACTIF",
    description: "Statut du client",
    default: "ACTIF",
  })
  @IsEnum(StatutClient, { message: "Le statut doit être l'un des suivants: ACTIF, INACTIF, BANNI" })
  @IsOptional()
  statut?: StatutClient

  @ApiPropertyOptional({
    example: "Préfère les véhicules berline",
    description: "Préférences du client",
  })
  @IsString({ message: "Les préférences doivent être une chaîne de caractères" })
  @IsOptional()
  preferences?: string
}

export class CreateClientWithImageDto {
  @ApiProperty({ description: 'Nom du client' })
  @IsOptional()
  nom: string;

  @ApiProperty({ description: 'Prénom du client' })
  @IsOptional()
  prenom: string;

  @ApiProperty({ description: "Email du client (doit être unique)" })
  @IsOptional()
  email: string;

  @ApiProperty({ description: 'Téléphone du client' })
  @IsOptional()
  telephone: string;

  @ApiProperty({ description: 'Adresse du client', required: false })
  @IsOptional()
  adresse?: string;

  @ApiProperty({ description: 'Ville du client' })
  @IsOptional()
  ville: string;

  @ApiProperty({ description: 'URL de la photo de profil (sera renseigné après upload)', required: false })
  @IsOptional()
  profileUrl?: string;

  @ApiProperty({ description: 'Préférences du client', required: false })
  @IsOptional()
  preferences?: string;
}

export class SendEmailDto {
  @ApiProperty({ description: 'email du client' })
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Message pour le client' })
  @IsOptional()
  message?: string;
}

export class SendSmsDto {
  @ApiProperty({ description: 'Telepone du client' })
  phone: string;

  @ApiProperty({ description: 'Message pour le client' })
  message: string;
}

export class RegisterClientDto {
  @ApiProperty({
    example: "Dupont",
    description: "Nom du client",
  })
  @IsString({ message: "Le nom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le nom est requis" })
  nom: string;

  @ApiProperty({
    example: "Jean",
    description: "Prénom du client",
  })
  @IsString({ message: "Le prénom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le prénom est requis" })
  prenom: string;

  @ApiProperty({
    example: "jean.dupont@example.com",
    description: "Email du client",
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;

  @ApiProperty({
    example: "0123456789",
    description: "Numéro de téléphone du client",
  })
  @IsPhoneNumber(undefined, { message: "Veuillez fournir un numéro de téléphone valide" })
  @IsNotEmpty({ message: "Le numéro de téléphone est requis" })
  telephone: string;

  @ApiProperty({
    example: "MotDePasse123!",
    description: "Mot de passe du client",
  })
  @IsString({ message: "Le mot de passe doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le mot de passe est requis" })
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: "jean.dupont@example.com",
    description: "Email du client",
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: "123456",
    description: "Code de réinitialisation reçu par email",
  })
  @IsString({ message: "Le code de réinitialisation doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le code de réinitialisation est requis" })
  resetCode: string;

  @ApiProperty({
    example: "jean.dupont@example.com",
    description: "Email du client",
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;

  @ApiProperty({
    example: "NouveauMotDePasse123!",
    description: "Nouveau mot de passe",
  })
  @IsString({ message: "Le mot de passe doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le mot de passe est requis" })
  password: string;
}

export class CheckExistenceDto {
  @ApiProperty({
    example: "jean.dupont@example.com",
    description: "Email du client à vérifier",
    required: false
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: "0123456789",
    description: "Numéro de téléphone du client à vérifier",
    required: false
  })
  @IsPhoneNumber(undefined, { message: "Veuillez fournir un numéro de téléphone valide" })
  @IsOptional()
  telephone?: string;
}

export class RegisterClientBySmsDto {
  @ApiProperty({
    example: "Dupont",
    description: "Nom du client",
  })
  @IsString({ message: "Le nom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le nom est requis" })
  nom: string

  @ApiProperty({
    example: "Jean",
    description: "Prénom du client",
  })
  @IsString({ message: "Le prénom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le prénom est requis" })
  prenom: string

  @ApiProperty({
    example: "+33123456789",
    description: "Numéro de téléphone du client avec indicatif",
  })
  @IsPhoneNumber(undefined, { message: "Veuillez fournir un numéro de téléphone valide" })
  @IsNotEmpty({ message: "Le numéro de téléphone est requis" })
  telephone: string

  @ApiPropertyOptional({
    example: "jean.dupont@example.com",
    description: "Email du client (optionnel)",
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsOptional()
  email: string

  @ApiPropertyOptional({
    example: "123 Rue de Paris",
    description: "Adresse du client",
  })
  @IsString({ message: "L'adresse doit être une chaîne de caractères" })
  @IsOptional()
  adresse?: string

  @ApiPropertyOptional({
    example: "Paris",
    description: "Ville du client",
  })
  @IsString({ message: "La ville doit être une chaîne de caractères" })
  @IsOptional()
  ville?: string
}

export class SendOtpClientDto {
  @ApiProperty({
    example: "+33123456789",
    description: "Numéro de téléphone pour recevoir l'OTP",
  })
  @IsPhoneNumber(undefined, { message: "Veuillez fournir un numéro de téléphone valide" })
  @IsNotEmpty({ message: "Le numéro de téléphone est requis" })
  telephone: string
}

export class VerifyOtpClientDto {
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

export class LoginClientBySmsDto {
  @ApiProperty({
    example: "+33123456789",
    description: "Numéro de téléphone du client",
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

export class SendCustomSmsClientDto {
  @ApiProperty({
    example: ["+33123456789", "+33987654321"],
    description: "Numéro(s) de téléphone destinataire(s)",
    type: [String],
  })
  @IsNotEmpty({ message: "Au moins un destinataire est requis" })
  to: string | string[]

  @ApiProperty({
    example: "Votre réservation est confirmée. Merci de votre confiance !",
    description: "Message à envoyer",
  })
  @IsString({ message: "Le message doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le message est requis" })
  message: string
}