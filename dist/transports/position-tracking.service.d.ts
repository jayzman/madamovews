import { PrismaService } from '../prisma/prisma.service';
import { TransportGateway } from './transport.gateway';
import { ConfigService } from '@nestjs/config';
export declare class PositionTrackingService {
    private prisma;
    private transportGateway;
    private configService;
    private readonly logger;
    private googleMapsClient;
    private trackingIntervals;
    private lastPositions;
    constructor(prisma: PrismaService, transportGateway: TransportGateway, configService: ConfigService);
    startAutoTracking(transportId: number, intervalMs?: number): Promise<{
        transportId: number;
        message: string;
        interval: number;
        timestamp: Date;
    }>;
    stopAutoTracking(transportId: number): {
        transportId: number;
        message: string;
        timestamp: Date;
    };
    private checkTransportStatus;
    private calculateAndEmitETA;
    private calculateRouteInfo;
    detectRouteDeviation(transportId: number, currentPosition: {
        lat: number;
        lng: number;
    }): Promise<void>;
    private calculateDistance;
    private degreesToRadians;
    cleanup(): void;
    getTrackingStats(): {
        activeTrackings: number;
        trackedTransports: number[];
        lastPositions: {
            [k: string]: {
                lat: number;
                lng: number;
                timestamp: Date;
            };
        };
    };
}
