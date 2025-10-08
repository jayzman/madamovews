import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MvolaController } from './mvola.controller';
import { MvolaPaymentService } from './mvola-payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { MvolaAuthModule } from './mvola-auth.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => MvolaAuthModule), // 🔁 symétrique pour casser la boucle
  ],
  controllers: [MvolaController],
  providers: [MvolaPaymentService, PrismaService],
  exports: [MvolaPaymentService],
})
export class MvolaModule {}
