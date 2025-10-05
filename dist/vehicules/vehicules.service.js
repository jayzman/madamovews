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
exports.VehiculesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const multer_1 = require("multer");
const path_1 = require("path");
let VehiculesService = class VehiculesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.uploadPath = 'uploads/photos/vehicles';
    }
    async create(createVehiculeDto) {
        return this.prisma.vehicule.create({
            data: createVehiculeDto,
        });
    }
    async findAll(params) {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.vehicule.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include: {
                chauffeurs: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                    },
                },
            },
        });
    }
    async findByCategory(categorie) {
        return this.prisma.vehicule.findMany({
            where: {
                categorie,
                statut: 'DISPONIBLE'
            },
            include: {
                chauffeurs: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                    },
                },
            },
        });
    }
    async getByMarque(marque) {
        return this.prisma.vehicule.findMany({
            where: {
                marque,
                statut: 'DISPONIBLE'
            },
            include: {
                chauffeurs: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                    },
                },
                incidents: {
                    orderBy: { date: "desc" },
                    take: 5,
                },
            },
        });
    }
    async getAvailableCategories() {
        const vehicles = await this.prisma.vehicule.findMany({
            where: {
                statut: 'DISPONIBLE'
            },
            select: {
                categorie: true
            },
            distinct: ['categorie']
        });
        return vehicles.map(vehicle => vehicle.categorie);
    }
    async findOne(id) {
        const vehicule = await this.prisma.vehicule.findUnique({
            where: { id },
            include: {
                chauffeurs: true,
                maintenances: {
                    orderBy: { date: "desc" },
                },
                incidents: {
                    orderBy: { date: "desc" },
                    take: 5,
                },
            },
        });
        if (!vehicule) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        return vehicule;
    }
    async update(id, updateVehiculeDto) {
        const vehicule = await this.prisma.vehicule.findUnique({
            where: { id },
        });
        if (!vehicule) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        return this.prisma.vehicule.update({
            where: { id },
            data: updateVehiculeDto,
        });
    }
    async remove(id) {
        const vehicule = await this.prisma.vehicule.findUnique({
            where: { id },
        });
        if (!vehicule) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        return this.prisma.vehicule.delete({
            where: { id },
        });
    }
    async addMaintenance(id, createMaintenanceDto) {
        const vehicule = await this.prisma.vehicule.findUnique({
            where: { id },
        });
        if (!vehicule) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        return this.prisma.maintenance.create({
            data: {
                ...createMaintenanceDto,
                vehicule: {
                    connect: { id },
                },
            },
        });
    }
    async getMaintenances(id) {
        const vehicule = await this.prisma.vehicule.findUnique({
            where: { id },
        });
        if (!vehicule) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        return this.prisma.maintenance.findMany({
            where: { vehiculeId: id },
            orderBy: { date: "desc" },
        });
    }
    async getAvailableVehicles() {
        return this.prisma.vehicule.findMany({
            where: {
                statut: 'DISPONIBLE',
                chauffeurs: {
                    some: {
                        statutActivite: 'ACTIF'
                    }
                }
            },
            include: {
                chauffeurs: {
                    where: {
                        statutActivite: 'ACTIF'
                    },
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        telephone: true,
                    }
                }
            }
        });
    }
    async getAvailableVehicleTypes() {
        const vehicles = await this.prisma.vehicule.findMany({
            where: {
                statut: 'DISPONIBLE'
            },
            select: {
                type: true
            },
            distinct: ['type']
        });
        return vehicles;
    }
    getMulterOptions() {
        return {
            storage: (0, multer_1.diskStorage)({
                destination: this.uploadPath,
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = (0, path_1.extname)(file.originalname);
                    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
                    callback(null, filename);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                    return callback(new common_1.BadRequestException('Seuls les fichiers image sont autorisés'), false);
                }
                callback(null, true);
            },
        };
    }
    getFileUrl(filename) {
        return `${this.uploadPath}/${filename}`;
    }
    async getVehiclePhotos(id) {
        const vehicule = await this.prisma.vehicule.findUnique({
            where: { id },
            select: { photos: true }
        });
        if (!vehicule) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        const photoUrls = vehicule.photos.map(photo => `uploads/photos/vehicle/${photo}`);
        return photoUrls;
    }
    async getVehiclePhoto(id, filename) {
        const vehicule = await this.prisma.vehicule.findUnique({
            where: { id },
            select: { photos: true }
        });
        if (!vehicule) {
            throw new common_1.NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
        }
        if (!vehicule.photos.includes(filename)) {
            throw new common_1.NotFoundException(`Image ${filename} non trouvée pour le véhicule ${id}`);
        }
        return (0, path_1.join)(process.cwd(), 'uploads', 'photos', 'vehicle', filename);
    }
};
exports.VehiculesService = VehiculesService;
exports.VehiculesService = VehiculesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiculesService);
//# sourceMappingURL=vehicules.service.js.map