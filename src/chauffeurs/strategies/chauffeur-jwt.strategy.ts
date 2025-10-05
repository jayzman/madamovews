import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ChauffeurJwtStrategy extends PassportStrategy(Strategy, 'chauffeur-jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          const token = request?.cookies?.auth_token;
          if (!token) {
            return null;
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_CHAUFFEUR || "madamove_chauffeur",
    });
  }

  async validate(payload: any) {
    // Récupérer les informations du chauffeur depuis la base de données
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        // adresse: true,
        // ville: true,
        // profileUrl: true,
        // verified: true,
        // status: true,
      }
    });

    return {
      ...chauffeur,
      userType: 'chauffeur'
    };
  }
}