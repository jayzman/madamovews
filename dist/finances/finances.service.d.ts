import { PrismaService } from "../prisma/prisma.service";
export declare class FinancesService {
    private prisma;
    constructor(prisma: PrismaService);
    getResumeFinancier(periode: string): Promise<{
        revenuTotal: number;
        revenusSalaries: number;
        revenusIndependants: number;
        depensesTotal: number;
        depensesCarburant: number;
        depensesMaintenance: number;
        depensesSalaires: number;
        profit: number;
        financesData: {
            periode: string;
            revenus: any;
            depenses: any;
            profit: any;
        }[];
    }>;
    getHistoriqueActivites(params: {
        skip?: number;
        take?: number;
        type?: string;
        dateDebut?: Date;
        dateFin?: Date;
    }): Promise<{
        id: number;
        date: Date;
        type: string;
        description: string;
        chauffeur: string;
        passager: string;
        montant: string;
    }[]>;
}
