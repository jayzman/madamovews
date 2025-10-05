import { TypeExpediteur } from '@prisma/client';
export declare class CreateMessageDto {
    contenu: string;
    clientId?: number;
    chauffeurId?: number;
    reservationId?: number;
    courseId?: number;
    transportId?: number;
    expediteurType: TypeExpediteur;
}
