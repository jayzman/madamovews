import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PrismaModule } from "./prisma/prisma.module"
import { AuthModule } from "./auth/auth.module"
import { ChauffeursModule } from "./chauffeurs/chauffeurs.module"
import { VehiculesModule } from "./vehicules/vehicules.module"
import { ClientsModule } from "./clients/clients.module"
import { CoursesModule } from "./courses/courses.module"
import { IncidentsModule } from "./incidents/incidents.module"
import { StatistiquesModule } from "./statistiques/statistiques.module"
import { FinancesModule } from "./finances/finances.module"
import { UsersModule } from "./users/users.module"
import { UploadsModule } from "./uploads/uploads.module"
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { MailerModule } from "@nestjs-modules/mailer"
import { MailService } from "./email.service";
import { SmsService } from "./sms.service";
import { SmsModule } from "./sms/sms.module";
import { LocationsModule } from "./locations/locations.module";
import { StripeModule } from "./stripe/stripe.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { MessagesModule } from "./messages/messages.module";
import { APP_GUARD } from '@nestjs/core';
import { GlobalAuthGuard } from "./auth/guards/global-auth.guard";
import { TransportsModule } from "./transports/transports.module";
import { AdminMessagesModule } from "./admin-messages/admin-messages.module";
import { PromoCodesModule } from './promo-codes/promo-codes.module';

@Module({
imports: [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'uploads'),
    serveRoot: '/uploads',
  }),
  MailerModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: async (config: ConfigService) => ({
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
        dir: join(__dirname, './templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    inject: [ConfigService],
  }),  PrismaModule,
  AuthModule,
  ChauffeursModule,
  VehiculesModule,
  ClientsModule,
  CoursesModule,
  IncidentsModule,
  StatistiquesModule,
  FinancesModule,
  UsersModule,
  UploadsModule,
  LocationsModule,
  StripeModule,
  NotificationsModule,
  MessagesModule,
  TransportsModule,
  AdminMessagesModule,
  SmsModule,
  PromoCodesModule
], 
providers: [
  MailService,
  SmsService,
  {
    provide: APP_GUARD,
    useClass: GlobalAuthGuard,
  },
],
})
export class AppModule {}

