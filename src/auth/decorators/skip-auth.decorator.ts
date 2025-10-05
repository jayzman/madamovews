import { SetMetadata } from '@nestjs/common';

/**
 * Décorateur permettant d'ignorer l'authentification pour une route spécifique.
 * Utilisez ce décorateur sur les méthodes de contrôleur qui ne nécessitent pas d'authentification,
 * comme les routes de login, d'inscription, etc.
 * 
 * @example
 * ```typescript
 * @SkipAuth()
 * @Post('/login')
 * login(@Body() loginDto: LoginDto) {
 *   // cette méthode ne nécessite pas d'authentification
 * }
 * ```
 */
export const SKIP_AUTH_KEY = 'skipAuth';
export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);