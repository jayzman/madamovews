import { IsEmail, IsNotEmpty, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class LoginDto {
  @ApiProperty({
    example: "admin@madamove.com",
    description: "Adresse email de l'utilisateur",
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string

  @ApiProperty({
    example: "admin123",
    description: "Mot de passe de l'utilisateur",
  })
  @IsString({ message: "Le mot de passe doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le mot de passe est requis" })
  password: string
}

