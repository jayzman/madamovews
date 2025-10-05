import { Provider } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { GlobalAuthGuard } from './global-auth.guard';

export const GlobalAuthGuardProvider: Provider = {
  provide: GlobalAuthGuard,
  useFactory: (reflector: Reflector) => {
    const adminGuard = new (AuthGuard('jwt'));
    const clientGuard = new (AuthGuard('client-jwt'));
    const chauffeurGuard = new (AuthGuard('chauffeur-jwt'));
    
    return new GlobalAuthGuard(reflector,
        //  adminGuard, clientGuard, chauffeurGuard
        );
  },
  inject: [Reflector],
};
