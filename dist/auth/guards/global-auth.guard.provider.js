"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalAuthGuardProvider = void 0;
const core_1 = require("@nestjs/core");
const passport_1 = require("@nestjs/passport");
const global_auth_guard_1 = require("./global-auth.guard");
exports.GlobalAuthGuardProvider = {
    provide: global_auth_guard_1.GlobalAuthGuard,
    useFactory: (reflector) => {
        const adminGuard = new ((0, passport_1.AuthGuard)('jwt'));
        const clientGuard = new ((0, passport_1.AuthGuard)('client-jwt'));
        const chauffeurGuard = new ((0, passport_1.AuthGuard)('chauffeur-jwt'));
        return new global_auth_guard_1.GlobalAuthGuard(reflector);
    },
    inject: [core_1.Reflector],
};
//# sourceMappingURL=global-auth.guard.provider.js.map