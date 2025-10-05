import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { CreateUserDto } from "./dto/create-user.dto"
import { LoginDto } from "./dto/login.dto"

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, nom, prenom, role } = createUserDto

    // Vérifier si l'utilisateur existe déjà
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    })

    if (userExists) {
      throw new UnauthorizedException("Un utilisateur avec cet email existe déjà")
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        role,
      },
    })

    // Générer le token JWT
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      },
      token,
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    // Trouver l'utilisateur par email
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new NotFoundException("Identifiants invalides")
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Identifiants invalides")
    }

    // Générer le token JWT
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      },
      token,
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user
      return result
    }

    return null
  }
}

