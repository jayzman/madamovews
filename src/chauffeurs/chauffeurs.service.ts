import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChauffeurDto, LoginDriverDto, RegisterChauffeurBySmsDto, SendCustomSmsDto } from "./dto/create-chauffeur.dto";
import { UpdateChauffeurDto } from "./dto/update-chauffeur.dto";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { TypeDocument } from "./dto/create-document.dto";
import * as fs from "fs";
import * as path from "path";
import { MailService } from "../email.service";
import { SmsService } from "../sms.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class ChauffeursService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: MailService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService
  ) {}

  async create(createChauffeurDto: CreateChauffeurDto) {
    const { vehiculeId, ...chauffeurData } = createChauffeurDto;

    const temporaryPassword = Math.random().toString(36).slice(-8);
    // Créer le chauffeur avec ou sans véhicule assigné
    // Envoyer l'email avec le mot de passe temporaire
    await this.emailService.sendEmail(
      {
        to: chauffeurData.email,
        subject: "Bienvenue sur MADAMOVE - Vos identifiants de connexion",
        template: path.join(
          process.cwd(),
          "src/templates/invitationDriver.hbs"
        ),
      },
      {
        name: chauffeurData.nom,
        email: chauffeurData.email,
        password: temporaryPassword,
        currentYear: new Date().getFullYear(),
      }
    );
    const chauffeur = await this.prisma.chauffeur.create({
      data: {
        ...chauffeurData,
        password: await bcrypt.hash(temporaryPassword, 10),
        vehicule: vehiculeId
          ? {
              connect: { id: vehiculeId },
            }
          : undefined,
        // Créer un crédit vide pour les chauffeurs indépendants
        ...(chauffeurData.statut === "INDEPENDANT" && {
          credits: {
            create: { solde: 0 },
          },
        }),
      },
      include: {
        vehicule: true,
        credits: true,
      },
    });

    // Remove password from response
    const { password, ...chauffeurWithoutPassword } = chauffeur;
    return chauffeurWithoutPassword;
  }

  async loginDriver(loginDto: LoginDriverDto) {
    const { email, password } = loginDto;

    // Find the driver by email
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { email },
    });

    if (!chauffeur) {
      throw new NotFoundException("Email ou mot de passe incorrect");
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, chauffeur.password);
    if (!isPasswordValid) {
      throw new NotFoundException("Email ou mot de passe incorrect");
    }

    // Generate a signed token
    const token = this.jwtService.sign(
      {
        sub: chauffeur.id,
        email: chauffeur.email,
      },
      {
        expiresIn: "7d",
        secret: process.env.JWT_SECRET_DRIVER || "madamove_driver",
      }
    );

    // Remove password from the response
    const { password: _, ...chauffeurWithoutPassword } = chauffeur;

    return {
      token,
      chauffeur: chauffeurWithoutPassword,
    };
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ChauffeurWhereUniqueInput;
    where?: Prisma.ChauffeurWhereInput;
    orderBy?: Prisma.ChauffeurOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.chauffeur.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        vehicule: true,
        credits: true,
      },
    });
  }

  async findOne(id: number) {
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id },
      include: {
        vehicule: true,
        credits: true,
        documents: true,
        Transport: true,
        courses: {
          take: 5,
          orderBy: { startTime: "desc" },
          include: {
            client: true,
          },
        },
      },
    });

    if (!chauffeur) {
      throw new NotFoundException(`Chauffeur avec l'ID ${id} non trouvé`);
    }

    return chauffeur;
  }

  async update(id: number, updateChauffeurDto: UpdateChauffeurDto) {
    const { vehiculeId, ...chauffeurData } = updateChauffeurDto;

    // Vérifier si le chauffeur existe
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id },
      include: { credits: true },
    });

    if (!chauffeur) {
      throw new NotFoundException(`Chauffeur avec l'ID ${id} non trouvé`);
    }

    // Mettre à jour le chauffeur
    return this.prisma.chauffeur.update({
      where: { id },
      data: {
        ...chauffeurData,
        vehicule:
          vehiculeId !== undefined
            ? vehiculeId
              ? { connect: { id: vehiculeId } }
              : { disconnect: true }
            : undefined,
        // Créer un crédit si le chauffeur devient indépendant et n'a pas encore de crédit
        ...(chauffeurData.statut === "INDEPENDANT" &&
          !chauffeur.credits && {
            credits: {
              create: { solde: 0 },
            },
          }),
      },
      include: {
        vehicule: true,
        credits: true,
      },
    });
  }

  async remove(id: number) {
    // Vérifier si le chauffeur existe
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id },
    });

    if (!chauffeur) {
      throw new NotFoundException(`Chauffeur avec l'ID ${id} non trouvé`);
    }

    // Supprimer le chauffeur
    return this.prisma.chauffeur.delete({
      where: { id },
    });
  }

  async rechargerCredit(chauffeurId: number, montant: number) {
    // Vérifier si le chauffeur existe et est indépendant
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
      include: { credits: true },
    });

    if (!chauffeur) {
      throw new NotFoundException(
        `Chauffeur avec l'ID ${chauffeurId} non trouvé`
      );
    }

    if (chauffeur.statut !== "INDEPENDANT") {
      throw new NotFoundException(
        `Seuls les chauffeurs indépendants peuvent avoir des crédits`
      );
    }

    // Mettre à jour ou créer le crédit
    if (chauffeur.credits) {
      return this.prisma.credit.update({
        where: { chauffeurId },
        data: { solde: { increment: montant } },
      });
    } else {
      return this.prisma.credit.create({
        data: {
          solde: montant,
          chauffeur: { connect: { id: chauffeurId } },
        },
      });
    }
  }

  async getDocuments(chauffeurId: number) {
    // Vérifier si le chauffeur existe
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
    });

    if (!chauffeur) {
      throw new NotFoundException(
        `Chauffeur avec l'ID ${chauffeurId} non trouvé`
      );
    }

    // Récupérer les documents
    return this.prisma.document.findMany({
      where: { chauffeurId },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getDocument(chauffeurId: number, documentId: number) {
    try {
      console.log(
        `Service - Récupération du document ${documentId} pour le chauffeur ${chauffeurId}`
      );

      // Vérifier si le chauffeur existe
      const chauffeur = await this.prisma.chauffeur.findUnique({
        where: { id: chauffeurId },
      });

      if (!chauffeur) {
        console.error(`Chauffeur avec l'ID ${chauffeurId} non trouvé`);
        throw new NotFoundException(
          `Chauffeur avec l'ID ${chauffeurId} non trouvé`
        );
      }

      // Vérifier si le document existe et appartient au chauffeur
      const document = await this.prisma.document.findFirst({
        where: {
          id: documentId,
          chauffeurId,
        },
      });

      console.log("Document trouvé:", document);

      if (!document) {
        console.error(
          `Document avec l'ID ${documentId} non trouvé pour ce chauffeur`
        );
        throw new NotFoundException(
          `Document avec l'ID ${documentId} non trouvé pour ce chauffeur`
        );
      }

      return document;
    } catch (error) {
      console.error("Erreur service getDocument:", error);
      throw error;
    }
  }

  async addDocument(chauffeurId: number, createDocumentDto: CreateDocumentDto) {
    try {
      console.log("Service - Ajout document:", {
        chauffeurId,
        createDocumentDto,
      });

      // Vérifier si le chauffeur existe
      const chauffeur = await this.prisma.chauffeur.findUnique({
        where: { id: chauffeurId },
      });

      if (!chauffeur) {
        throw new NotFoundException(
          `Chauffeur avec l'ID ${chauffeurId} non trouvé`
        );
      }

      // Créer le document
      const document = await this.prisma.document.create({
        data: {
          nom: createDocumentDto.nom,
          type: createDocumentDto.type as TypeDocument,
          fichier: createDocumentDto.fichier,
          mimeType: createDocumentDto.mimeType,
          taille: createDocumentDto.taille,
          dateExpiration: createDocumentDto.dateExpiration
            ? new Date(createDocumentDto.dateExpiration)
            : null,
          status: "EN_ATTENTE", // Statut par défaut
          chauffeur: { connect: { id: chauffeurId } },
        },
      });

      console.log("Document créé:", document);
      return document;
    } catch (error) {
      console.error("Erreur service addDocument:", error);
      throw error;
    }
  }

  async updateDocument(
    chauffeurId: number,
    documentId: number,
    updateDocumentDto: Partial<CreateDocumentDto>
  ) {
    try {
      console.log("Service - Mise à jour document:", {
        chauffeurId,
        documentId,
        updateDocumentDto,
      });

      // Vérifier si le chauffeur existe
      const chauffeur = await this.prisma.chauffeur.findUnique({
        where: { id: chauffeurId },
      });

      if (!chauffeur) {
        throw new NotFoundException(
          `Chauffeur avec l'ID ${chauffeurId} non trouvé`
        );
      }

      // Vérifier si le document existe et appartient au chauffeur
      const document = await this.prisma.document.findFirst({
        where: {
          id: documentId,
          chauffeurId,
        },
      });

      if (!document) {
        throw new NotFoundException(
          `Document avec l'ID ${documentId} non trouvé pour ce chauffeur`
        );
      }

      // Mettre à jour le document
      const updatedDocument = await this.prisma.document.update({
        where: { id: documentId },
        data: {
          nom: updateDocumentDto.nom,
          type: updateDocumentDto.type as TypeDocument,
          dateExpiration: updateDocumentDto.dateExpiration
            ? new Date(updateDocumentDto.dateExpiration)
            : undefined,
        },
      });

      console.log("Document mis à jour:", updatedDocument);
      return updatedDocument;
    } catch (error) {
      console.error("Erreur service updateDocument:", error);
      throw error;
    }
  }

  async updateDocumentWithFile(
    chauffeurId: number,
    documentId: number,
    updateDocumentDto: Partial<CreateDocumentDto>
  ) {
    try {
      console.log("Service - Mise à jour document avec fichier:", {
        chauffeurId,
        documentId,
        updateDocumentDto,
      });

      // Vérifier si le chauffeur existe
      const chauffeur = await this.prisma.chauffeur.findUnique({
        where: { id: chauffeurId },
      });

      if (!chauffeur) {
        throw new NotFoundException(
          `Chauffeur avec l'ID ${chauffeurId} non trouvé`
        );
      }

      // Vérifier si le document existe et appartient au chauffeur
      const document = await this.prisma.document.findFirst({
        where: {
          id: documentId,
          chauffeurId,
        },
      });

      if (!document) {
        throw new NotFoundException(
          `Document avec l'ID ${documentId} non trouvé pour ce chauffeur`
        );
      }

      // Supprimer l'ancien fichier si nécessaire
      if (
        document.fichier &&
        fs.existsSync(document.fichier) &&
        updateDocumentDto.fichier
      ) {
        try {
          fs.unlinkSync(document.fichier);
          console.log(`Ancien fichier supprimé: ${document.fichier}`);
        } catch (error) {
          console.error(
            `Erreur lors de la suppression de l'ancien fichier: ${error.message}`
          );
        }
      }

      // Mettre à jour le document avec le nouveau fichier
      const updatedDocument = await this.prisma.document.update({
        where: { id: documentId },
        data: {
          nom: updateDocumentDto.nom,
          type: updateDocumentDto.type as TypeDocument,
          fichier: updateDocumentDto.fichier,
          mimeType: updateDocumentDto.mimeType,
          taille: updateDocumentDto.taille,
          dateExpiration: updateDocumentDto.dateExpiration
            ? new Date(updateDocumentDto.dateExpiration)
            : undefined,
          updatedAt: new Date(), // Forcer la mise à jour de la date
        },
      });

      console.log("Document mis à jour avec nouveau fichier:", updatedDocument);
      return updatedDocument;
    } catch (error) {
      console.error("Erreur service updateDocumentWithFile:", error);
      throw error;
    }
  }

  async removeDocument(chauffeurId: number, documentId: number) {
    // Vérifier si le chauffeur existe
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
    });

    if (!chauffeur) {
      throw new NotFoundException(
        `Chauffeur avec l'ID ${chauffeurId} non trouvé`
      );
    }

    // Vérifier si le document existe et appartient au chauffeur
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        chauffeurId,
      },
    });

    if (!document) {
      throw new NotFoundException(
        `Document avec l'ID ${documentId} non trouvé pour ce chauffeur`
      );
    }

    // Supprimer le document
    return this.prisma.document.delete({
      where: { id: documentId },
    });
  }

  async updateDocumentStatus(
    chauffeurId: number,
    documentId: number,
    status: string
  ) {
    // Vérifier si le chauffeur existe
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
    });

    if (!chauffeur) {
      throw new NotFoundException(
        `Chauffeur avec l'ID ${chauffeurId} non trouvé`
      );
    }

    // Vérifier si le document existe et appartient au chauffeur
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        chauffeurId,
      },
    });

    if (!document) {
      throw new NotFoundException(
        `Document avec l'ID ${documentId} non trouvé pour ce chauffeur`
      );
    }

    // Mettre à jour le statut du document
    return this.prisma.document.update({
      where: { id: documentId },
      data: { status },
    });
  }

  async getCourses(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CourseWhereInput;
    orderBy?: Prisma.CourseOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;

    // Vérifier si le chauffeur existe
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: where.chauffeurId as number },
    });

    if (!chauffeur) {
      throw new NotFoundException(
        `Chauffeur avec l'ID ${where.chauffeurId} non trouvé`
      );
    }

    // Récupérer les courses
    return this.prisma.course.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        client: true,
      },
    });
  }

  async getIncidents(params: {
    skip?: number;
    take?: number;
    where?: Prisma.IncidentWhereInput;
    orderBy?: Prisma.IncidentOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;

    // Vérifier si le chauffeur existe
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: where.chauffeurId as number },
    });

    if (!chauffeur) {
      throw new NotFoundException(
        `Chauffeur avec l'ID ${where.chauffeurId} non trouvé`
      );
    }

    // Récupérer les incidents
    return this.prisma.incident.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        course: true,
      },
    });
  }

  async getPerformance(chauffeurId: number, periode: string) {
    // Vérifier si le chauffeur existe
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { id: chauffeurId },
    });

    if (!chauffeur) {
      throw new NotFoundException(
        `Chauffeur avec l'ID ${chauffeurId} non trouvé`
      );
    }

    // Calculer la date de début en fonction de la période
    const maintenant = new Date();
    let dateDebut = new Date();

    switch (periode) {
      case "today":
        // Début de la journée courante
        dateDebut.setHours(0, 0, 0, 0);
        break;
      case "semaine":
        // Il y a 7 jours à partir d'aujourd'hui
        dateDebut.setDate(maintenant.getDate() - 7);
        dateDebut.setHours(0, 0, 0, 0);
        break;
      case "mois":
        // Il y a 1 mois à partir d'aujourd'hui
        dateDebut = new Date(
          maintenant.getFullYear(),
          maintenant.getMonth() - 1,
          maintenant.getDate()
        );
        dateDebut.setHours(0, 0, 0, 0);
        break;
      case "trimestre":
        // Il y a 3 mois à partir d'aujourd'hui
        dateDebut = new Date(
          maintenant.getFullYear(),
          maintenant.getMonth() - 3,
          maintenant.getDate()
        );
        dateDebut.setHours(0, 0, 0, 0);
        break;
      case "annee":
        // Il y a 1 an à partir d'aujourd'hui
        dateDebut = new Date(
          maintenant.getFullYear() - 1,
          maintenant.getMonth(),
          maintenant.getDate()
        );
        dateDebut.setHours(0, 0, 0, 0);
        break;
      default:
        // Par défaut: mois
        dateDebut = new Date(
          maintenant.getFullYear(),
          maintenant.getMonth() - 1,
          maintenant.getDate()
        );
        dateDebut.setHours(0, 0, 0, 0);
    }

    // Récupérer les courses terminées pour la période
    const courses = await this.prisma.course.findMany({
      where: {
        chauffeurId,
        status: "TERMINEE",
        startTime: {
          gte: dateDebut,
          lte: maintenant, // Ajouter une limite supérieure
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Calculer les revenus totaux
    const revenuTotal = courses.reduce(
      (total, course) => total + (course.finalPrice || 0),
      0
    );

    // Calculer le nombre de courses par période
    const coursesParPeriode = {};
    const revenusParPeriode = {};

    courses.forEach((course) => {
      let key;
      const date = new Date(course.startTime);

      switch (periode) {
        case "today":
          // Groupé par heure (format plus lisible)
          key = `${date.getHours().toString().padStart(2, "0")}:00`;
          break;
        case "semaine":
          // Groupé par jour avec nom du jour
          const options: Intl.DateTimeFormatOptions = {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
          };
          key = date.toLocaleDateString("fr-FR", options);
          break;
        case "mois":
          // Groupé par semaine du mois
          const premierJourMois = new Date(
            date.getFullYear(),
            date.getMonth(),
            1
          );
          const jourDansLeMois = date.getDate();
          const semaineNumero = Math.ceil(
            (jourDansLeMois + premierJourMois.getDay()) / 7
          );
          key = `Semaine ${semaineNumero}`;
          break;
        case "trimestre":
          // Groupé par mois
          const moisNoms = [
            "Jan",
            "Fév",
            "Mar",
            "Avr",
            "Mai",
            "Jun",
            "Jul",
            "Aoû",
            "Sep",
            "Oct",
            "Nov",
            "Déc",
          ];
          key = `${moisNoms[date.getMonth()]} ${date.getFullYear()}`;
          break;
        case "annee":
          // Groupé par trimestre
          const trimestre = Math.ceil((date.getMonth() + 1) / 3);
          key = `T${trimestre} ${date.getFullYear()}`;
          break;
        default:
          // Par défaut: semaines du mois
          const premierJourMoisDef = new Date(
            date.getFullYear(),
            date.getMonth(),
            1
          );
          const jourDansLeMoisDef = date.getDate();
          const semaineNumeroDef = Math.ceil(
            (jourDansLeMoisDef + premierJourMoisDef.getDay()) / 7
          );
          key = `Semaine ${semaineNumeroDef}`;
      }

      coursesParPeriode[key] = (coursesParPeriode[key] || 0) + 1;
      revenusParPeriode[key] =
        (revenusParPeriode[key] || 0) + (course.finalPrice || 0);
    });

    // Formater les données pour le graphique (trié chronologiquement)
    const performanceData = Object.keys(coursesParPeriode)
      .sort() // Tri basique, vous pourriez vouloir un tri plus sophistiqué selon le format
      .map((key) => ({
        periode: key,
        courses: coursesParPeriode[key],
        revenus: revenusParPeriode[key],
      }));

    return {
      chauffeurId,
      periode,
      dateDebut: dateDebut.toISOString(),
      dateFin: maintenant.toISOString(),
      nbCourses: courses.length,
      revenuTotal,
      performanceData,
    };
  }

  async findAvailable(params: { skip?: number; take?: number; orderBy?: any }) {
    // Récupérer les chauffeurs qui ne sont pas affectés à un véhicule
    const chauffeurs = await this.prisma.chauffeur.findMany({
      where: {
        vehicule: null, // Le chauffeur n'a pas de véhicule associé
        statutActivite: "ACTIF", // Optionnel: filtrer uniquement les chauffeurs actifs
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        photoUrl: true,
        evaluation: true,
      },
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
    });

    return {
      data: chauffeurs,
      count: await this.prisma.chauffeur.count({
        where: {
          vehicule: null,
          statutActivite: "ACTIF",
        },
      }),
    };
  }

  async forgotPassword(email: string) {
    // Vérifier si le chauffeur existe
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { email },
    });

    if (!chauffeur) {
      throw new NotFoundException("Aucun chauffeur trouvé avec cet email");
    }

    // Générer un code de réinitialisation
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 30 * 60000); // 30 minutes

    // Mettre à jour le chauffeur avec le code de réinitialisation
    await this.prisma.chauffeur.update({
      where: { email },
      data: {
        resetCode,
        resetCodeExpiry,
      },
    });

    // Envoyer l'email avec le code de réinitialisation
    await this.emailService.sendEmail(
      {
        to: email,
        subject: "Réinitialisation de votre mot de passe",
        template: path.join(process.cwd(), "src/templates/resetPassword.hbs"),
      },
      {
        clientName: `${chauffeur.nom} ${chauffeur.prenom}`,
        resetCode,
        year: new Date().getFullYear(),
      }
    );

    return {
      message: "Un code de réinitialisation a été envoyé à votre adresse email",
    };
  }

  async resetPassword(email: string, resetCode: string, newPassword: string) {
    console.log(
      `Service - Réinitialisation du mot de passe pour l'email: ${email}, code: ${resetCode}`
    );
    // Vérifier si le chauffeur existe et le code est valide
    const chauffeur = await this.prisma.chauffeur.findFirst({
      where: {
        email,
        resetCode,
        resetCodeExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!chauffeur) {
      throw new NotFoundException(
        "Code de réinitialisation invalide ou expiré"
      );
    }

    // Mettre à jour le mot de passe et supprimer le code de réinitialisation
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.chauffeur.update({
      where: { id: chauffeur.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null,
      },
    });

    return { message: "Votre mot de passe a été réinitialisé avec succès" };
  }

  async registerBySms(registerDto: RegisterChauffeurBySmsDto) {
    const { vehiculeId, telephone, ...chauffeurData } = registerDto;

    // Vérifier si un chauffeur avec ce numéro existe déjà
    const existingChauffeur = await this.prisma.chauffeur.findUnique({
      where: { telephone },
    });

    if (existingChauffeur) {
      throw new Error('Un chauffeur avec ce numéro de téléphone existe déjà.');
    }

    // Créer le chauffeur sans mot de passe (authentification par SMS uniquement)
    const chauffeur = await this.prisma.chauffeur.create({
      data: {
        ...chauffeurData,
        telephone,
        password: null, // Pas de mot de passe pour l'authentification SMS
        vehicule: vehiculeId
          ? {
              connect: { id: vehiculeId },
            }
          : undefined,
        // Créer un crédit vide pour les chauffeurs indépendants
        ...(chauffeurData.statut === "INDEPENDANT" && {
          credits: {
            create: { solde: 0 },
          },
        }),
      },
      include: {
        vehicule: true,
        credits: true,
      },
    });

    // Envoyer un SMS de bienvenue
    const welcomeMessage = `Bienvenue ${chauffeurData.nom} ! Votre compte chauffeur MADAMOVE a été créé avec succès. Vous pouvez maintenant vous connecter en utilisant votre numéro de téléphone.`;
    await this.smsService.sendSms(telephone, welcomeMessage);

    return chauffeur;
  }

  async sendOtpForLogin(telephone: string) {
    // Vérifier si le chauffeur existe
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { telephone },
    });

    if (!chauffeur) {
      throw new NotFoundException('Aucun chauffeur trouvé avec ce numéro de téléphone');
    }

    // Envoyer l'OTP
    const otp = await this.smsService.sendOtp(telephone);
    
    return {
      message: 'Code OTP envoyé avec succès',
      telephone,
    };
  }

  async loginBySms(telephone: string, otp: string) {
    // Vérifier l'OTP
    const isOtpValid = await this.smsService.verifyOtp(telephone, otp);
    
    if (!isOtpValid) {
      throw new NotFoundException('Code OTP invalide ou expiré');
    }

    // Trouver le chauffeur par numéro de téléphone
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { telephone },
      include: {
        vehicule: true,
        credits: true,
      },
    });

    if (!chauffeur) {
      throw new NotFoundException('Chauffeur non trouvé');
    }

    // Générer le token JWT
    const token = this.jwtService.sign(
      {
        sub: chauffeur.id,
        telephone: chauffeur.telephone,
      },
      {
        expiresIn: "7d",
        secret: process.env.JWT_SECRET_DRIVER || "madamove_driver",
      }
    );

    // Supprimer le mot de passe de la réponse
    const { password, ...chauffeurWithoutPassword } = chauffeur;

    return {
      token,
      chauffeur: chauffeurWithoutPassword,
    };
  }

  async resendOtp(telephone: string) {
    // Vérifier si le chauffeur existe
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { telephone },
    });

    if (!chauffeur) {
      throw new NotFoundException('Aucun chauffeur trouvé avec ce numéro de téléphone');
    }

    // Renvoyer l'OTP
    await this.smsService.resendOtp(telephone);
    
    return {
      message: 'Nouveau code OTP envoyé avec succès',
      telephone,
    };
  }

  async sendCustomSms(sendSmsDto: SendCustomSmsDto) {
    return await this.smsService.sendCustomSms(sendSmsDto);
  }
}
