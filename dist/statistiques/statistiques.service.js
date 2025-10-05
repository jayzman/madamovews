"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatistiquesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StatistiquesService = class StatistiquesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKPIs() {
        const totalCourses = await this.prisma.course.count();
        const chauffeursActifs = await this.prisma.chauffeur.count({
            where: { statutActivite: "ACTIF" },
        });
        const vehiculesDisponibles = await this.prisma.vehicule.count({
            where: { statut: "DISPONIBLE" },
        });
        const incidentsNonResolus = await this.prisma.incident.count({
            where: { status: "NON_RESOLU" },
        });
        const revenus = await this.prisma.course.aggregate({
            where: { status: "TERMINEE" },
            _sum: { finalPrice: true },
        });
        const evaluations = await this.prisma.chauffeur.aggregate({
            _avg: { evaluation: true },
        });
        return {
            totalCourses,
            chauffeursActifs,
            vehiculesDisponibles,
            incidentsNonResolus,
            revenus: revenus._sum.finalPrice || 0,
            tauxSatisfaction: evaluations._avg.evaluation || 0,
        };
    }
    async getKPIsEvolution() {
        const totalCourses = await this.prisma.course.count({
            where: {
                startTime: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(24, 0, 0, 0)),
                },
            },
        });
        const totalCoursesHier = await this.prisma.course.count({
            where: {
                startTime: {
                    gte: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        });
        const evolutionPourcentage = totalCoursesHier === 0
            ? totalCourses > 0
                ? 100
                : 0
            : ((totalCourses - totalCoursesHier) / totalCoursesHier) * 100;
        const coursesEnCours = await this.prisma.transport.count({
            where: { status: "EN_COURSE" },
        });
        const vehiculeEnService = await this.prisma.vehicule.count({
            where: { statut: "EN_SERVICE" },
        });
        const incidentsNonResolusAujourdHui = await this.prisma.incident.count({
            where: {
                status: 'NON_RESOLU',
                date: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(24, 0, 0, 0)),
                },
            },
        });
        const incidentsNonResolusHier = await this.prisma.incident.count({
            where: {
                status: 'NON_RESOLU',
                date: {
                    gte: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        });
        const evolutionIncidentsNonResolus = incidentsNonResolusHier === 0
            ? incidentsNonResolusAujourdHui > 0
                ? 100
                : 0
            : ((incidentsNonResolusAujourdHui - incidentsNonResolusHier) / incidentsNonResolusHier) * 100;
        const clientActif = await this.prisma.client.count({
            where: {
                statut: "ACTIF"
            }
        });
        const evolutionClientActif = async () => {
            const totalClients = await this.prisma.client.count();
            if (totalClients === 0)
                return 0;
            const pourcentage = (clientActif / totalClients) * 100;
            return Math.round(pourcentage);
        };
        const chauffeurActif = await this.prisma.chauffeur.count({ where: {
                statutActivite: "ACTIF"
            } });
        const evolutionChaufeurActif = async () => {
            const totalChauffeur = await this.prisma.chauffeur.count();
            if (totalChauffeur === 0)
                return 0;
            const pourcentage = (chauffeurActif / totalChauffeur) * 100;
            return Math.round(pourcentage);
        };
        const revenuAujourdhui = await this.prisma.credit.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(24, 0, 0, 0)),
                },
            },
        });
        const revenuHier = await this.prisma.credit.count({
            where: {
                createdAt: {
                    gte: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        });
        const evolutionRevenu = revenuHier === 0
            ? revenuAujourdhui > 0
                ? 100
                : 0
            : ((revenuAujourdhui - revenuHier) / revenuHier) * 100;
        const statuses = ["EN_COURS", "TERMINEE", "ANNULEE", "PLANIFIEE"];
        const coursesParStatut = await this.prisma.course.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
        });
        const coursesParStatutData = statuses.map((status) => {
            const found = coursesParStatut.find((statut) => statut.status === status);
            return {
                status,
                count: found ? found._count.status : 0,
            };
        });
        const now = new Date();
        const revenusMensuels = [];
        for (let i = 11; i >= 0; i--) {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const revenuMois = await this.prisma.credit.aggregate({
                where: {
                    createdAt: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
                _sum: {
                    solde: true,
                },
            });
            revenusMensuels.push({
                mois: `${startOfMonth.getFullYear()}-${startOfMonth.getMonth() + 1}`,
                total: revenuMois._sum.solde || 0,
            });
        }
        return {
            courseDuJour: {
                total: totalCourses,
                evolution: evolutionPourcentage,
            },
            chauffeurActif: {
                total: chauffeurActif,
                evolution: await evolutionChaufeurActif(),
            },
            coursesEnCours,
            vehiculeEnService: {
                total: 0,
                evolution: 0
            },
            incidentsNonResolusAujourdHui: {
                total: incidentsNonResolusAujourdHui,
                evolution: evolutionIncidentsNonResolus
            },
            clientActif: {
                total: clientActif,
                evolution: await evolutionClientActif()
            },
            revenu: {
                total: revenuAujourdhui,
                evolution: evolutionRevenu
            },
            satisfaction: {
                total: 0,
                evolution: 0
            },
            coursesParStatutData,
            revenusMensuels
        };
    }
    async getStatistiquesCourses(periode) {
        const dateDebut = new Date();
        switch (periode) {
            case "semaine":
                dateDebut.setDate(dateDebut.getDate() - 7);
                break;
            case "mois":
                dateDebut.setMonth(dateDebut.getMonth() - 1);
                break;
            case "trimestre":
                dateDebut.setMonth(dateDebut.getMonth() - 3);
                break;
            case "annee":
                dateDebut.setFullYear(dateDebut.getFullYear() - 1);
                break;
            default:
                dateDebut.setMonth(dateDebut.getMonth() - 1);
        }
        const courses = await this.prisma.course.findMany({
            where: {
                startTime: {
                    gte: dateDebut,
                },
            },
            orderBy: {
                startTime: "asc",
            },
            include: {
                chauffeur: true,
            },
        });
        const coursesParPeriode = {};
        courses.forEach((course) => {
            let key;
            const date = new Date(course.startTime);
            switch (periode) {
                case "semaine":
                    key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                    break;
                case "mois":
                    key = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`;
                    break;
                case "trimestre":
                    key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    break;
                case "annee":
                    key = `${date.getFullYear()}-${Math.ceil((date.getMonth() + 1) / 3)}`;
                    break;
                default:
                    key = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`;
            }
            coursesParPeriode[key] = (coursesParPeriode[key] || 0) + 1;
        });
        const statistiquesData = Object.keys(coursesParPeriode).map((key) => ({
            periode: key,
            courses: coursesParPeriode[key],
        }));
        return {
            totalCourses: courses.length,
            statistiquesData,
        };
    }
    async getStatistiquesRevenus(periode) {
        const dateDebut = new Date();
        switch (periode) {
            case "semaine":
                dateDebut.setDate(dateDebut.getDate() - 7);
                break;
            case "mois":
                dateDebut.setMonth(dateDebut.getMonth() - 1);
                break;
            case "trimestre":
                dateDebut.setMonth(dateDebut.getMonth() - 3);
                break;
            case "annee":
                dateDebut.setFullYear(dateDebut.getFullYear() - 1);
                break;
            default:
                dateDebut.setMonth(dateDebut.getMonth() - 1);
        }
        const courses = await this.prisma.course.findMany({
            where: {
                status: "TERMINEE",
                startTime: {
                    gte: dateDebut,
                },
            },
            orderBy: {
                startTime: "asc",
            },
            include: {
                chauffeur: true,
            },
        });
        const revenusParPeriode = {};
        courses.forEach((course) => {
            let key;
            const date = new Date(course.startTime);
            switch (periode) {
                case "semaine":
                    key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                    break;
                case "mois":
                    key = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`;
                    break;
                case "trimestre":
                    key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    break;
                case "annee":
                    key = `${date.getFullYear()}-${Math.ceil((date.getMonth() + 1) / 3)}`;
                    break;
                default:
                    key = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`;
            }
            revenusParPeriode[key] = (revenusParPeriode[key] || 0) + (course.finalPrice || 0);
        });
        const statistiquesData = Object.keys(revenusParPeriode).map((key) => ({
            periode: key,
            revenus: revenusParPeriode[key],
        }));
        const revenuTotal = courses.reduce((total, course) => total + (course.finalPrice || 0), 0);
        return {
            revenuTotal,
            statistiquesData,
        };
    }
    async getStatistiquesIncidents(periode) {
        const dateDebut = new Date();
        switch (periode) {
            case "semaine":
                dateDebut.setDate(dateDebut.getDate() - 7);
                break;
            case "mois":
                dateDebut.setMonth(dateDebut.getMonth() - 1);
                break;
            case "trimestre":
                dateDebut.setMonth(dateDebut.getMonth() - 3);
                break;
            case "annee":
                dateDebut.setFullYear(dateDebut.getFullYear() - 1);
                break;
            default:
                dateDebut.setMonth(dateDebut.getMonth() - 1);
        }
        const incidents = await this.prisma.incident.findMany({
            where: {
                date: {
                    gte: dateDebut,
                },
            },
            orderBy: {
                date: "asc",
            },
        });
        const incidentsParType = {};
        incidents.forEach((incident) => {
            incidentsParType[incident.type] = (incidentsParType[incident.type] || 0) + 1;
        });
        const incidentsParStatut = {};
        incidents.forEach((incident) => {
            incidentsParStatut[incident.status] = (incidentsParStatut[incident.status] || 0) + 1;
        });
        const incidentsParPeriode = {};
        incidents.forEach((incident) => {
            let key;
            const date = new Date(incident.date);
            switch (periode) {
                case "semaine":
                    key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                    break;
                case "mois":
                    key = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`;
                    break;
                case "trimestre":
                    key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    break;
                case "annee":
                    key = `${date.getFullYear()}-${Math.ceil((date.getMonth() + 1) / 3)}`;
                    break;
                default:
                    key = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`;
            }
            incidentsParPeriode[key] = (incidentsParPeriode[key] || 0) + 1;
        });
        const statistiquesData = Object.keys(incidentsParPeriode).map((key) => ({
            periode: key,
            incidents: incidentsParPeriode[key],
        }));
        return {
            totalIncidents: incidents.length,
            incidentsParType,
            incidentsParStatut,
            statistiquesData,
        };
    }
};
exports.StatistiquesService = StatistiquesService;
exports.StatistiquesService = StatistiquesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatistiquesService);
//# sourceMappingURL=statistiques.service.js.map