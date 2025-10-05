import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { SKIP_AUTH_KEY } from '../decorators/skip-auth.decorator';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  private readonly logger = new Logger(GlobalAuthGuard.name);
  private adminGuard: CanActivate;
  private clientGuard: CanActivate;
  private chauffeurGuard: CanActivate;

  constructor(private reflector: Reflector) {
    this.adminGuard = new (AuthGuard('jwt'))();
    this.clientGuard = new (AuthGuard('client-jwt'))();
    this.chauffeurGuard = new (AuthGuard('chauffeur-jwt'))();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Vérifier si la route est marquée pour ignorer l'authentification
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si le décorateur @SkipAuth() est présent, permettre l'accès sans vérification
    if (skipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      this.logger.debug('Aucun token d\'authentification fourni');
      throw new UnauthorizedException('Token d\'authentification manquant');
    }

    const authErrors = [];

    // Essayer d'authentifier avec les différentes stratégies
    try {
      // Essayer d'abord l'authentification admin (utilisateur standard)
      const canActivateAdmin = await this.tryActivate(this.adminGuard, context);
      if (canActivateAdmin) {
        request.user = { ...request.user, userType: 'admin' };
        return true;
      }
    } catch (error) {
      authErrors.push({ strategy: 'admin', message: error.message });
    }

    try {
      // Ensuite, essayer l'authentification client
      const canActivateClient = await this.tryActivate(this.clientGuard, context);
      if (canActivateClient) {
        request.user = { ...request.user, userType: 'client' };
        return true;
      }
    } catch (error) {
      authErrors.push({ strategy: 'client', message: error.message });
    }

    try {
      // Enfin, essayer l'authentification chauffeur
      const canActivateChauffeur = await this.tryActivate(this.chauffeurGuard, context);
      if (canActivateChauffeur) {
        request.user = { ...request.user, userType: 'chauffeur' };
        return true;
      }
    } catch (error) {
      authErrors.push({ strategy: 'chauffeur', message: error.message });
    }

    // Si aucune stratégie n'a fonctionné, journaliser les erreurs et lever une exception
    this.logger.debug(`Authentification échouée pour toutes les stratégies: ${JSON.stringify(authErrors)}`);
    throw new UnauthorizedException('Authentification échouée pour toutes les stratégies disponibles');
  }
  // Méthode utilitaire pour essayer d'activer un garde et gérer les promesses correctement
  private async tryActivate(guard: CanActivate, context: ExecutionContext): Promise<boolean> {
    try {
      const result = guard.canActivate(context);
      if (result instanceof Promise) {
        return await result;
      } else if (result instanceof Observable) {
        return await firstValueFrom(result);
      }
      return result as boolean;
    } catch (error) {
      throw error;
    }
  }
  }

