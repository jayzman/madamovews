import { StatutVehicule, TypeVehicule, CategoryVehicule, FuelType, GearType } from "@prisma/client";
export declare class CreateVehiculeDto {
    marque: string;
    modele: string;
    immatriculation: string;
    type: TypeVehicule;
    statut: StatutVehicule;
    dateAcquisition: string;
    kilometrage: number;
    dateControleTechnique: string;
    photos: string[];
    categorie: CategoryVehicule;
    tarifHoraire: number;
    tarifJournalier: number;
    maxPower?: number;
    fuelConsumption?: number;
    maxSpeed?: number;
    acceleration?: number;
    capacity?: number;
    color?: string;
    fuelType?: FuelType;
    gearType?: GearType;
}
