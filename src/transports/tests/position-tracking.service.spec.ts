import { Test, TestingModule } from '@nestjs/testing';
import { TransportsService } from '../transports.service';
import { PositionTrackingService } from '../position-tracking.service';
import { TransportGateway } from '../transport.gateway';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../../stripe/stripe.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';

describe('PositionTrackingService', () => {
  let service: PositionTrackingService;
  let transportsService: TransportsService;
  let gateway: TransportGateway;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionTrackingService,
        TransportsService,
        TransportGateway,
        {
          provide: PrismaService,
          useValue: {
            transport: {
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: StripeService,
          useValue: {
            retrievePaymentIntent: jest.fn(),
            capturePaymentIntent: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createSystemNotification: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<PositionTrackingService>(PositionTrackingService);
    transportsService = module.get<TransportsService>(TransportsService);
    gateway = module.get<TransportGateway>(TransportGateway);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startAutoTracking', () => {
    it('should start automatic tracking for a transport', async () => {
      const transportId = 1;
      const intervalMs = 30000;

      const result = await service.startAutoTracking(transportId, intervalMs);

      expect(result).toEqual({
        transportId,
        message: 'Suivi automatique activé',
        interval: intervalMs,
        timestamp: expect.any(Date),
      });
    });
  });

  describe('stopAutoTracking', () => {
    it('should stop automatic tracking for a transport', () => {
      const transportId = 1;

      // D'abord démarrer le suivi
      service.startAutoTracking(transportId);

      const result = service.stopAutoTracking(transportId);

      expect(result).toEqual({
        transportId,
        message: 'Suivi automatique désactivé',
        timestamp: expect.any(Date),
      });
    });

    it('should return appropriate message when no tracking is active', () => {
      const transportId = 999;

      const result = service.stopAutoTracking(transportId);

      expect(result).toEqual({
        transportId,
        message: 'Aucun suivi automatique actif',
        timestamp: expect.any(Date),
      });
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      const pos1 = { lat: 48.8566, lng: 2.3522 }; // Paris
      const pos2 = { lat: 45.7640, lng: 4.8357 }; // Lyon
      
      // Utiliser une méthode publique pour tester (ou rendre la méthode publique pour les tests)
      const distance = (service as any).calculateDistance(pos1, pos2);
      
      // La distance entre Paris et Lyon est d'environ 392 km
      expect(distance).toBeGreaterThan(390);
      expect(distance).toBeLessThan(400);
    });
  });

  describe('getTrackingStats', () => {
    it('should return tracking statistics', () => {
      const transportId1 = 1;
      const transportId2 = 2;

      // Démarrer quelques suivis
      service.startAutoTracking(transportId1);
      service.startAutoTracking(transportId2);

      const stats = service.getTrackingStats();

      expect(stats.activeTrackings).toBe(2);
      expect(stats.trackedTransports).toContain(transportId1);
      expect(stats.trackedTransports).toContain(transportId2);
    });
  });

  describe('cleanup', () => {
    it('should cleanup all tracking intervals', () => {
      const transportId1 = 1;
      const transportId2 = 2;

      // Démarrer quelques suivis
      service.startAutoTracking(transportId1);
      service.startAutoTracking(transportId2);

      expect(service.getTrackingStats().activeTrackings).toBe(2);

      // Nettoyer
      service.cleanup();

      expect(service.getTrackingStats().activeTrackings).toBe(0);
    });
  });
});

describe('TransportGateway Real-time Features', () => {
  let gateway: TransportGateway;
  let mockSocket: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransportGateway,
        {
          provide: PrismaService,
          useValue: {
            transport: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            chauffeur: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: 'JwtService',
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<TransportGateway>(TransportGateway);

    // Mock du socket
    mockSocket = {
      id: 'test-socket-id',
      handshake: {
        auth: { token: 'test-token' },
        headers: {},
      },
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };
  });

  it('should handle position updates via WebSocket', async () => {
    const positionData = {
      transportId: 1,
      latitude: 48.8566,
      longitude: 2.3522,
      statusInfo: 'En route vers le client',
    };

    // Mock des données nécessaires
    (gateway as any).connectedClients.set(mockSocket.id, {
      userId: 1,
      userType: 'chauffeur',
      socketId: mockSocket.id,
    });

    const mockTransport = {
      id: 1,
      chauffeurId: 1,
      clientId: 1,
      status: 'EN_COURSE',
    };

   // jest.spyOn(gateway['prismaService'].transport, 'findUnique')
   //   .mockResolvedValue(mockTransport);
   // jest.spyOn(gateway['prismaService'].transport, 'update')
    //  .mockResolvedValue(mockTransport);

    await gateway.handleUpdatePosition(positionData, mockSocket);

    expect(mockSocket.emit).toHaveBeenCalledWith('position_updated', 
      expect.objectContaining({
        transportId: positionData.transportId,
        position: {
          lat: positionData.latitude,
          lng: positionData.longitude,
        },
        message: 'Position mise à jour avec succès',
      })
    );
  });
});
