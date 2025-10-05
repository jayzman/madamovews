import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ForgotPasswordDto {
  @ApiProperty({
    example: "chauffeur@example.com",
    description: "Email du chauffeur",
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: "chauffeur@example.com",
    description: "Email du chauffeur",
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;

  @ApiProperty({
    example: "123456",
    description: "Code de réinitialisation reçu par email",
  })
  @IsString({ message: "Le code de réinitialisation doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le code de réinitialisation est requis" })
  resetCode: string;

  @ApiProperty({
    example: "NouveauMotDePasse123!",
    description: "Nouveau mot de passe",
  })
  @IsString({ message: "Le mot de passe doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le nouveau mot de passe est requis" })
  password: string;
}
