import { PrismaService } from "../prisma/prisma.service";
export declare class StatistiquesService {
    private prisma;
    constructor(prisma: PrismaService);
    getKPIs(): Promise<{
        totalCourses: number;
        chauffeursActifs: number;
        vehiculesDisponibles: number;
        incidentsNonResolus: number;
        revenus: number;
        tauxSatisfaction: number;
    }>;
    getKPIsEvolution(): Promise<{
        courseDuJour: {
            total: number;
            evolution: number;
        };
        chauffeurActif: {
            total: number;
            evolution: number;
        };
        coursesEnCours: number;
        vehiculeEnService: {
            total: number;
            evolution: number;
        };
        incidentsNonResolusAujourdHui: {
            total: number;
            evolution: number;
        };
        clientActif: {
            total: number;
            evolution: number;
        };
        revenu: {
            total: number;
            evolution: number;
        };
        satisfaction: {
            total: number;
            evolution: number;
        };
        coursesParStatutData: {
            status: string;
            count: number;
        }[];
        revenusMensuels: any[];
    }>;
    getStatistiquesCourses(periode: string): Promise<{
        totalCourses: number;
        statistiquesData: {
            periode: string;
            courses: any;
        }[];
    }>;
    getStatistiquesRevenus(periode: string): Promise<{
        revenuTotal: number;
        statistiquesData: {
            periode: string;
            revenus: any;
        }[];
    }>;
    getStatistiquesIncidents(periode: string): Promise<{
        totalIncidents: number;
        incidentsParType: {};
        incidentsParStatut: {};
        statistiquesData: {
            periode: string;
            incidents: any;
        }[];
    }>;
}
