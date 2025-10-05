export declare enum TypeNotification {
    PAIEMENT = "PAIEMENT",
    RESERVATION = "RESERVATION",
    COURSE = "COURSE",
    SYSTEME = "SYSTEME",
    OFFRE = "OFFRE",
    CARTE = "CARTE",
    MAINTENANCE = "MAINTENANCE",
    AUTRE = "AUTRE"
}
export declare class CreateNotificationDto {
    titre: string;
    message: string;
    type: TypeNotification;
    userId?: number;
    chauffeurId?: number;
    clientId?: number;
    donnees?: string;
}
