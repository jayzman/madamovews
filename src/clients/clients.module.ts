import { Module } from "@nestjs/common"
import { ClientsService } from "./clients.service"
import { ClientsController } from "./clients.controller"
import { MailService } from "../email.service"
import { SmsService } from "../sms.service"
import { JwtService } from "@nestjs/jwt"
import { ClientJwtStrategy } from "./strategies/client-jwt.strategy"
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [ConfigModule],
  controllers: [ClientsController],
  providers: [ClientsService, MailService, SmsService, JwtService, ClientJwtStrategy],
  exports: [ClientsService],
})
export class ClientsModule {}

