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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const create_notification_dto_1 = require("../notifications/dto/create-notification.dto");
let CoursesService = class CoursesService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(createCourseDto) {
        const course = await this.prisma.course.create({
            data: createCourseDto,
            include: {
                chauffeur: true,
                client: true,
            },
        });
        if (course.clientId) {
            await this.notificationsService.create({
                titre: "Nouvelle course créée",
                message: `Votre course de ${course.startLocation} à ${course.endLocation} a été créée avec succès.`,
                type: create_notification_dto_1.TypeNotification.COURSE,
                clientId: course.clientId,
                donnees: JSON.stringify({
                    courseId: course.id,
                    status: course.status,
                    startLocation: course.startLocation,
                    endLocation: course.endLocation,
                }),
            });
        }
        if (course.chauffeurId) {
            await this.notificationsService.create({
                titre: "Nouvelle course assignée",
                message: `Une nouvelle course de ${course.startLocation} à ${course.endLocation} vous a été assignée.`,
                type: create_notification_dto_1.TypeNotification.COURSE,
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
    async findAll(params) {
        const { skip, take, cursor, where, orderBy } = params;
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
        });
    }
    async findOne(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                chauffeur: true,
                client: true,
                incidents: true,
            },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course avec l'ID ${id} non trouvée`);
        }
        return course;
    }
    async update(id, updateCourseDto) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                chauffeur: true,
                client: true,
            },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course avec l'ID ${id} non trouvée`);
        }
        if (updateCourseDto.status && updateCourseDto.status !== course.status) {
            const nouveauStatut = updateCourseDto.status;
            if (course.clientId) {
                await this.notificationsService.create({
                    titre: `Course ${this.getStatusLabel(nouveauStatut)}`,
                    message: `Votre course de ${course.startLocation} à ${course.endLocation} est maintenant ${this.getStatusLabel(nouveauStatut).toLowerCase()}.`,
                    type: create_notification_dto_1.TypeNotification.COURSE,
                    clientId: course.clientId,
                    donnees: JSON.stringify({
                        courseId: course.id,
                        status: nouveauStatut,
                    }),
                });
            }
            if (course.chauffeurId) {
                await this.notificationsService.create({
                    titre: `Course ${this.getStatusLabel(nouveauStatut)}`,
                    message: `La course de ${course.startLocation} à ${course.endLocation} est maintenant ${this.getStatusLabel(nouveauStatut).toLowerCase()}.`,
                    type: create_notification_dto_1.TypeNotification.COURSE,
                    chauffeurId: course.chauffeurId,
                    donnees: JSON.stringify({
                        courseId: course.id,
                        status: nouveauStatut,
                    }),
                });
            }
        }
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
    async remove(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course avec l'ID ${id} non trouvée`);
        }
        return this.prisma.course.delete({
            where: { id },
        });
    }
    async terminerCourse(id, finalPrice) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                chauffeur: true,
                client: true,
            },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course avec l'ID ${id} non trouvée`);
        }
        if (course.status !== "EN_COURS") {
            throw new common_1.NotFoundException(`La course avec l'ID ${id} n'est pas en cours`);
        }
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
        if (course.clientId) {
            await this.notificationsService.create({
                titre: "Course terminée",
                message: `Votre course de ${course.startLocation} à ${course.endLocation} est terminée. Prix final: ${finalPrice}€`,
                type: create_notification_dto_1.TypeNotification.COURSE,
                clientId: course.clientId,
                donnees: JSON.stringify({
                    courseId: course.id,
                    status: "TERMINEE",
                    finalPrice,
                }),
            });
            if (finalPrice !== course.estimatedPrice) {
                await this.notificationsService.create({
                    titre: "Mise à jour du paiement",
                    message: `Le prix final de votre course est de ${finalPrice}€ (au lieu de ${course.estimatedPrice}€ estimés).`,
                    type: create_notification_dto_1.TypeNotification.PAIEMENT,
                    clientId: course.clientId,
                    donnees: JSON.stringify({
                        courseId: course.id,
                        estimatedPrice: course.estimatedPrice,
                        finalPrice,
                    }),
                });
            }
        }
        if (course.chauffeurId) {
            await this.notificationsService.create({
                titre: "Course terminée",
                message: `La course de ${course.startLocation} à ${course.endLocation} est terminée. Prix final: ${finalPrice}€`,
                type: create_notification_dto_1.TypeNotification.COURSE,
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
    async annulerCourse(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                chauffeur: true,
                client: true,
            },
        });
        if (!course) {
            throw new common_1.NotFoundException(`Course avec l'ID ${id} non trouvée`);
        }
        if (course.status === "TERMINEE" || course.status === "ANNULEE") {
            throw new common_1.NotFoundException(`La course avec l'ID ${id} est déjà terminée ou annulée`);
        }
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
        if (course.clientId) {
            await this.notificationsService.create({
                titre: "Course annulée",
                message: `Votre course de ${course.startLocation} à ${course.endLocation} a été annulée.`,
                type: create_notification_dto_1.TypeNotification.COURSE,
                clientId: course.clientId,
                donnees: JSON.stringify({
                    courseId: course.id,
                    status: "ANNULEE",
                }),
            });
        }
        if (course.chauffeurId) {
            await this.notificationsService.create({
                titre: "Course annulée",
                message: `La course de ${course.startLocation} à ${course.endLocation} a été annulée.`,
                type: create_notification_dto_1.TypeNotification.COURSE,
                chauffeurId: course.chauffeurId,
                donnees: JSON.stringify({
                    courseId: course.id,
                    status: "ANNULEE",
                }),
            });
        }
        return cancelledCourse;
    }
    async count() {
        console.log('Appel de la méthode count dans le service');
        return this.prisma.course.count();
    }
    getStatusLabel(status) {
        const statusMap = {
            'EN_ATTENTE': 'En attente',
            'EN_COURS': 'En cours',
            'TERMINEE': 'Terminée',
            'ANNULEE': 'Annulée',
        };
        return statusMap[status] || status;
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map