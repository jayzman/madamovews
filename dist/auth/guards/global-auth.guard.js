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
var GlobalAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const passport_1 = require("@nestjs/passport");
const skip_auth_decorator_1 = require("../decorators/skip-auth.decorator");
const rxjs_1 = require("rxjs");
let GlobalAuthGuard = GlobalAuthGuard_1 = class GlobalAuthGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.logger = new common_1.Logger(GlobalAuthGuard_1.name);
        this.adminGuard = new ((0, passport_1.AuthGuard)('jwt'))();
        this.clientGuard = new ((0, passport_1.AuthGuard)('client-jwt'))();
        this.chauffeurGuard = new ((0, passport_1.AuthGuard)('chauffeur-jwt'))();
    }
    async canActivate(context) {
        const skipAuth = this.reflector.getAllAndOverride(skip_auth_decorator_1.SKIP_AUTH_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipAuth) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        if (!request.headers.authorization) {
            this.logger.debug('Aucun token d\'authentification fourni');
            throw new common_1.UnauthorizedException('Token d\'authentification manquant');
        }
        const authErrors = [];
        try {
            const canActivateAdmin = await this.tryActivate(this.adminGuard, context);
            if (canActivateAdmin) {
                request.user = { ...request.user, userType: 'admin' };
                return true;
            }
        }
        catch (error) {
            authErrors.push({ strategy: 'admin', message: error.message });
        }
        try {
            const canActivateClient = await this.tryActivate(this.clientGuard, context);
            if (canActivateClient) {
                request.user = { ...request.user, userType: 'client' };
                return true;
            }
        }
        catch (error) {
            authErrors.push({ strategy: 'client', message: error.message });
        }
        try {
            const canActivateChauffeur = await this.tryActivate(this.chauffeurGuard, context);
            if (canActivateChauffeur) {
                request.user = { ...request.user, userType: 'chauffeur' };
                return true;
            }
        }
        catch (error) {
            authErrors.push({ strategy: 'chauffeur', message: error.message });
        }
        this.logger.debug(`Authentification échouée pour toutes les stratégies: ${JSON.stringify(authErrors)}`);
        throw new common_1.UnauthorizedException('Authentification échouée pour toutes les stratégies disponibles');
    }
    async tryActivate(guard, context) {
        try {
            const result = guard.canActivate(context);
            if (result instanceof Promise) {
                return await result;
            }
            else if (result instanceof rxjs_1.Observable) {
                return await (0, rxjs_1.firstValueFrom)(result);
            }
            return result;
        }
        catch (error) {
            throw error;
        }
    }
};
exports.GlobalAuthGuard = GlobalAuthGuard;
exports.GlobalAuthGuard = GlobalAuthGuard = GlobalAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], GlobalAuthGuard);
//# sourceMappingURL=global-auth.guard.js.map