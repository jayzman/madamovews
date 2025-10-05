import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class StatistiquesService {
  constructor(private prisma: PrismaService) { }

  async getKPIs() {
    // Récupérer le nombre total de courses
    const totalCourses = await this.prisma.course.count()

    // Récupérer le nombre de chauffeurs actifs
    const chauffeursActifs = await this.prisma.chauffeur.count({
      where: { statutActivite: "ACTIF" },
    })

    // Récupérer le nombre de véhicules disponibles
    const vehiculesDisponibles = await this.prisma.vehicule.count({
      where: { statut: "DISPONIBLE" },
    })

    // Récupérer le nombre d'incidents non résolus
    const incidentsNonResolus = await this.prisma.incident.count({
      where: { status: "NON_RESOLU" },
    })

    // Récupérer les revenus totaux (somme des prix finaux des courses terminées)
    const revenus = await this.prisma.course.aggregate({
      where: { status: "TERMINEE" },
      _sum: { finalPrice: true },
    })

    // Calculer le taux de satisfaction (moyenne des évaluations des chauffeurs)
    const evaluations = await this.prisma.chauffeur.aggregate({
      _avg: { evaluation: true },
    })

    return {
      totalCourses,
      chauffeursActifs,
      vehiculesDisponibles,
      incidentsNonResolus,
      revenus: revenus._sum.finalPrice || 0,
      tauxSatisfaction: evaluations._avg.evaluation || 0,
    }
  }

  async getKPIsEvolution() {
    // Récupérer le nombre total de courses aujourd'hui
    const totalCourses = await this.prisma.course.count({
      where: {
        startTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
          lt: new Date(new Date().setHours(24, 0, 0, 0)), // Start of tomorrow
        },
      },
    })

    // Récupérer le nombre total de courses hier
    const totalCoursesHier = await this.prisma.course.count({
      where: {
        startTime: {
          gte: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)), // Start of yesterday
          lt: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
        },
      },
    });

    // Calculer le pourcentage d'évolution par rapport aux courses d'hier et d'aujourd'hui
    const evolutionPourcentage =
      totalCoursesHier === 0
        ? totalCourses > 0
          ? 100
          : 0
        : ((totalCourses - totalCoursesHier) / totalCoursesHier) * 100;

    // Récupérer le nombre de courses en cours
    const coursesEnCours = await this.prisma.transport.count({
      where: { status: "EN_COURSE" },
    });

    const vehiculeEnService = await this.prisma.vehicule.count({
      where: { statut: "EN_SERVICE" },
    })

    // Récupérer le nombre d'incidents non résolus aujourd'hui
    const incidentsNonResolusAujourdHui = await this.prisma.incident.count({
      where: {
        status: 'NON_RESOLU',
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
          lt: new Date(new Date().setHours(24, 0, 0, 0)), // Start of tomorrow
        },
      },
    });

    // Récupérer le nombre d'incidents non résolus hier
    const incidentsNonResolusHier = await this.prisma.incident.count({
      where: {
        status: 'NON_RESOLU',
        date: {
          gte: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)), // Start of yesterday
          lt: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
        },
      },
    });

    // Calculer le pourcentage d'évolution des incidents non résolus
    const evolutionIncidentsNonResolus =
      incidentsNonResolusHier === 0
        ? incidentsNonResolusAujourdHui > 0
          ? 100
          : 0
        : ((incidentsNonResolusAujourdHui - incidentsNonResolusHier) / incidentsNonResolusHier) * 100;

    // Récupérer le nombre de clients actifs aujourd'hui (ceux qui ont fait des courses aujourd'hui)
    const clientActif = await this.prisma.client.count({
      where : {
        statut: "ACTIF"
      }
    })

      const evolutionClientActif = async (): Promise<number> => {
      const totalClients = await this.prisma.client.count();
    

      if (totalClients === 0) return 0;
      const pourcentage = (clientActif / totalClients) * 100;
        return Math.round(pourcentage);
    };
    // Récupérer le nombre de chauffeurs actifs aujourd'hui (ceux qui ont fait des courses aujourd'hui)
    const chauffeurActif = await this.prisma.chauffeur.count(
    {where:{
      statutActivite: "ACTIF"
    }}
    )
      const evolutionChaufeurActif = async (): Promise<number> => {
      const totalChauffeur = await this.prisma.chauffeur.count();
    

      if (totalChauffeur === 0) return 0;
      const pourcentage = (chauffeurActif / totalChauffeur) * 100;
        return Math.round(pourcentage);
    };



  
    const revenuAujourdhui = await this.prisma.credit.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
          lt: new Date(new Date().setHours(24, 0, 0, 0)), // Start of tomorrow
        },
      },
    });

    const revenuHier = await this.prisma.credit.count({
      where: {
        createdAt: {
          gte: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)), // Start of yesterday
          lt: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
        },
      },
    });

    const evolutionRevenu = revenuHier === 0
      ? revenuAujourdhui > 0
        ? 100
        : 0
      : ((revenuAujourdhui - revenuHier) / revenuHier) * 100;

    // Courses par statut
    const statuses = ["EN_COURS", "TERMINEE", "ANNULEE", "PLANIFIEE"]; // Liste des statuts possibles
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

    // Revenus mensuels
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
    }
  }

  async getStatistiquesCourses(periode: string) {
    // Calculer la date de début en fonction de la période
    const dateDebut = new Date()
    switch (periode) {
      case "semaine":
        dateDebut.setDate(dateDebut.getDate() - 7)
        break
      case "mois":
        dateDebut.setMonth(dateDebut.getMonth() - 1)
        break
      case "trimestre":
        dateDebut.setMonth(dateDebut.getMonth() - 3)
        break
      case "annee":
        dateDebut.setFullYear(dateDebut.getFullYear() - 1)
        break
      default:
        dateDebut.setMonth(dateDebut.getMonth() - 1) // Par défaut: mois
    }

    // Récupérer les courses pour la période
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
    })

    // Calculer le nombre de courses par jour/semaine/mois selon la période
    const coursesParPeriode = {}
    courses.forEach((course) => {
      let key
      const date = new Date(course.startTime)

      switch (periode) {
        case "semaine":
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
          break
        case "mois":
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`
          break
        case "trimestre":
          key = `${date.getFullYear()}-${date.getMonth() + 1}`
          break
        case "annee":
          key = `${date.getFullYear()}-${Math.ceil((date.getMonth() + 1) / 3)}`
          break
        default:
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`
      }

      coursesParPeriode[key] = (coursesParPeriode[key] || 0) + 1
    })

    // Formater les données pour le graphique
    const statistiquesData = Object.keys(coursesParPeriode).map((key) => ({
      periode: key,
      courses: coursesParPeriode[key],
    }))

    return {
      totalCourses: courses.length,
      statistiquesData,
    }
  }

  async getStatistiquesRevenus(periode: string) {
    // Calculer la date de début en fonction de la période
    const dateDebut = new Date()
    switch (periode) {
      case "semaine":
        dateDebut.setDate(dateDebut.getDate() - 7)
        break
      case "mois":
        dateDebut.setMonth(dateDebut.getMonth() - 1)
        break
      case "trimestre":
        dateDebut.setMonth(dateDebut.getMonth() - 3)
        break
      case "annee":
        dateDebut.setFullYear(dateDebut.getFullYear() - 1)
        break
      default:
        dateDebut.setMonth(dateDebut.getMonth() - 1) // Par défaut: mois
    }

    // Récupérer les courses terminées pour la période
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
    })

    // Calculer les revenus par jour/semaine/mois selon la période
    const revenusParPeriode = {}
    courses.forEach((course) => {
      let key
      const date = new Date(course.startTime)

      switch (periode) {
        case "semaine":
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
          break
        case "mois":
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`
          break
        case "trimestre":
          key = `${date.getFullYear()}-${date.getMonth() + 1}`
          break
        case "annee":
          key = `${date.getFullYear()}-${Math.ceil((date.getMonth() + 1) / 3)}`
          break
        default:
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`
      }

      revenusParPeriode[key] = (revenusParPeriode[key] || 0) + (course.finalPrice || 0)
    })

    // Formater les données pour le graphique
    const statistiquesData = Object.keys(revenusParPeriode).map((key) => ({
      periode: key,
      revenus: revenusParPeriode[key],
    }))

    // Calculer les revenus totaux
    const revenuTotal = courses.reduce((total, course) => total + (course.finalPrice || 0), 0)

    return {
      revenuTotal,
      statistiquesData,
    }
  }

  async getStatistiquesIncidents(periode: string) {
    // Calculer la date de début en fonction de la période
    const dateDebut = new Date()
    switch (periode) {
      case "semaine":
        dateDebut.setDate(dateDebut.getDate() - 7)
        break
      case "mois":
        dateDebut.setMonth(dateDebut.getMonth() - 1)
        break
      case "trimestre":
        dateDebut.setMonth(dateDebut.getMonth() - 3)
        break
      case "annee":
        dateDebut.setFullYear(dateDebut.getFullYear() - 1)
        break
      default:
        dateDebut.setMonth(dateDebut.getMonth() - 1) // Par défaut: mois
    }

    // Récupérer les incidents pour la période
    const incidents = await this.prisma.incident.findMany({
      where: {
        date: {
          gte: dateDebut,
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Calculer le nombre d'incidents par type
    const incidentsParType = {}
    incidents.forEach((incident) => {
      incidentsParType[incident.type] = (incidentsParType[incident.type] || 0) + 1
    })

    // Calculer le nombre d'incidents par statut
    const incidentsParStatut = {}
    incidents.forEach((incident) => {
      incidentsParStatut[incident.status] = (incidentsParStatut[incident.status] || 0) + 1
    })

    // Calculer le nombre d'incidents par jour/semaine/mois selon la période
    const incidentsParPeriode = {}
    incidents.forEach((incident) => {
      let key
      const date = new Date(incident.date)

      switch (periode) {
        case "semaine":
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
          break
        case "mois":
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`
          break
        case "trimestre":
          key = `${date.getFullYear()}-${date.getMonth() + 1}`
          break
        case "annee":
          key = `${date.getFullYear()}-${Math.ceil((date.getMonth() + 1) / 3)}`
          break
        default:
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${Math.ceil(date.getDate() / 7)}`
      }

      incidentsParPeriode[key] = (incidentsParPeriode[key] || 0) + 1
    })

    // Formater les données pour le graphique
    const statistiquesData = Object.keys(incidentsParPeriode).map((key) => ({
      periode: key,
      incidents: incidentsParPeriode[key],
    }))

    return {
      totalIncidents: incidents.length,
      incidentsParType,
      incidentsParStatut,
      statistiquesData,
    }
  }
}

