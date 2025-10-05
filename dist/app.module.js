"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const handlebars_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/handlebars.adapter");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const chauffeurs_module_1 = require("./chauffeurs/chauffeurs.module");
const vehicules_module_1 = require("./vehicules/vehicules.module");
const clients_module_1 = require("./clients/clients.module");
const courses_module_1 = require("./courses/courses.module");
const incidents_module_1 = require("./incidents/incidents.module");
const statistiques_module_1 = require("./statistiques/statistiques.module");
const finances_module_1 = require("./finances/finances.module");
const users_module_1 = require("./users/users.module");
const uploads_module_1 = require("./uploads/uploads.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const mailer_1 = require("@nestjs-modules/mailer");
const email_service_1 = require("./email.service");
const sms_service_1 = require("./sms.service");
const sms_module_1 = require("./sms/sms.module");
const locations_module_1 = require("./locations/locations.module");
const stripe_module_1 = require("./stripe/stripe.module");
const notifications_module_1 = require("./notifications/notifications.module");
const messages_module_1 = require("./messages/messages.module");
const core_1 = require("@nestjs/core");
const global_auth_guard_1 = require("./auth/guards/global-auth.guard");
const transports_module_1 = require("./transports/transports.module");
const admin_messages_module_1 = require("./admin-messages/admin-messages.module");
const promo_codes_module_1 = require("./promo-codes/promo-codes.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (config) => ({
                    transport: {
                        host: config.get('EMAIL_HOST'),
                        secure: true,
                        auth: {
                            user: config.get('EMAIL_USER'),
                            pass: config.get('EMAIL_PASSWORD'),
                        },
                    },
                    defaults: {
                        from: 'kinmaksmtp@gmail.com',
                    },
                    template: {
                        dir: (0, path_1.join)(__dirname, './templates'),
                        adapter: new handlebars_adapter_1.HandlebarsAdapter(),
                        options: {
                            strict: true,
                        },
                    },
                }),
                inject: [config_1.ConfigService],
            }), prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            chauffeurs_module_1.ChauffeursModule,
            vehicules_module_1.VehiculesModule,
            clients_module_1.ClientsModule,
            courses_module_1.CoursesModule,
            incidents_module_1.IncidentsModule,
            statistiques_module_1.StatistiquesModule,
            finances_module_1.FinancesModule,
            users_module_1.UsersModule,
            uploads_module_1.UploadsModule,
            locations_module_1.LocationsModule,
            stripe_module_1.StripeModule,
            notifications_module_1.NotificationsModule,
            messages_module_1.MessagesModule,
            transports_module_1.TransportsModule,
            admin_messages_module_1.AdminMessagesModule,
            sms_module_1.SmsModule,
            promo_codes_module_1.PromoCodesModule
        ],
        providers: [
            email_service_1.MailService,
            sms_service_1.SmsService,
            {
                provide: core_1.APP_GUARD,
                useClass: global_auth_guard_1.GlobalAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map