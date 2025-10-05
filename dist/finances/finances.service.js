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
exports.FinancesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FinancesService = class FinancesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getResumeFinancier(periode) {
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
            include: {
                chauffeur: true,
            },
        });
        const revenuTotal = courses.reduce((total, course) => total + (course.finalPrice || 0), 0);
        const revenusSalaries = courses
            .filter((course) => course.chauffeur.statut === "SALARIE")
            .reduce((total, course) => total + (course.finalPrice || 0), 0);
        const revenusIndependants = courses
            .filter((course) => course.chauffeur.statut === "INDEPENDANT")
            .reduce((total, course) => total + (course.finalPrice || 0), 0);
        const depensesCarburant = revenuTotal * 0.1;
        const depensesMaintenance = revenuTotal * 0.05;
        const depensesSalaires = revenuTotal * 0.3;
        const depensesTotal = depensesCarburant + depensesMaintenance + depensesSalaires;
        const profit = revenuTotal - depensesTotal;
        const revenusParPeriode = {};
        const depensesParPeriode = {};
        const profitParPeriode = {};
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
            const revenu = course.finalPrice || 0;
            revenusParPeriode[key] = (revenusParPeriode[key] || 0) + revenu;
            const depense = revenu * 0.45;
            depensesParPeriode[key] = (depensesParPeriode[key] || 0) + depense;
            profitParPeriode[key] = (profitParPeriode[key] || 0) + (revenu - depense);
        });
        const financesData = Object.keys(revenusParPeriode).map((key) => ({
            periode: key,
            revenus: revenusParPeriode[key],
            depenses: depensesParPeriode[key],
            profit: profitParPeriode[key],
        }));
        return {
            revenuTotal,
            revenusSalaries,
            revenusIndependants,
            depensesTotal,
            depensesCarburant,
            depensesMaintenance,
            depensesSalaires,
            profit,
            financesData,
        };
    }
    async getHistoriqueActivites(params) {
        const { skip, take, type, dateDebut, dateFin } = params;
        const whereClause = {};
        if (dateDebut || dateFin) {
            whereClause.startTime = {};
            if (dateDebut) {
                whereClause.startTime.gte = dateDebut;
            }
            if (dateFin) {
                whereClause.startTime.lte = dateFin;
            }
        }
        if (type) {
            whereClause.status = type;
        }
        const courses = await this.prisma.course.findMany({
            skip,
            take,
            where: whereClause,
            orderBy: {
                startTime: "desc",
            },
            include: {
                chauffeur: true,
                client: true,
            },
        });
        const activites = courses.map((course) => ({
            id: course.id,
            date: course.startTime,
            type: "Course",
            description: `Course #${course.id} ${course.status}`,
            chauffeur: `${course.chauffeur.prenom} ${course.chauffeur.nom}`,
            passager: `${course.client.prenom} ${course.client.nom}`,
            montant: course.finalPrice ? `${course.finalPrice}€` : "-",
        }));
        return activites;
    }
};
exports.FinancesService = FinancesService;
exports.FinancesService = FinancesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinancesService);
//# sourceMappingURL=finances.service.js.map