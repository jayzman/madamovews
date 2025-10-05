import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Prisma, TypeExpediteur } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { TypeNotification } from '../notifications/dto/create-notification.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    return { message: 'Service temporarily disabled for maintenance' };
  }

  async findAll() {
    return [];
  }

  async findOne(id: number) {
    throw new NotFoundException(`Message with ID ${id} not found`);
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    throw new NotFoundException(`Message with ID ${id} not found`);
  }

  async remove(id: number) {
    throw new NotFoundException(`Message with ID ${id} not found`);
  }
}
