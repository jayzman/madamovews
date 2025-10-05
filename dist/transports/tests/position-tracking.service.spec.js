"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const transports_service_1 = require("../transports.service");
const position_tracking_service_1 = require("../position-tracking.service");
const transport_gateway_1 = require("../transport.gateway");
const prisma_service_1 = require("../../prisma/prisma.service");
const stripe_service_1 = require("../../stripe/stripe.service");
const notifications_service_1 = require("../../notifications/notifications.service");
const config_1 = require("@nestjs/config");
describe('PositionTrackingService', () => {
    let service;
    let transportsService;
    let gateway;
    let prismaService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                position_tracking_service_1.PositionTrackingService,
                transports_service_1.TransportsService,
                transport_gateway_1.TransportGateway,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {
                        transport: {
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            findMany: jest.fn(),
                        },
                    },
                },
                {
                    provide: stripe_service_1.StripeService,
                    useValue: {
                        retrievePaymentIntent: jest.fn(),
                        capturePaymentIntent: jest.fn(),
                    },
                },
                {
                    provide: notifications_service_1.NotificationsService,
                    useValue: {
                        createSystemNotification: jest.fn(),
                    },
                },
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('test-api-key'),
                    },
                },
            ],
        }).compile();
        service = module.get(position_tracking_service_1.PositionTrackingService);
        transportsService = module.get(transports_service_1.TransportsService);
        gateway = module.get(transport_gateway_1.TransportGateway);
        prismaService = module.get(prisma_service_1.PrismaService);
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
            const pos1 = { lat: 48.8566, lng: 2.3522 };
            const pos2 = { lat: 45.7640, lng: 4.8357 };
            const distance = service.calculateDistance(pos1, pos2);
            expect(distance).toBeGreaterThan(390);
            expect(distance).toBeLessThan(400);
        });
    });
    describe('getTrackingStats', () => {
        it('should return tracking statistics', () => {
            const transportId1 = 1;
            const transportId2 = 2;
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
            service.startAutoTracking(transportId1);
            service.startAutoTracking(transportId2);
            expect(service.getTrackingStats().activeTrackings).toBe(2);
            service.cleanup();
            expect(service.getTrackingStats().activeTrackings).toBe(0);
        });
    });
});
describe('TransportGateway Real-time Features', () => {
    let gateway;
    let mockSocket;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                transport_gateway_1.TransportGateway,
                {
                    provide: prisma_service_1.PrismaService,
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
        gateway = module.get(transport_gateway_1.TransportGateway);
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
        gateway.connectedClients.set(mockSocket.id, {
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
        await gateway.handleUpdatePosition(positionData, mockSocket);
        expect(mockSocket.emit).toHaveBeenCalledWith('position_updated', expect.objectContaining({
            transportId: positionData.transportId,
            position: {
                lat: positionData.latitude,
                lng: positionData.longitude,
            },
            message: 'Position mise à jour avec succès',
        }));
    });
});
//# sourceMappingURL=position-tracking.service.spec.js.map