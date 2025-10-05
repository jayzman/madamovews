import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";
import { Role } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ description: "Adresse email de l'utilisateur", example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Mot de passe de l'utilisateur", example: "password123", minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: "Nom de l'utilisateur", example: "Dupont" })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ description: "Prénom de l'utilisateur", example: "Jean" })
  @IsString()
  @IsNotEmpty()
  prenom: string;

  @ApiProperty({ description: "Rôle de l'utilisateur", enum: Role })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}

export class InviteUserDto {
  @ApiProperty({ description: "Adresse email de l'utilisateur", example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Nom de l'utilisateur", example: "Dupont" })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ description: "Prénom de l'utilisateur", example: "Jean" })
  @IsString()
  @IsNotEmpty()
  prenom: string;

  @ApiProperty({ description: "Rôle de l'utilisateur", enum: Role })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
