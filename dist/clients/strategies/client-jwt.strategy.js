"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientJwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClientJwtStrategy = class ClientJwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'client-jwt') {
    constructor(configService, prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
                passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
                (request) => {
                    const token = request?.cookies?.auth_token;
                    if (!token) {
                        return null;
                    }
                    return token;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET_CLIENT || "mema_group_client",
        });
        this.configService = configService;
        this.prisma = prisma;
    }
    async validate(payload) {
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
};
exports.ClientJwtStrategy = ClientJwtStrategy;
exports.ClientJwtStrategy = ClientJwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], ClientJwtStrategy);
//# sourceMappingURL=client-jwt.strategy.js.map