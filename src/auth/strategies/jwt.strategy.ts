import { ExtractJwt, Strategy } from "passport-jwt"
import { PassportStrategy } from "@nestjs/passport"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Request } from "express"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Essaye d'abord d'extraire depuis le header Authorization
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Ensuite, essaye d'extraire depuis le cookie
        (request: Request) => {
          const token = request?.cookies?.auth_token;
          if (!token) {
            return null;
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    })
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email, 
      role: payload.role,
      userType: 'admin'
    }
  }
}

