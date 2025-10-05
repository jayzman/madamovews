export declare class UpdatePositionDto {
    latitude: number;
    longitude: number;
    statusInfo?: string;
    enableAutoTracking?: boolean;
}
export declare class PositionUpdateEventDto {
    transportId: number;
    chauffeurId: number;
    position: {
        lat: number;
        lng: number;
    };
    timestamp: Date;
    statusInfo?: string;
}
export declare class ETAUpdateDto {
    transportId: number;
    estimatedArrival: Date;
    distanceRemaining: number;
    durationRemaining: number;
    timestamp: Date;
}
