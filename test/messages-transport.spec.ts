import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from '../src/messages/messages.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { TypeExpediteur } from '@prisma/client';

describe('MessagesService - Transport Integration', () => {
  let service: MessagesService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: PrismaService,
          useValue: {
            message: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            transport: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create message with transport', () => {
    it('should create a message linked to a transport', async () => {
      const mockTransport = {
        id: 1,
        clientId: 1,
        chauffeurId: 2,
        client: { id: 1, nom: 'Dupont', prenom: 'Jean' },
        chauffeur: { id: 2, nom: 'Martin', prenom: 'Pierre' },
      };

      const mockMessage = {
        id: 1,
        contenu: 'Test message',
        transportId: 1,
        clientId: 1,
        chauffeurId: 2,
        expediteurType: TypeExpediteur.CLIENT,
        transport: mockTransport,
        client: mockTransport.client,
        chauffeur: mockTransport.chauffeur,
      };

      jest.spyOn(prismaService.transport, 'findUnique').mockResolvedValue(mockTransport);
      jest.spyOn(prismaService.message, 'create').mockResolvedValue(mockMessage);
      jest.spyOn(notificationsService, 'create').mockResolvedValue(null);

      const createMessageDto = {
        contenu: 'Test message',
        transportId: 1,
        clientId: 1,
        chauffeurId: 2,
        expediteurType: TypeExpediteur.CLIENT,
      };

      const result = await service.create(createMessageDto);

      expect(prismaService.transport.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { client: true, chauffeur: true },
      });
      expect(prismaService.message.create).toHaveBeenCalledWith({
        data: createMessageDto,
        include: {
          client: true,
          chauffeur: true,
          reservation: true,
          course: true,
          transport: true,
        },
      });
      expect(result).toEqual(mockMessage);
    });

    it('should validate transport access for client', async () => {
      const mockTransport = {
        id: 1,
        clientId: 2, // Different client ID
        chauffeurId: 2,
        client: { id: 2, nom: 'Dupont', prenom: 'Jean' },
        chauffeur: { id: 2, nom: 'Martin', prenom: 'Pierre' },
      };

      jest.spyOn(prismaService.transport, 'findUnique').mockResolvedValue(mockTransport);

      const createMessageDto = {
        contenu: 'Test message',
        transportId: 1,
        clientId: 1, // Different client ID
        chauffeurId: 2,
        expediteurType: TypeExpediteur.CLIENT,
      };

      await expect(service.create(createMessageDto)).rejects.toThrow(
        'Ce client n\'est pas associé à ce transport'
      );
    });

    it('should validate transport access for chauffeur', async () => {
      const mockTransport = {
        id: 1,
        clientId: 1,
        chauffeurId: 3, // Different chauffeur ID
        client: { id: 1, nom: 'Dupont', prenom: 'Jean' },
        chauffeur: { id: 3, nom: 'Martin', prenom: 'Pierre' },
      };

      jest.spyOn(prismaService.transport, 'findUnique').mockResolvedValue(mockTransport);

      const createMessageDto = {
        contenu: 'Test message',
        transportId: 1,
        clientId: 1,
        chauffeurId: 2, // Different chauffeur ID
        expediteurType: TypeExpediteur.CHAUFFEUR,
      };

      await expect(service.create(createMessageDto)).rejects.toThrow(
        'Ce chauffeur n\'est pas associé à ce transport'
      );
    });
  });

  describe('getConversationsForClient', () => {
    it('should return transport conversations for client', async () => {
      const mockTransports = [
        {
          id: 1,
          adresseDepart: 'Paris',
          adresseDestination: 'Lyon',
          dateReservation: new Date(),
          status: 'EN_COURS',
          chauffeur: {
            id: 1,
            nom: 'Martin',
            prenom: 'Pierre',
            photoUrl: 'photo.jpg',
          },
          _count: {
            messages: 5,
          },
        },
      ];

      jest.spyOn(prismaService.transport, 'findMany').mockResolvedValue(mockTransports);

      const result = await service.getConversationsForClient(1);

      expect(result.transports).toHaveLength(1);
      expect(result.transports[0]).toEqual({
        type: 'TRANSPORT',
        id: 1,
        trajet: 'Paris → Lyon',
        chauffeur: {
          id: 1,
          nom: 'Pierre Martin',
          photoUrl: 'photo.jpg',
        },
        date: mockTransports[0].dateReservation,
        status: 'EN_COURS',
        messageCount: 5,
      });
    });
  });

  describe('findUnreadCount', () => {
    it('should count unread messages for client including transport messages', async () => {
      jest.spyOn(prismaService.message, 'count').mockResolvedValue(3);

      const result = await service.findUnreadCount(1);

      expect(prismaService.message.count).toHaveBeenCalledWith({
        where: {
          lu: false,
          expediteurType: TypeExpediteur.CHAUFFEUR,
          OR: [
            { clientId: 1 },
            { AND: [{ transportId: { not: null } }, { transport: { clientId: 1 } }] },
          ],
        },
      });
      expect(result.count).toBe(3);
    });
  });
});
