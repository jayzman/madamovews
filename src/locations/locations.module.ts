import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, StripeModule, ConfigModule, NotificationsModule],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}