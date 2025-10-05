"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PositionTrackingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionTrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const transport_gateway_1 = require("./transport.gateway");
const config_1 = require("@nestjs/config");
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
let PositionTrackingService = PositionTrackingService_1 = class PositionTrackingService {
    constructor(prisma, transportGateway, configService) {
        this.prisma = prisma;
        this.transportGateway = transportGateway;
        this.configService = configService;
        this.logger = new common_1.Logger(PositionTrackingService_1.name);
        this.trackingIntervals = new Map();
        this.lastPositions = new Map();
        this.googleMapsClient = new google_maps_services_js_1.Client({});
    }
    async startAutoTracking(transportId, intervalMs = 30000) {
        this.stopAutoTracking(transportId);
        const interval = setInterval(async () => {
            await this.checkTransportStatus(transportId);
        }, intervalMs);
        this.trackingIntervals.set(transportId, interval);
        this.logger.log(`Suivi automatique démarré pour le transport ${transportId} (intervalle: ${intervalMs}ms)`);
        return {
            transportId,
            message: 'Suivi automatique activé',
            interval: intervalMs,
            timestamp: new Date()
        };
    }
    stopAutoTracking(transportId) {
        const interval = this.trackingIntervals.get(transportId);
        if (interval) {
            clearInterval(interval);
            this.trackingIntervals.delete(transportId);
            this.lastPositions.delete(transportId);
            this.logger.log(`Suivi automatique arrêté pour le transport ${transportId}`);
            return {
                transportId,
                message: 'Suivi automatique désactivé',
                timestamp: new Date()
            };
        }
        return {
            transportId,
            message: 'Aucun suivi automatique actif',
            timestamp: new Date()
        };
    }
    async checkTransportStatus(transportId) {
        try {
            const transport = await this.prisma.transport.findUnique({
                where: { id: transportId },
                include: {
                    chauffeur: true,
                    client: true,
                }
            });
            if (!transport) {
                this.stopAutoTracking(transportId);
                return;
            }
            if (transport.status === 'TERMINE' || transport.status === 'ANNULE') {
                this.stopAutoTracking(transportId);
                return;
            }
            const lastUpdate = new Date(transport.updatedAt);
            const now = new Date();
            const timeDiffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
            if (timeDiffMinutes > 5 && transport.status === 'EN_COURSE') {
                await this.transportGateway.notifyTransportParticipants(transportId, 'Aucune mise à jour de position depuis plus de 5 minutes', { lastUpdate: lastUpdate, timeDiffMinutes });
            }
            if (transport.positionActuelle) {
                await this.calculateAndEmitETA(transport);
            }
        }
        catch (error) {
            this.logger.error(`Erreur lors de la vérification du transport ${transportId}:`, error.message);
        }
    }
    async calculateAndEmitETA(transport) {
        try {
            if (!transport.positionActuelle)
                return;
            let destination;
            let destinationType;
            switch (transport.status) {
                case 'EN_ROUTE_RAMASSAGE':
                    destination = { lat: transport.departLatitude, lng: transport.departLongitude };
                    destinationType = 'point de ramassage';
                    break;
                case 'EN_COURSE':
                    destination = { lat: transport.destinationLatitude, lng: transport.destinationLongitude };
                    destinationType = 'destination finale';
                    break;
                default:
                    return;
            }
            const currentPosition = {
                lat: transport.positionActuelle.lat,
                lng: transport.positionActuelle.lng
            };
            const route = await this.calculateRouteInfo(currentPosition, destination);
            if (route) {
                const estimatedArrival = new Date();
                estimatedArrival.setMinutes(estimatedArrival.getMinutes() + route.duration);
                const etaData = {
                    transportId: transport.id,
                    estimatedArrival,
                    distanceRemaining: route.distance,
                    durationRemaining: route.duration,
                    destinationType,
                    timestamp: new Date()
                };
                await this.transportGateway.emitETAUpdate(transport.id, etaData);
                if (route.distance < 1) {
                    await this.transportGateway.notifyTransportParticipants(transport.id, `Le chauffeur approche du ${destinationType} (moins d'1 km)`, { distance: route.distance, eta: estimatedArrival });
                }
            }
        }
        catch (error) {
            this.logger.error(`Erreur lors du calcul ETA pour transport ${transport.id}:`, error.message);
        }
    }
    async calculateRouteInfo(origin, destination) {
        try {
            const response = await this.googleMapsClient.directions({
                params: {
                    origin: `${origin.lat},${origin.lng}`,
                    destination: `${destination.lat},${destination.lng}`,
                    mode: google_maps_services_js_1.TravelMode.driving,
                    key: this.configService.get('GOOGLE_MAPS_API_KEY'),
                },
            });
            if (response.data.routes.length === 0) {
                return null;
            }
            const route = response.data.routes[0].legs[0];
            return {
                distance: route.distance.value / 1000,
                duration: Math.ceil(route.duration.value / 60),
            };
        }
        catch (error) {
            this.logger.error('Erreur lors du calcul de route:', error.message);
            return null;
        }
    }
    async detectRouteDeviation(transportId, currentPosition) {
        try {
            const transport = await this.prisma.transport.findUnique({
                where: { id: transportId }
            });
            if (!transport)
                return;
            let expectedDestination;
            switch (transport.status) {
                case 'EN_ROUTE_RAMASSAGE':
                    expectedDestination = { lat: transport.departLatitude, lng: transport.departLongitude };
                    break;
                case 'EN_COURSE':
                    expectedDestination = { lat: transport.destinationLatitude, lng: transport.destinationLongitude };
                    break;
                default:
                    return;
            }
            const optimalRoute = await this.calculateRouteInfo(currentPosition, expectedDestination);
            if (optimalRoute) {
                const lastPosition = this.lastPositions.get(transportId);
                if (lastPosition) {
                    const distanceTraveled = this.calculateDistance(lastPosition, currentPosition);
                    if (distanceTraveled > 2) {
                        await this.transportGateway.notifyTransportParticipants(transportId, 'Le véhicule semble avoir dévié de la route prévue', {
                            currentPosition,
                            distanceTraveled,
                            expectedRoute: optimalRoute
                        });
                    }
                }
                this.lastPositions.set(transportId, { ...currentPosition, timestamp: new Date() });
            }
        }
        catch (error) {
            this.logger.error(`Erreur lors de la détection de déviation pour transport ${transportId}:`, error.message);
        }
    }
    calculateDistance(pos1, pos2) {
        const R = 6371;
        const dLat = this.degreesToRadians(pos2.lat - pos1.lat);
        const dLng = this.degreesToRadians(pos2.lng - pos1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.degreesToRadians(pos1.lat)) * Math.cos(this.degreesToRadians(pos2.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    cleanup() {
        this.trackingIntervals.forEach((interval, transportId) => {
            clearInterval(interval);
            this.logger.log(`Nettoyage du suivi pour transport ${transportId}`);
        });
        this.trackingIntervals.clear();
        this.lastPositions.clear();
    }
    getTrackingStats() {
        return {
            activeTrackings: this.trackingIntervals.size,
            trackedTransports: Array.from(this.trackingIntervals.keys()),
            lastPositions: Object.fromEntries(this.lastPositions.entries())
        };
    }
};
exports.PositionTrackingService = PositionTrackingService;
exports.PositionTrackingService = PositionTrackingService = PositionTrackingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => transport_gateway_1.TransportGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transport_gateway_1.TransportGateway,
        config_1.ConfigService])
], PositionTrackingService);
//# sourceMappingURL=position-tracking.service.js.map