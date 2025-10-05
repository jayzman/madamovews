import { BadRequestException, Injectable, NotFoundException, StreamableFile } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateVehiculeDto } from "./dto/create-vehicule.dto"
import { UpdateVehiculeDto } from "./dto/update-vehicule.dto"
import { CreateMaintenanceDto } from "./dto/create-maintenance.dto"
import { CategoryVehicule, Prisma } from "@prisma/client"
import { diskStorage } from "multer"
import { extname, join } from "path"
import { createReadStream } from 'fs'

@Injectable()
export class VehiculesService {
  constructor(private prisma: PrismaService) { }

  private readonly uploadPath = 'uploads/photos/vehicles';

  async create(createVehiculeDto: CreateVehiculeDto) {
    return this.prisma.vehicule.create({
      data: createVehiculeDto,
    })
  }

  async findAll(params: {
    skip?: number
    take?: number
    cursor?: Prisma.VehiculeWhereUniqueInput
    where?: Prisma.VehiculeWhereInput
    orderBy?: Prisma.VehiculeOrderByWithRelationInput
  }) {
    const { skip, take, cursor, where, orderBy } = params
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
    })
  }

  async findByCategory(categorie: CategoryVehicule) {
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
    })
  }

  async getByMarque(marque: string) {
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
    })
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

  async findOne(id: number) {
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
    })

    if (!vehicule) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`)
    }

    return vehicule
  }

  async update(id: number, updateVehiculeDto: UpdateVehiculeDto) {
    // Vérifier si le véhicule existe
    const vehicule = await this.prisma.vehicule.findUnique({
      where: { id },
    })

    if (!vehicule) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`)
    }

    // Mettre à jour le véhicule
    return this.prisma.vehicule.update({
      where: { id },
      data: updateVehiculeDto,
    })
  }

  async remove(id: number) {
    // Vérifier si le véhicule existe
    const vehicule = await this.prisma.vehicule.findUnique({
      where: { id },
    })

    if (!vehicule) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`)
    }

    // Supprimer le véhicule
    return this.prisma.vehicule.delete({
      where: { id },
    })
  }

  async addMaintenance(id: number, createMaintenanceDto: CreateMaintenanceDto) {
    // Vérifier si le véhicule existe
    const vehicule = await this.prisma.vehicule.findUnique({
      where: { id },
    })

    if (!vehicule) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`)
    }

    // Ajouter la maintenance
    return this.prisma.maintenance.create({
      data: {
        ...createMaintenanceDto,
        vehicule: {
          connect: { id },
        },
      },
    })
  }

  async getMaintenances(id: number) {
    // Vérifier si le véhicule existe
    const vehicule = await this.prisma.vehicule.findUnique({
      where: { id },
    })

    if (!vehicule) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`)
    }

    // Récupérer les maintenances
    return this.prisma.maintenance.findMany({
      where: { vehiculeId: id },
      orderBy: { date: "desc" },
    })
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
    })
  }

  async getAvailableVehicleTypes() {
    // Récupérer uniquement les types distincts des véhicules disponibles
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
      storage: diskStorage({
        destination: this.uploadPath,
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new BadRequestException('Seuls les fichiers image sont autorisés'), false);
        }
        callback(null, true);
      },
    };
  }
  getFileUrl(filename: string): string {
    return `${this.uploadPath}/${filename}`;
  }
  async getVehiclePhotos(id: number) {
    const vehicule = await this.prisma.vehicule.findUnique({
      where: { id },
      select: { photos: true }
    });

    if (!vehicule) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
    }

    const photoUrls = vehicule.photos.map(photo => `uploads/photos/vehicle/${photo}`);
    return photoUrls;
  }

  async getVehiclePhoto(id: number, filename: string) {
    const vehicule = await this.prisma.vehicule.findUnique({
      where: { id },
      select: { photos: true }
    });

    if (!vehicule) {
      throw new NotFoundException(`Véhicule avec l'ID ${id} non trouvé`);
    }

    if (!vehicule.photos.includes(filename)) {
      throw new NotFoundException(`Image ${filename} non trouvée pour le véhicule ${id}`);
    }

    return join(process.cwd(), 'uploads', 'photos', 'vehicle', filename);
  }
}

