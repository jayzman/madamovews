import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ClientJwtStrategy extends PassportStrategy(Strategy, 'client-jwt') {
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
      secretOrKey: process.env.JWT_SECRET_CLIENT || "madamove_client",
    });
  }

  async validate(payload: any) {
    // Récupérer les informations du client depuis la base de données
    const client = await this.prisma.client.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        adresse: true,
        ville: true,
        profileUrl: true,
        verified: true,
      }
    });

    return {
      ...client,
      userType: 'client'
    };
  }
}