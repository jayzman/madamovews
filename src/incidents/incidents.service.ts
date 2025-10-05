import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateIncidentDto } from "./dto/create-incident.dto"
import { UpdateIncidentDto } from "./dto/update-incident.dto"
import { Prisma } from "@prisma/client"

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

  async create(createIncidentDto: CreateIncidentDto) {
    const { chauffeurId, vehiculeId, courseId, ...incidentData } = createIncidentDto

    return this.prisma.incident.create({
      data: {
        ...incidentData,
        chauffeur: chauffeurId ? { connect: { id: chauffeurId } } : undefined,
        vehicule: vehiculeId ? { connect: { id: vehiculeId } } : undefined,
        course: courseId ? { connect: { id: courseId } } : undefined,
      },
      include: {
        chauffeur: true,
        vehicule: true,
        course: true,
      },
    })
  }

  async findAll(params: {
    skip?: number
    take?: number
    cursor?: Prisma.IncidentWhereUniqueInput
    where?: Prisma.IncidentWhereInput
    orderBy?: Prisma.IncidentOrderByWithRelationInput
  }) {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.incident.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        chauffeur: true,
        vehicule: true,
        course: true,
      },
    })
  }

  async findOne(id: number) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        chauffeur: true,
        vehicule: true,
        course: true,
      },
    })

    if (!incident) {
      throw new NotFoundException(`Incident avec l'ID ${id} non trouvé`)
    }

    return incident
  }

  async update(id: number, updateIncidentDto: UpdateIncidentDto) {
    const { chauffeurId, vehiculeId, courseId, ...incidentData } = updateIncidentDto

    // Vérifier si l'incident existe
    const incident = await this.prisma.incident.findUnique({
      where: { id },
    })

    if (!incident) {
      throw new NotFoundException(`Incident avec l'ID ${id} non trouvé`)
    }

    // Mettre à jour l'incident
    return this.prisma.incident.update({
      where: { id },
      data: {
        ...incidentData,
        chauffeur:
          chauffeurId !== undefined
            ? chauffeurId
              ? { connect: { id: chauffeurId } }
              : { disconnect: true }
            : undefined,
        vehicule:
          vehiculeId !== undefined ? (vehiculeId ? { connect: { id: vehiculeId } } : { disconnect: true }) : undefined,
        course: courseId !== undefined ? (courseId ? { connect: { id: courseId } } : { disconnect: true }) : undefined,
      },
      include: {
        chauffeur: true,
        vehicule: true,
        course: true,
      },
    })
  }

  async remove(id: number) {
    // Vérifier si l'incident existe
    const incident = await this.prisma.incident.findUnique({
      where: { id },
    })

    if (!incident) {
      throw new NotFoundException(`Incident avec l'ID ${id} non trouvé`)
    }

    // Supprimer l'incident
    return this.prisma.incident.delete({
      where: { id },
    })
  }
}

