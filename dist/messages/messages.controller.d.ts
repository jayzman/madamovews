import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(createMessageDto: CreateMessageDto): Promise<{
        chauffeur: {
            email: string;
            password: string | null;
            nom: string;
            prenom: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            telephone: string;
            statut: import(".prisma/client").$Enums.StatutChauffeur;
            statutActivite: import(".prisma/client").$Enums.StatutActivite;
            vehiculeId: number | null;
            photoUrl: string | null;
            dateInscription: Date;
            evaluation: number;
            nbCourses: number;
            resetCode: string | null;
            resetCodeExpiry: Date | null;
            smsOtp: string | null;
            smsOtpExpiry: Date | null;
            phoneVerified: boolean | null;
        };
        client: {
            email: string;
            password: string | null;
            nom: string;
            prenom: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            telephone: string;
            statut: import(".prisma/client").$Enums.StatutClient;
            photoUrl: string | null;
            dateInscription: Date | null;
            nbCourses: number | null;
            resetCode: string | null;
            smsOtp: string | null;
            smsOtpExpiry: Date | null;
            phoneVerified: boolean | null;
            adresse: string | null;
            ville: string | null;
            preferences: string | null;
            profileUrl: string | null;
            verified: boolean | null;
            validationCode: string | null;
            resetCodeExpires: Date | null;
            stripeCustomerId: string | null;
        };
        course: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            chauffeurId: number | null;
            startTime: Date | null;
            clientId: number | null;
            startLocation: string;
            endLocation: string;
            endTime: Date | null;
            estimatedDuration: string;
            currentLocation: string | null;
            estimatedPrice: number;
            finalPrice: number | null;
            paymentMethod: string;
            status: import(".prisma/client").$Enums.StatutCourse;
            typeService: import(".prisma/client").$Enums.TypeService;
            locationId: number | null;
            transportId: number | null;
        };
        transport: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            vehiculeId: number;
            evaluation: number | null;
            chauffeurId: number | null;
            clientId: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.StatutTransport;
            departLatitude: number;
            departLongitude: number;
            destinationLatitude: number;
            destinationLongitude: number;
            dateReservation: Date;
            adresseDepart: string;
            adresseDestination: string;
            distanceEstimee: number;
            dureeEstimee: number;
            montantEstime: number;
            montantFinal: number | null;
            heureDepart: Date | null;
            heureArrivee: Date | null;
            dureeReelle: number | null;
            distanceReelle: number | null;
            tarifHoraireApplique: number | null;
            stripePaymentIntentId: string | null;
            commentaire: string | null;
            positionActuelle: import("@prisma/client/runtime/library").JsonValue | null;
            cashPaymentStatus: import(".prisma/client").$Enums.CashPaymentStatus | null;
            cashAmountReceived: number | null;
            cashConfirmedAt: Date | null;
            cashConfirmedBy: number | null;
            promoCodeId: number | null;
            montantReduction: number;
        };
        reservation: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            vehiculeId: number;
            clientId: number;
            status: import(".prisma/client").$Enums.StatutLocation;
            dateDebut: Date;
            dateFin: Date;
            stripeCustomerId: string | null;
            lieuDepart: string | null;
            lieuDestination: string | null;
            departLatitude: number | null;
            departLongitude: number | null;
            destinationLatitude: number | null;
            destinationLongitude: number | null;
            distance: number | null;
            montantTotal: number;
            stripePaymentId: string | null;
            stripeSessionId: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        chauffeurId: number | null;
        clientId: number | null;
        transportId: number | null;
        courseId: number | null;
        lu: boolean;
        contenu: string;
        reservationId: number | null;
        expediteurType: import(".prisma/client").$Enums.TypeExpediteur;
    }>;
    getReservationMessages(reservationId: string, clientId?: string, chauffeurId?: string, skip?: string, take?: string): Promise<{
        items: ({
            chauffeur: {
                nom: string;
                prenom: string;
                id: number;
                photoUrl: string;
            };
            client: {
                nom: string;
                prenom: string;
                id: number;
                profileUrl: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            chauffeurId: number | null;
            clientId: number | null;
            transportId: number | null;
            courseId: number | null;
            lu: boolean;
            contenu: string;
            reservationId: number | null;
            expediteurType: import(".prisma/client").$Enums.TypeExpediteur;
        })[];
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    getCourseMessages(courseId: string, clientId?: string, chauffeurId?: string, skip?: string, take?: string): Promise<{
        items: ({
            chauffeur: {
                nom: string;
                prenom: string;
                id: number;
                photoUrl: string;
            };
            client: {
                nom: string;
                prenom: string;
                id: number;
                profileUrl: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            chauffeurId: number | null;
            clientId: number | null;
            transportId: number | null;
            courseId: number | null;
            lu: boolean;
            contenu: string;
            reservationId: number | null;
            expediteurType: import(".prisma/client").$Enums.TypeExpediteur;
        })[];
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    getTransportMessages(transportId: string, clientId?: string, chauffeurId?: string, skip?: string, take?: string): Promise<{
        items: ({
            chauffeur: {
                nom: string;
                prenom: string;
                id: number;
                photoUrl: string;
            };
            client: {
                nom: string;
                prenom: string;
                id: number;
                profileUrl: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            chauffeurId: number | null;
            clientId: number | null;
            transportId: number | null;
            courseId: number | null;
            lu: boolean;
            contenu: string;
            reservationId: number | null;
            expediteurType: import(".prisma/client").$Enums.TypeExpediteur;
        })[];
        meta: {
            total: number;
            skip: number;
            take: number;
        };
    }>;
    getClientConversations(clientId: string): Promise<{
        transports: {
            type: string;
            id: number;
            trajet: string;
            chauffeur: {
                id: number;
                nom: string;
                photoUrl: string;
            };
            date: Date;
            status: import(".prisma/client").$Enums.StatutTransport;
            messageCount: number;
        }[];
    }>;
    getChauffeurConversations(chauffeurId: string): Promise<{
        transports: {
            type: string;
            id: number;
            trajet: string;
            client: {
                id: number;
                nom: string;
                profileUrl: string;
            };
            date: Date;
            status: import(".prisma/client").$Enums.StatutTransport;
            messageCount: number;
        }[];
    }>;
    getClientUnreadCount(clientId: string): Promise<{
        count: number;
    }>;
    getChauffeurUnreadCount(chauffeurId: string): Promise<{
        count: number;
    }>;
}
