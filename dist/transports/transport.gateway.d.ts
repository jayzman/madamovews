import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { PositionUpdateEventDto } from "./dto/update-position.dto";
export declare class TransportGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private prismaService;
    server: Server;
    private logger;
    private connectedClients;
    constructor(jwtService: JwtService, prismaService: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinTransport(data: {
        transportId: number;
    }, client: Socket): Promise<void>;
    handleLeaveTransport(data: {
        transportId: number;
    }, client: Socket): Promise<void>;
    handleUpdatePosition(data: {
        transportId: number;
        latitude: number;
        longitude: number;
        statusInfo?: string;
    }, client: Socket): Promise<void>;
    handleGetCurrentPosition(data: {
        transportId: number;
    }, client: Socket): Promise<void>;
    emitPositionUpdate(transportId: number, positionData: PositionUpdateEventDto): Promise<void>;
    emitStatusUpdate(transportId: number, statusData: any): Promise<void>;
    notifyClient(clientId: number, message: string, data?: any): Promise<void>;
    notifyChauffeur(chauffeurId: number, message: string, data?: any): Promise<void>;
    notifyTransportParticipants(transportId: number, message: string, data?: any): Promise<void>;
    emitETAUpdate(transportId: number, etaData: {
        estimatedArrival: Date;
        distanceRemaining: number;
        durationRemaining: number;
    }): Promise<void>;
    startRealTimeTracking(transportId: number): Promise<void>;
    stopRealTimeTracking(transportId: number): Promise<void>;
    getConnectedClientsForTransport(transportId: number): any[];
}
