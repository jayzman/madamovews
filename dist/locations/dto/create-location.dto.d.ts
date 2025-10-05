export declare class CreateLocationDto {
    clientId: number;
    vehiculeId: number;
    dateDebut: string;
    dateFin: string;
    lieuDepart: string;
    lieuDestination: string;
    departLatitude?: number;
    departLongitude?: number;
    destinationLatitude?: number;
    destinationLongitude?: number;
    distance?: number;
    montantTotal: number;
}
