import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, NotificationsModule, PrismaModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}