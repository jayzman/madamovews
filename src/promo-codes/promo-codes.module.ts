import { Module } from '@nestjs/common';
import { PromoCodesService } from "./promo-codes.service";
import { PromoCodesController } from "./promo-codes.controller";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [PromoCodesController],
  providers: [PromoCodesService, PrismaService],
  exports: [PromoCodesService],
})
export class PromoCodesModule {}
