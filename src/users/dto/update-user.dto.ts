import { PartialType } from "@nestjs/mapped-types"
import { CreateUserDto } from "./create-user.dto"
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator"
import { Role } from "@prisma/client"

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string

  @IsString()
  @IsOptional()
  nom?: string

  @IsString()
  @IsOptional()
  prenom?: string

  @IsEnum(Role)
  @IsOptional()
  role?: Role
}

