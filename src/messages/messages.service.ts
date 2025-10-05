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
    const { clientId, chauffeurId, reservationId, courseId, transportId } = createMessageDto;

    // Vérifier que l'on fournit soit une réservation, soit une course, soit un transport
    if (!reservationId && !courseId && !transportId) {
      throw new Error('Vous devez fournir l\'ID d\'une réservation, d\'une course ou d\'un transport');
    }

    // Si l'ID du transport est fourni, vérifier qu'il existe
    if (transportId) {
      const transport = await this.prisma.transport.findUnique({
        where: { id: transportId },
        include: { client: true, chauffeur: true },
      });

      if (!transport) {
        throw new NotFoundException(`Transport avec l'ID ${transportId} non trouvé`);
      }

      // Si l'expediteurType est CLIENT, le clientId doit correspondre au transport
      if (createMessageDto.expediteurType === TypeExpediteur.CLIENT && 
          transport.clientId !== clientId) {
        throw new Error('Ce client n\'est pas associé à ce transport');
      }

      // Si l'expediteurType est CHAUFFEUR, le chauffeurId doit correspondre au transport
      if (createMessageDto.expediteurType === TypeExpediteur.CHAUFFEUR && 
          transport.chauffeurId !== chauffeurId) {
        throw new Error('Ce chauffeur n\'est pas associé à ce transport');
      }
    }

    // Créer le message
    const message = await this.prisma.message.create({
      data: createMessageDto,
      include: {
        client: true,
        chauffeur: true,
        reservation: true,
        course: true,
        transport: true,
      },
    });

    // Créer une notification pour le destinataire
    let titreNotif, messageNotif;

    if (createMessageDto.expediteurType === TypeExpediteur.CLIENT) {
      const clientNom = message.client ? `${message.client.prenom} ${message.client.nom}` : 'Un client';
      titreNotif = `Nouveau message de ${clientNom}`;
      messageNotif = `${clientNom} vous a envoyé un message concernant ${reservationId ? 'votre réservation' : (transportId ? 'votre transport' : 'votre course')}`;
      
      if (chauffeurId) {
        await this.notificationsService.create({
          titre: titreNotif,
          message: messageNotif,
          type: TypeNotification.AUTRE,
          chauffeurId: chauffeurId,
          donnees: JSON.stringify({
            messageId: message.id,
            reservationId,
            courseId,
            transportId,
          }),
        });
      }
    } else {
      const chauffeurNom = message.chauffeur ? `${message.chauffeur.prenom} ${message.chauffeur.nom}` : 'Votre chauffeur';
      titreNotif = `Nouveau message de ${chauffeurNom}`;
      messageNotif = `${chauffeurNom} vous a envoyé un message concernant ${reservationId ? 'votre réservation' : (transportId ? 'votre transport' : 'votre course')}`;
      
      if (clientId) {
        await this.notificationsService.create({
          titre: titreNotif,
          message: messageNotif,
          type: TypeNotification.AUTRE,
          clientId: clientId,
          donnees: JSON.stringify({
            messageId: message.id,
            reservationId,
            courseId,
            transportId,
          }),
        });
      }
    }

    return message;
  }

  async findAllForConversation(params: {
    clientId?: number;
    chauffeurId?: number;
    reservationId?: number;
    courseId?: number;
    transportId?: number;
    skip?: number;
    take?: number;
  }) {
    const { clientId, chauffeurId, reservationId, courseId, transportId, skip, take } = params;
    
    const where: Prisma.MessageWhereInput = {};

    // Récupérer les messages liés à une conversation
    if (reservationId) {
      where.reservationId = reservationId;
    } else if (courseId) {
      where.courseId = courseId;
    } else if (transportId) {
      where.transportId = transportId;
    } else {
      throw new Error('Vous devez fournir soit un ID de réservation, soit un ID de course, soit un ID de transport');
    }

    const [items, count] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip: skip || 0,
        take: take || 50,
        orderBy: { createdAt: 'asc' },
        include: {
          client: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              profileUrl: true,
            },
          },
          chauffeur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              photoUrl: true,
            },
          },
        },
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      items,
      meta: {
        total: count,
        skip: skip || 0,
        take: take || 50,
      },
    };
  }

  async getConversationsForClient(clientId: number) {
    // Récupérer les conversations issues des transports
    const transports = await this.prisma.transport.findMany({
      where: { clientId },
      select: {
        id: true,
        chauffeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoUrl: true,
          }
        },
        adresseDepart: true,
        adresseDestination: true,
        dateReservation: true,
        status: true,
        _count: {
          select: {
            messages: true,
          }
        }
      },
    });

    const transportConversations = transports.map(t => ({
      type: 'TRANSPORT',
      id: t.id,
      trajet: `${t.adresseDepart} → ${t.adresseDestination}`,
      chauffeur: t.chauffeur ? {
        id: t.chauffeur.id,
        nom: `${t.chauffeur.prenom} ${t.chauffeur.nom}`,
        photoUrl: t.chauffeur.photoUrl,
      } : null,
      date: t.dateReservation,
      status: t.status,
      messageCount: t._count.messages,
    }));

    return {
      transports: transportConversations,
    };
  }

  async getConversationsForChauffeur(chauffeurId: number) {
    // Récupérer les conversations issues des transports
    const transports = await this.prisma.transport.findMany({
      where: { chauffeurId },
      select: {
        id: true,
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            profileUrl: true,
          }
        },
        adresseDepart: true,
        adresseDestination: true,
        dateReservation: true,
        status: true,
        _count: {
          select: {
            messages: true,
          }
        }
      },
    });

    const transportConversations = transports.map(t => ({
      type: 'TRANSPORT',
      id: t.id,
      trajet: `${t.adresseDepart} → ${t.adresseDestination}`,
      client: t.client ? {
        id: t.client.id,
        nom: `${t.client.prenom} ${t.client.nom}`,
        profileUrl: t.client.profileUrl,
      } : null,
      date: t.dateReservation,
      status: t.status,
      messageCount: t._count.messages,
    }));

    return {
      transports: transportConversations,
    };
  }

  async findUnreadCount(clientId?: number, chauffeurId?: number) {
    const where: Prisma.MessageWhereInput = {
      lu: false,
    };

    if (clientId) {
      where.expediteurType = TypeExpediteur.CHAUFFEUR;
      where.OR = [
        { clientId },
        { AND: [{ transportId: { not: null } }, { transport: { clientId } }] },
      ];
    } else if (chauffeurId) {
      where.expediteurType = TypeExpediteur.CLIENT;
      where.OR = [
        { chauffeurId },
        { AND: [{ transportId: { not: null } }, { transport: { chauffeurId } }] },
      ];
    } else {
      throw new Error('Vous devez fournir soit un ID de client soit un ID de chauffeur');
    }

    const count = await this.prisma.message.count({ where });
    return { count };
  }

  async findAll() {
    return await this.prisma.message.findMany({
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            profileUrl: true,
          },
        },
        chauffeur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoUrl: true,
          },
        },
        transport: {
          select: {
            id: true,
            adresseDepart: true,
            adresseDestination: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        client: true,
        chauffeur: true,
        transport: true,
      },
    });

    if (!message) {
      throw new NotFoundException(`Message avec l'ID ${id} non trouvé`);
    }

    return message;
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    const message = await this.findOne(id);
    
    return await this.prisma.message.update({
      where: { id },
      data: updateMessageDto,
      include: {
        client: true,
        chauffeur: true,
        transport: true,
      },
    });
  }

  async remove(id: number) {
    const message = await this.findOne(id);
    
    return await this.prisma.message.delete({
      where: { id },
    });
  }
}
