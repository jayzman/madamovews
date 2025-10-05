import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Role } from "@prisma/client"

export class CreateUserDto {
  @ApiProperty({
    example: "admin@madamove.com",
    description: "Adresse email de l'utilisateur",
    type: 'string'
  })
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string

  @ApiProperty({
    example: "admin123",
    description: "Mot de passe de l'utilisateur",
  })
  @IsString({ message: "Le mot de passe doit être une chaîne de caractères" })
  @MinLength(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
  @IsNotEmpty({ message: "Le mot de passe est requis" })
  password: string

  @ApiProperty({
    example: "Dupont",
    description: "Nom de l'utilisateur",
  })
  @IsString({ message: "Le nom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le nom est requis" })
  nom: string

  @ApiProperty({
    example: "Jean",
    description: "Prénom de l'utilisateur",
  })
  @IsString({ message: "Le prénom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le prénom est requis" })
  prenom: string

  @ApiProperty({
    enum: Role,
    example: "UTILISATEUR",
    description: "Rôle de l'utilisateur",
  })
  @IsEnum(Role, { message: "Le rôle doit être l'un des suivants: ADMIN, GESTIONNAIRE, UTILISATEUR" })
  role: Role
}

