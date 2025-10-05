import { StatutMaintenance } from "@prisma/client";
export declare class CreateMaintenanceDto {
    date: string;
    type: string;
    description?: string;
    cout: number;
    kilometrage: number;
    statut: StatutMaintenance;
}
