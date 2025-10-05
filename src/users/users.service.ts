import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateUserDto, InviteUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import * as bcrypt from "bcrypt"
import { MailService } from "../email.service"
import * as path from "path"

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private emailService: MailService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, nom, prenom, role } = createUserDto

    // Vérifier si l'utilisateur existe déjà
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    })

    if (userExists) {
      throw new ConflictException("Un utilisateur avec cet email existe déjà")
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        role,
      },
    })

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...result } = user
    return result
  }

  async inviteUser(createUserDto: InviteUserDto) {
    const { email, nom, prenom, role } = createUserDto;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new ConflictException("Un utilisateur avec cet email existe déjà");
    }

    // Générer un mot de passe provisoire
    const temporaryPassword = Math.random().toString(36).slice(-8);

    // Hacher le mot de passe provisoire
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        role,
      },
    });

    // Envoyer un email d'invitation avec le mot de passe provisoire
    await this.emailService.sendMailVerification({
      to: email,
      subject: 'Email confirmation',
      template: path.join(
        process.cwd(),
        'src/templates/emailInvitation.hbs',
      ),
    }, {
      link: temporaryPassword
    })
    // Remplacez cette partie par votre service d'envoi d'email
    console.log(`Envoyer un email à ${email} avec le mot de passe provisoire: ${temporaryPassword}`);

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...result } = user;
    return result;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`)
    }

    return user
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { email, password, nom, prenom, role } = updateUserDto

    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`)
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email },
      })

      if (userWithEmail) {
        throw new ConflictException("Cet email est déjà utilisé par un autre utilisateur")
      }
    }

    // Préparer les données à mettre à jour
    const data: any = {}
    if (email) data.email = email
    if (nom) data.nom = nom
    if (prenom) data.prenom = prenom
    if (role) data.role = role

    // Hacher le nouveau mot de passe si fourni
    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return updatedUser
  }

  async remove(id: number) {
    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`)
    }

    // Supprimer l'utilisateur
    await this.prisma.user.delete({
      where: { id },
    })

    return { message: `Utilisateur avec l'ID ${id} supprimé avec succès` }
  }
}

