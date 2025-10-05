import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransportGateway } from './transport.gateway';
import { ConfigService } from '@nestjs/config';
import { Client as GoogleMapsClient, TravelMode } from '@googlemaps/google-maps-services-js';

@Injectable()
export class PositionTrackingService {
  private readonly logger = new Logger(PositionTrackingService.name);
  private googleMapsClient: GoogleMapsClient;
  private trackingIntervals = new Map<number, NodeJS.Timeout>();
  private lastPositions = new Map<number, { lat: number; lng: number; timestamp: Date }>();

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TransportGateway))
    private transportGateway: TransportGateway,
    private configService: ConfigService,
  ) {
    this.googleMapsClient = new GoogleMapsClient({});
  }

  // Démarrer le suivi automatique pour un transport
  async startAutoTracking(transportId: number, intervalMs: number = 30000) {
    // Arrêter le suivi existant s'il y en a un
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

  // Arrêter le suivi automatique pour un transport
  stopAutoTracking(transportId: number) {
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

  // Vérifier le statut d'un transport et émettre des alertes si nécessaire
  private async checkTransportStatus(transportId: number) {
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

      // Si le transport est terminé ou annulé, arrêter le suivi
      if (transport.status === 'TERMINE' || transport.status === 'ANNULE') {
        this.stopAutoTracking(transportId);
        return;
      }

      // Vérifier si la position a été mise à jour récemment
      const lastUpdate = new Date(transport.updatedAt);
      const now = new Date();
      const timeDiffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

      // Alerte si pas de mise à jour depuis plus de 5 minutes
      if (timeDiffMinutes > 5 && transport.status === 'EN_COURSE') {
        await this.transportGateway.notifyTransportParticipants(
          transportId,
          'Aucune mise à jour de position depuis plus de 5 minutes',
          { lastUpdate: lastUpdate, timeDiffMinutes }
        );
      }

      // Calculer et émettre l'ETA si on a une position
      if (transport.positionActuelle) {
        await this.calculateAndEmitETA(transport);
      }

    } catch (error) {
      this.logger.error(`Erreur lors de la vérification du transport ${transportId}:`, error.message);
    }
  }

  // Calculer et émettre l'ETA
  private async calculateAndEmitETA(transport: any) {
    try {
      if (!transport.positionActuelle) return;

      let destination: { lat: number; lng: number };
      let destinationType: string;

      // Déterminer la destination selon le statut
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
          return; // Pas de calcul d'ETA pour les autres statuts
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

        // Émettre via WebSocket
        await this.transportGateway.emitETAUpdate(transport.id, etaData);

        // Vérifier si on s'approche de la destination (moins de 1km)
        if (route.distance < 1) {
          await this.transportGateway.notifyTransportParticipants(
            transport.id,
            `Le chauffeur approche du ${destinationType} (moins d'1 km)`,
            { distance: route.distance, eta: estimatedArrival }
          );
        }
      }

    } catch (error) {
      this.logger.error(`Erreur lors du calcul ETA pour transport ${transport.id}:`, error.message);
    }
  }

  // Calculer les informations de route avec Google Maps
  private async calculateRouteInfo(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    try {
      const response = await this.googleMapsClient.directions({
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          mode: TravelMode.driving,
          key: this.configService.get<string>('GOOGLE_MAPS_API_KEY'),
        },
      });

      if (response.data.routes.length === 0) {
        return null;
      }

      const route = response.data.routes[0].legs[0];
      return {
        distance: route.distance.value / 1000, // Convertir en kilomètres
        duration: Math.ceil(route.duration.value / 60), // Convertir en minutes
      };
    } catch (error) {
      this.logger.error('Erreur lors du calcul de route:', error.message);
      return null;
    }
  }

  // Détecter si le véhicule s'écarte de la route prévue
  async detectRouteDeviation(transportId: number, currentPosition: { lat: number; lng: number }) {
    try {
      const transport = await this.prisma.transport.findUnique({
        where: { id: transportId }
      });

      if (!transport) return;

      let expectedDestination: { lat: number; lng: number };
      
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

      // Calculer la route optimale
      const optimalRoute = await this.calculateRouteInfo(currentPosition, expectedDestination);
      
      if (optimalRoute) {
        // Stocker la position actuelle pour comparaison future
        const lastPosition = this.lastPositions.get(transportId);
        
        if (lastPosition) {
          // Calculer la distance parcourue
          const distanceTraveled = this.calculateDistance(lastPosition, currentPosition);
          
          // Si la distance parcourue est significativement plus grande que prévu, il pourrait y avoir déviation
          // Cette logique peut être affinée selon les besoins
          if (distanceTraveled > 2) { // Plus de 2km depuis la dernière position
            await this.transportGateway.notifyTransportParticipants(
              transportId,
              'Le véhicule semble avoir dévié de la route prévue',
              { 
                currentPosition, 
                distanceTraveled,
                expectedRoute: optimalRoute
              }
            );
          }
        }
        
        this.lastPositions.set(transportId, { ...currentPosition, timestamp: new Date() });
      }

    } catch (error) {
      this.logger.error(`Erreur lors de la détection de déviation pour transport ${transportId}:`, error.message);
    }
  }

  // Calculer la distance entre deux points (formule de Haversine)
  private calculateDistance(pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.degreesToRadians(pos2.lat - pos1.lat);
    const dLng = this.degreesToRadians(pos2.lng - pos1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(pos1.lat)) * Math.cos(this.degreesToRadians(pos2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Nettoyer tous les suivis actifs (utile lors de l'arrêt de l'application)
  cleanup() {
    this.trackingIntervals.forEach((interval, transportId) => {
      clearInterval(interval);
      this.logger.log(`Nettoyage du suivi pour transport ${transportId}`);
    });
    
    this.trackingIntervals.clear();
    this.lastPositions.clear();
  }

  // Obtenir les statistiques de suivi
  getTrackingStats() {
    return {
      activeTrackings: this.trackingIntervals.size,
      trackedTransports: Array.from(this.trackingIntervals.keys()),
      lastPositions: Object.fromEntries(this.lastPositions.entries())
    };
  }
}
