import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, TypeNotification } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée une nouvelle notification
   */
  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        titre: createNotificationDto.titre,
        message: createNotificationDto.message,
        type: createNotificationDto.type,
        userId: createNotificationDto.userId,
        chauffeurId: createNotificationDto.chauffeurId,
        clientId: createNotificationDto.clientId,
        donnees: createNotificationDto.donnees,
      },
    });
  }

  /**
   * Récupère toutes les notifications
   */
  async findAll(skip = 0, take = 10) {
    const [items, count] = await Promise.all([
      this.prisma.notification.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count(),
    ]);

    return {
      items,
      meta: {
        total: count,
        skip,
        take,
      },
    };
  }

  /**
   * Récupère les notifications d'un utilisateur
   */
  async findAllForUser(userId: number, skip = 0, take = 10) {
    const [items, count] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      items,
      meta: {
        total: count,
        skip,
        take,
      },
    };
  }

  /**
   * Récupère les notifications d'un chauffeur
   */
  async findAllForChauffeur(chauffeurId: number, skip = 0, take = 10) {
    const [items, count] = await Promise.all([
      this.prisma.notification.findMany({
        where: { chauffeurId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { chauffeurId } }),
    ]);

    return {
      items,
      meta: {
        total: count,
        skip,
        take,
      },
    };
  }

  /**
   * Récupère les notifications d'un client
   */
  async findAllForClient(clientId: number, skip = 0, take = 10) {
    const [items, count] = await Promise.all([
      this.prisma.notification.findMany({
        where: { clientId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { clientId } }),
    ]);

    return {
      items,
      meta: {
        total: count,
        skip,
        take,
      },
    };
  }

  /**
   * Récupère une notification par son ID
   */
  async findOne(id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification #${id} introuvable`);
    }

    return notification;
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(id: number) {
    const notification = await this.findOne(id);
    
    return this.prisma.notification.update({
      where: { id },
      data: { lu: true },
    });
  }

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   */
  async markAllAsReadForUser(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, lu: false },
      data: { lu: true },
    });
  }

  /**
   * Marque toutes les notifications d'un chauffeur comme lues
   */
  async markAllAsReadForChauffeur(chauffeurId: number) {
    return this.prisma.notification.updateMany({
      where: { chauffeurId, lu: false },
      data: { lu: true },
    });
  }

  /**
   * Marque toutes les notifications d'un client comme lues
   */
  async markAllAsReadForClient(clientId: number) {
    return this.prisma.notification.updateMany({
      where: { clientId, lu: false },
      data: { lu: true },
    });
  }

  /**
   * Supprime une notification
   */
  async remove(id: number) {
    const notification = await this.findOne(id);
    
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  /**
   * Crée une notification pour un paiement réussi
   */
  async createPaymentSuccessNotification(clientId: number, montant: number, reference: string) {
    return this.create({
      titre: 'Paiement confirmé',
      message: `Votre paiement de ${montant}€ a été traité avec succès.`,
      type: TypeNotification.PAIEMENT,
      clientId,
      donnees: JSON.stringify({
        montant,
        reference,
        date: new Date().toISOString(),
      }),
    });
  }

  /**
   * Crée une notification pour une carte ajoutée
   */
  async createCardAddedNotification(clientId: number, lastDigits: string) {
    return this.create({
      titre: 'Nouvelle carte enregistrée',
      message: `Une nouvelle carte bancaire se terminant par **** ${lastDigits} a été ajoutée à votre compte.`,
      type: TypeNotification.CARTE,
      clientId,
    });
  }

  /**
   * Crée une notification pour un changement de statut de réservation
   */
  async createReservationStatusNotification(
    clientId: number,
    chauffeurId: number | null,
    locationId: number,
    newStatus: string,
    details: string
  ) {
    const titre = `Réservation ${this.getStatusLabel(newStatus)}`;
    const message = `Votre réservation #${locationId} est maintenant ${this.getStatusLabel(newStatus).toLowerCase()}. ${details}`;

    // Notification pour le client
    if (clientId) {
      await this.create({
        titre,
        message,
        type: TypeNotification.RESERVATION,
        clientId,
        donnees: JSON.stringify({
          locationId,
          status: newStatus,
        }),
      });
    }

    // Notification pour le chauffeur si assigné
    if (chauffeurId) {
      await this.create({
        titre,
        message: `La réservation #${locationId} est maintenant ${this.getStatusLabel(newStatus).toLowerCase()}. ${details}`,
        type: TypeNotification.RESERVATION,
        chauffeurId,
        donnees: JSON.stringify({
          locationId,
          status: newStatus,
        }),
      });
    }
  }

  /**
   * Crée une notification pour une offre spéciale
   */
  async createSpecialOfferNotification(
    clientIds: number[] | null,
    chauffeurIds: number[] | null,
    titre: string,
    message: string,
    offreDetails: any
  ) {
    const notifications = [];

    // Pour les clients spécifiques
    if (clientIds && clientIds.length > 0) {
      for (const clientId of clientIds) {
        const notification = await this.create({
          titre,
          message,
          type: TypeNotification.OFFRE,
          clientId,
          donnees: JSON.stringify(offreDetails),
        });
        notifications.push(notification);
      }
    }

    // Pour les chauffeurs spécifiques
    if (chauffeurIds && chauffeurIds.length > 0) {
      for (const chauffeurId of chauffeurIds) {
        const notification = await this.create({
          titre,
          message,
          type: TypeNotification.OFFRE,
          chauffeurId,
          donnees: JSON.stringify(offreDetails),
        });
        notifications.push(notification);
      }
    }

    return notifications;
  }

  /**
   * Crée une notification de système générique
   */
  async createSystemNotification(
    userId: number | null,
    clientId: number | null,
    chauffeurId: number | null,
    titre: string,
    message: string,
    donnees?: any
  ) {
    return this.create({
      titre,
      message,
      type: TypeNotification.SYSTEME,
      userId,
      clientId,
      chauffeurId,
      donnees: donnees ? JSON.stringify(donnees) : null,
    });
  }

  /**
   * Obtient un libellé pour un statut
   */
  private getStatusLabel(status: string): string {
    const statusMap = {
      'RESERVATION': 'En attente',
      'CONFIRMEE': 'Confirmée',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'ANNULEE': 'Annulée',
    };

    return statusMap[status] || status;
  }
}