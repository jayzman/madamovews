import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateCourseDto } from "./dto/create-course.dto"
import { UpdateCourseDto } from "./dto/update-course.dto"
import { Prisma } from "@prisma/client"
import { NotificationsService } from "../notifications/notifications.service"
import { TypeNotification } from "../notifications/dto/create-notification.dto"

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const course = await this.prisma.course.create({
      data: createCourseDto,
      include: {
        chauffeur: true,
        client: true,
      },
    });

    // Notifier le client de la création de la course
    if (course.clientId) {
      await this.notificationsService.create({
        titre: "Nouvelle course créée",
        message: `Votre course de ${course.startLocation} à ${course.endLocation} a été créée avec succès.`,
        type: TypeNotification.COURSE,
        clientId: course.clientId,
        donnees: JSON.stringify({
          courseId: course.id,
          status: course.status,
          startLocation: course.startLocation,
          endLocation: course.endLocation,
        }),
      });
    }

    // Notifier le chauffeur s'il est assigné à la course
    if (course.chauffeurId) {
      await this.notificationsService.create({
        titre: "Nouvelle course assignée",
        message: `Une nouvelle course de ${course.startLocation} à ${course.endLocation} vous a été assignée.`,
        type: TypeNotification.COURSE,
        chauffeurId: course.chauffeurId,
        donnees: JSON.stringify({
          courseId: course.id,
          status: course.status,
          startLocation: course.startLocation,
          endLocation: course.endLocation,
        }),
      });
    }

    return course;
  }

  async findAll(params: {
    skip?: number
    take?: number
    cursor?: Prisma.CourseWhereUniqueInput
    where?: Prisma.CourseWhereInput
    orderBy?: Prisma.CourseOrderByWithRelationInput
  }) {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.course.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        chauffeur: true,
        client: true,
      },
    })
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        chauffeur: true,
        client: true,
        incidents: true,
      },
    })

    if (!course) {
      throw new NotFoundException(`Course avec l'ID ${id} non trouvée`)
    }

    return course
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    // Vérifier si la course existe
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        chauffeur: true,
        client: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course avec l'ID ${id} non trouvée`);
    }

    // Si le statut a été modifié, envoyer une notification
    if (updateCourseDto.status && updateCourseDto.status !== course.status) {
      const nouveauStatut = updateCourseDto.status;
      
      // Notification pour le client
      if (course.clientId) {
        await this.notificationsService.create({
          titre: `Course ${this.getStatusLabel(nouveauStatut)}`,
          message: `Votre course de ${course.startLocation} à ${course.endLocation} est maintenant ${this.getStatusLabel(nouveauStatut).toLowerCase()}.`,
          type: TypeNotification.COURSE,
          clientId: course.clientId,
          donnees: JSON.stringify({
            courseId: course.id,
            status: nouveauStatut,
          }),
        });
      }

      // Notification pour le chauffeur
      if (course.chauffeurId) {
        await this.notificationsService.create({
          titre: `Course ${this.getStatusLabel(nouveauStatut)}`,
          message: `La course de ${course.startLocation} à ${course.endLocation} est maintenant ${this.getStatusLabel(nouveauStatut).toLowerCase()}.`,
          type: TypeNotification.COURSE,
          chauffeurId: course.chauffeurId,
          donnees: JSON.stringify({
            courseId: course.id,
            status: nouveauStatut,
          }),
        });
      }
    }

    // Mettre à jour la course
    const updatedCourse = await this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
      include: {
        chauffeur: true,
        client: true,
      },
    });

    return updatedCourse;
  }

  async remove(id: number) {
    // Vérifier si la course existe
    const course = await this.prisma.course.findUnique({
      where: { id },
    })

    if (!course) {
      throw new NotFoundException(`Course avec l'ID ${id} non trouvée`)
    }

    // Supprimer la course
    return this.prisma.course.delete({
      where: { id },
    })
  }

  async terminerCourse(id: number, finalPrice: number) {
    // Vérifier si la course existe et est en cours
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        chauffeur: true,
        client: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course avec l'ID ${id} non trouvée`);
    }

    if (course.status !== "EN_COURS") {
      throw new NotFoundException(`La course avec l'ID ${id} n'est pas en cours`);
    }

    // Mettre à jour la course
    const terminatedCourse = await this.prisma.course.update({
      where: { id },
      data: {
        status: "TERMINEE",
        endTime: new Date(),
        finalPrice,
      },
      include: {
        chauffeur: true,
        client: true,
      },
    });

    // Notification pour le client
    if (course.clientId) {
      await this.notificationsService.create({
        titre: "Course terminée",
        message: `Votre course de ${course.startLocation} à ${course.endLocation} est terminée. Prix final: ${finalPrice}€`,
        type: TypeNotification.COURSE,
        clientId: course.clientId,
        donnees: JSON.stringify({
          courseId: course.id,
          status: "TERMINEE",
          finalPrice,
        }),
      });

      // Notification de paiement si le prix final est différent du prix estimé
      if (finalPrice !== course.estimatedPrice) {
        await this.notificationsService.create({
          titre: "Mise à jour du paiement",
          message: `Le prix final de votre course est de ${finalPrice}€ (au lieu de ${course.estimatedPrice}€ estimés).`,
          type: TypeNotification.PAIEMENT,
          clientId: course.clientId,
          donnees: JSON.stringify({
            courseId: course.id,
            estimatedPrice: course.estimatedPrice,
            finalPrice,
          }),
        });
      }
    }

    // Notification pour le chauffeur
    if (course.chauffeurId) {
      await this.notificationsService.create({
        titre: "Course terminée",
        message: `La course de ${course.startLocation} à ${course.endLocation} est terminée. Prix final: ${finalPrice}€`,
        type: TypeNotification.COURSE,
        chauffeurId: course.chauffeurId,
        donnees: JSON.stringify({
          courseId: course.id,
          status: "TERMINEE",
          finalPrice,
        }),
      });
    }

    return terminatedCourse;
  }

  async annulerCourse(id: number) {
    // Vérifier si la course existe et n'est pas déjà terminée ou annulée
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        chauffeur: true,
        client: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course avec l'ID ${id} non trouvée`);
    }

    if (course.status === "TERMINEE" || course.status === "ANNULEE") {
      throw new NotFoundException(`La course avec l'ID ${id} est déjà terminée ou annulée`);
    }

    // Mettre à jour la course
    const cancelledCourse = await this.prisma.course.update({
      where: { id },
      data: {
        status: "ANNULEE",
      },
      include: {
        chauffeur: true,
        client: true,
      },
    });

    // Notification pour le client
    if (course.clientId) {
      await this.notificationsService.create({
        titre: "Course annulée",
        message: `Votre course de ${course.startLocation} à ${course.endLocation} a été annulée.`,
        type: TypeNotification.COURSE,
        clientId: course.clientId,
        donnees: JSON.stringify({
          courseId: course.id,
          status: "ANNULEE",
        }),
      });
    }

    // Notification pour le chauffeur
    if (course.chauffeurId) {
      await this.notificationsService.create({
        titre: "Course annulée",
        message: `La course de ${course.startLocation} à ${course.endLocation} a été annulée.`,
        type: TypeNotification.COURSE,
        chauffeurId: course.chauffeurId,
        donnees: JSON.stringify({
          courseId: course.id,
          status: "ANNULEE",
        }),
      });
    }

    return cancelledCourse;
  }

  async count(): Promise<number> {
    console.log('Appel de la méthode count dans le service');
    return this.prisma.course.count();
  }

  /**
   * Obtient un libellé pour un statut
   */
  private getStatusLabel(status: string): string {
    const statusMap = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'ANNULEE': 'Annulée',
    };

    return statusMap[status] || status;
  }
}

