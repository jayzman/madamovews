import { TypeExpediteur } from "@prisma/client";
export declare class CreateAdminMessageDto {
    contenu: string;
    userId: number;
    chauffeurId: number;
    expediteurType: TypeExpediteur;
}
