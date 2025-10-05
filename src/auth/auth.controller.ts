import { Controller, Post, Body, UseGuards, Get, Request, Res } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { LoginDto } from "./dto/login.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { Response } from "express"
import { SkipAuth } from "./decorators/skip-auth.decorator"

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @SkipAuth()
  @ApiOperation({ summary: 'Enregistrer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Un utilisateur avec cet email existe déjà' })
  @ApiBody({ type: CreateUserDto })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @SkipAuth()
  @ApiOperation({ summary: 'Connecter un utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { token, user } = await this.authService.login(loginDto);
   /* res.cookie("auth_token", token, {
      httpOnly: true, // 🔒 Protège contre les attaques XSS
      secure: false, // 🔐 Active Secure en production
      sameSite: "lax", // ⚠️ Important si frontend et backend sont sur des domaines différents
    });*/
  
    return res.status(200).json({ message: "Connexion réussie", user, token });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // req.user est ajouté par le JwtAuthGuard après validation du token
    const user = req.user;
    if (!user) {
      throw new Error('Utilisateur non trouvé ou token invalide');
    }
    return user;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Déconnexion' })
  @ApiResponse({ status: 200, description: 'Déconnecté avec succès' })
  logout(@Res() res: Response) {
    // Efface le cookie de l'utilisateur
    /*res.clearCookie('auth_token', {
      httpOnly: true,   // Empêche l'accès au cookie par JavaScript
      secure: false,  // En mode production, le cookie sera sécurisé
      sameSite: 'lax',  // Empêche l'envoi du cookie sur des requêtes cross-site, sauf dans certains cas (lax)
      path: '/',  // Assure que le cookie est supprimé pour le domaine entier
    });*/

    // Retourne une réponse indiquant la déconnexion réussie
    return res.status(200).send({ message: 'Déconnecté avec succès' });
  }

}

