import { Module } from "@nestjs/common"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { MailService } from "../email.service"

@Module({
  controllers: [UsersController],
  providers: [UsersService, MailService],
  exports: [UsersService],
})
export class UsersModule {}

