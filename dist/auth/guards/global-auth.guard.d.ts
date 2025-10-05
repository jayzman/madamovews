import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare class GlobalAuthGuard implements CanActivate {
    private reflector;
    private readonly logger;
    private adminGuard;
    private clientGuard;
    private chauffeurGuard;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private tryActivate;
}
