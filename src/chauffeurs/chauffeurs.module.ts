import { Module } from "@nestjs/common"
import { ChauffeursService } from "./chauffeurs.service"
import { ChauffeursController } from "./chauffeurs.controller"
import { PrismaModule } from "../prisma/prisma.module"
import { UploadsModule } from "../uploads/uploads.module"
import { MailService } from "../email.service"
import { SmsService } from "../sms.service"
import { JwtService } from "@nestjs/jwt"
import { ChauffeurJwtStrategy } from "./strategies/chauffeur-jwt.strategy"
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [PrismaModule, UploadsModule, ConfigModule],
  controllers: [ChauffeursController],
  providers: [ChauffeursService, MailService, SmsService, JwtService, ChauffeurJwtStrategy], 
  exports: [ChauffeursService],
})
export class ChauffeursModule {}

