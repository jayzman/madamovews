import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Assurez-vous d'avoir un PrismaService configuré
import { CreateLivraisonDto } from './dto/create-livraison.dto';
import { UpdateLivraisonDto } from './dto/update-livraison.dto';

@Injectable()
export class LivraisonService {
  constructor(private readonly prisma: PrismaService) {}

  // Créer une nouvelle livraison
  async create(createLivraisonDto: CreateLivraisonDto) {
    return this.prisma.livraisonColis.create({
      data: createLivraisonDto,
    });
  }

  // Récupérer toutes les livraisons
  async findAll() {
    return this.prisma.livraisonColis.findMany();
  }

  // Récupérer une livraison par ID
  async findOne(id: number) {
    const livraison = await this.prisma.livraisonColis.findUnique({
      where: { id },
    });
    if (!livraison) {
      throw new NotFoundException(`Livraison avec l'ID ${id} introuvable`);
    }
    return livraison;
  }

  // Mettre à jour une livraison
  async update(id: number, updateLivraisonDto: UpdateLivraisonDto) {
    return this.prisma.livraisonColis.update({
      where: { id },
      data: updateLivraisonDto,
    });
  }

  // Supprimer une livraison
  async remove(id: number) {
    return this.prisma.livraisonColis.delete({
      where: { id },
    });
  }
}