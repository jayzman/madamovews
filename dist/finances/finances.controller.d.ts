import { FinancesService } from "./finances.service";
export declare class FinancesController {
    private readonly financesService;
    constructor(financesService: FinancesService);
    getResumeFinancier(periode?: string): Promise<{
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
    getHistoriqueActivites(skip?: string, take?: string, type?: string, dateDebut?: string, dateFin?: string): Promise<{
        id: number;
        date: Date;
        type: string;
        description: string;
        chauffeur: string;
        passager: string;
        montant: string;
    }[]>;
}
