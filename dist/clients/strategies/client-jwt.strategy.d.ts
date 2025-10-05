import { Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
declare const ClientJwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class ClientJwtStrategy extends ClientJwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: any): Promise<{
        userType: string;
        email: string;
        nom: string;
        prenom: string;
        id: number;
        telephone: string;
        adresse: string;
        ville: string;
        profileUrl: string;
        verified: boolean;
    }>;
}
export {};
