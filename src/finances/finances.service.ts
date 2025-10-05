import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class FinancesService {
  constructor(private prisma: PrismaService) {}

  async getResumeFinancier(periode: string) {
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
      include: {
        chauffeur: true,
      },
    })

    // Calculer les revenus totaux
    const revenuTotal = courses.reduce((total, course) => total + (course.finalPrice || 0), 0)

    // Calculer les revenus par type de chauffeur (salarié vs indépendant)
    const revenusSalaries = courses
      .filter((course) => course.chauffeur.statut === "SALARIE")
      .reduce((total, course) => total + (course.finalPrice || 0), 0)

    const revenusIndependants = courses
      .filter((course) => course.chauffeur.statut === "INDEPENDANT")
      .reduce((total, course) => total + (course.finalPrice || 0), 0)

    // Calculer les dépenses (simulées pour cet exemple)
    // Dans une application réelle, vous auriez une table de dépenses
    const depensesCarburant = revenuTotal * 0.1 // 10% des revenus
    const depensesMaintenance = revenuTotal * 0.05 // 5% des revenus
    const depensesSalaires = revenuTotal * 0.3 // 30% des revenus
    const depensesTotal = depensesCarburant + depensesMaintenance + depensesSalaires

    // Calculer le profit
    const profit = revenuTotal - depensesTotal

    // Calculer les revenus par jour/semaine/mois selon la période
    const revenusParPeriode = {}
    const depensesParPeriode = {}
    const profitParPeriode = {}

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

      const revenu = course.finalPrice || 0
      revenusParPeriode[key] = (revenusParPeriode[key] || 0) + revenu

      // Simuler les dépenses pour chaque période
      const depense = revenu * 0.45 // 45% des revenus
      depensesParPeriode[key] = (depensesParPeriode[key] || 0) + depense

      // Calculer le profit pour chaque période
      profitParPeriode[key] = (profitParPeriode[key] || 0) + (revenu - depense)
    })

    // Formater les données pour le graphique
    const financesData = Object.keys(revenusParPeriode).map((key) => ({
      periode: key,
      revenus: revenusParPeriode[key],
      depenses: depensesParPeriode[key],
      profit: profitParPeriode[key],
    }))

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
    }
  }

  async getHistoriqueActivites(params: {
    skip?: number
    take?: number
    type?: string
    dateDebut?: Date
    dateFin?: Date
  }) {
    const { skip, take, type, dateDebut, dateFin } = params

    // Construire les filtres pour les courses
    const whereClause: any = {}

    if (dateDebut || dateFin) {
      whereClause.startTime = {}

      if (dateDebut) {
        whereClause.startTime.gte = dateDebut
      }

      if (dateFin) {
        whereClause.startTime.lte = dateFin
      }
    }

    if (type) {
      whereClause.status = type
    }

    // Récupérer les courses avec les filtres
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
    })

    // Transformer les courses en activités
    const activites = courses.map((course) => ({
      id: course.id,
      date: course.startTime,
      type: "Course",
      description: `Course #${course.id} ${course.status}`,
      chauffeur: `${course.chauffeur.prenom} ${course.chauffeur.nom}`,
      passager: `${course.client.prenom} ${course.client.nom}`,
      montant: course.finalPrice ? `${course.finalPrice}€` : "-",
    }))

    return activites
  }
}

