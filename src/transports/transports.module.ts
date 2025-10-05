import { Module, forwardRef } from '@nestjs/common';
import { TransportsService } from './transports.service';
import { TransportsController } from './transports.controller';
import { TransportGateway } from './transport.gateway';
import { PositionTrackingService } from './position-tracking.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule, 
    StripeModule, 
    NotificationsModule,
    PromoCodesModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [TransportsController],
  providers: [
    TransportsService, 
    TransportGateway, 
    PositionTrackingService
  ],
  exports: [
    TransportsService, 
    TransportGateway, 
    PositionTrackingService
  ],
})
export class TransportsModule {}