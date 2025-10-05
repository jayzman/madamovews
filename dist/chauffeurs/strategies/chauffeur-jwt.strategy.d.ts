import { Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
declare const ChauffeurJwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class ChauffeurJwtStrategy extends ChauffeurJwtStrategy_base {
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
    }>;
}
export {};
