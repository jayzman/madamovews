"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportsModule = void 0;
const common_1 = require("@nestjs/common");
const transports_service_1 = require("./transports.service");
const transports_controller_1 = require("./transports.controller");
const transport_gateway_1 = require("./transport.gateway");
const position_tracking_service_1 = require("./position-tracking.service");
const prisma_module_1 = require("../prisma/prisma.module");
const stripe_module_1 = require("../stripe/stripe.module");
const notifications_module_1 = require("../notifications/notifications.module");
const promo_codes_module_1 = require("../promo-codes/promo-codes.module");
const jwt_1 = require("@nestjs/jwt");
let TransportsModule = class TransportsModule {
};
exports.TransportsModule = TransportsModule;
exports.TransportsModule = TransportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            stripe_module_1.StripeModule,
            notifications_module_1.NotificationsModule,
            promo_codes_module_1.PromoCodesModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your-secret-key',
                signOptions: { expiresIn: '24h' },
            }),
        ],
        controllers: [transports_controller_1.TransportsController],
        providers: [
            transports_service_1.TransportsService,
            transport_gateway_1.TransportGateway,
            position_tracking_service_1.PositionTrackingService
        ],
        exports: [
            transports_service_1.TransportsService,
            transport_gateway_1.TransportGateway,
            position_tracking_service_1.PositionTrackingService
        ],
    })
], TransportsModule);
//# sourceMappingURL=transports.module.js.map