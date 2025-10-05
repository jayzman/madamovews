export declare enum PaymentMethod {
    STRIPE = "STRIPE",
    CASH = "CASH"
}
export declare class CreateTransportDto {
    clientId: number;
    vehiculeId: number;
    adresseDepart: string;
    adresseDestination: string;
    departLatitude: number;
    departLongitude: number;
    destinationLatitude: number;
    destinationLongitude: number;
    paymentMethod?: PaymentMethod;
    promoCode?: string;
}
