import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SKIP_AUTH_KEY } from "../decorators/skip-auth.decorator";
import { Reflector } from "@nestjs/core";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Vérifier si la route est marquée pour ignorer l'authentification
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si le décorateur @SkipAuth() est présent, permettre l'accès sans vérification
    if (skipAuth) {
      return true;
    }

    // Sinon, utiliser la vérification JWT standard
    return super.canActivate(context);
  }
}

