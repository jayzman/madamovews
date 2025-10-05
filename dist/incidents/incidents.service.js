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
exports.IncidentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IncidentsService = class IncidentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createIncidentDto) {
        const { chauffeurId, vehiculeId, courseId, ...incidentData } = createIncidentDto;
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
        });
    }
    async findAll(params) {
        const { skip, take, cursor, where, orderBy } = params;
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
        });
    }
    async findOne(id) {
        const incident = await this.prisma.incident.findUnique({
            where: { id },
            include: {
                chauffeur: true,
                vehicule: true,
                course: true,
            },
        });
        if (!incident) {
            throw new common_1.NotFoundException(`Incident avec l'ID ${id} non trouvé`);
        }
        return incident;
    }
    async update(id, updateIncidentDto) {
        const { chauffeurId, vehiculeId, courseId, ...incidentData } = updateIncidentDto;
        const incident = await this.prisma.incident.findUnique({
            where: { id },
        });
        if (!incident) {
            throw new common_1.NotFoundException(`Incident avec l'ID ${id} non trouvé`);
        }
        return this.prisma.incident.update({
            where: { id },
            data: {
                ...incidentData,
                chauffeur: chauffeurId !== undefined
                    ? chauffeurId
                        ? { connect: { id: chauffeurId } }
                        : { disconnect: true }
                    : undefined,
                vehicule: vehiculeId !== undefined ? (vehiculeId ? { connect: { id: vehiculeId } } : { disconnect: true }) : undefined,
                course: courseId !== undefined ? (courseId ? { connect: { id: courseId } } : { disconnect: true }) : undefined,
            },
            include: {
                chauffeur: true,
                vehicule: true,
                course: true,
            },
        });
    }
    async remove(id) {
        const incident = await this.prisma.incident.findUnique({
            where: { id },
        });
        if (!incident) {
            throw new common_1.NotFoundException(`Incident avec l'ID ${id} non trouvé`);
        }
        return this.prisma.incident.delete({
            where: { id },
        });
    }
};
exports.IncidentsService = IncidentsService;
exports.IncidentsService = IncidentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map