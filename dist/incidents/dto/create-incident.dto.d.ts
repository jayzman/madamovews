import { StatutIncident, TypeIncident } from "@prisma/client";
export declare class CreateIncidentDto {
    type: TypeIncident;
    description: string;
    date?: string;
    status?: StatutIncident;
    courseId?: number;
    chauffeurId?: number;
    vehiculeId?: number;
}
