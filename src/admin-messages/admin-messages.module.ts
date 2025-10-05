import { Module } from '@nestjs/common';
import { AdminMessagesService } from './admin-messages.service';
import { AdminMessagesController } from './admin-messages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [AdminMessagesController],
  providers: [AdminMessagesService],
  exports: [AdminMessagesService],
})
export class AdminMessagesModule {}