import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateClientDto,
  ForgotPasswordDto,
  RegisterClientDto,
  ResetPasswordDto,
  SendEmailDto,
  SendSmsDto,
  RegisterClientBySmsDto,
  SendCustomSmsClientDto,
} from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { Prisma } from "@prisma/client";
import * as fs from "fs";
import * as bcrypt from "bcrypt";
import { MailService } from "../email.service";
import * as path from "path";
import { SmsService } from "../sms.service";
import { JwtService } from "@nestjs/jwt";
import { CreateFavoriteDestinationDto } from "./dto/create-favorite-destination.dto";

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private emailService: MailService,
    private smsService: SmsService,
    private readonly jwtService: JwtService
  ) {}

  async create(createClientDto: CreateClientDto) {
    try {
      return this.prisma.client.create({
        data: createClientDto,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async registerClient(data: RegisterClientDto) {
    const { email, password, ...details } = data;

    // Check if a client with the same email already exists
    const existingClient = await this.prisma.client.findUnique({
      where: { email },
    });

    if (existingClient) {
      throw new Error("Un client avec cet email existe déjà.");
    }

    // Hash the password before saving (assuming bcrypt is used)
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Generate a random OTP (One-Time Password)
    const validationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Create the new client with OTP and set as not verified
    const newClient = await this.prisma.client.create({
      data: {
        email,
        password: hashedPassword,
        validationCode,
        verified: false,
        ...details,
      },
    });

    // Send confirmation email with OTP
    await this.emailService.sendEmail(
      {
        to: email,
        subject: "Confirmation de votre inscription",
        template: path.join(
          process.cwd(),
          "src/templates/confirmRegistration.hbs"
        ),
      },
      {
        clientName: `${details.nom} ${details.prenom}`,
        validationCode,
        year: new Date().getFullYear(),
      }
    );

    return newClient;
  }

  async validateOtp(email: string, otp: string) {
    // Find the client by email
    const client = await this.prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'email ${email} non trouvé`);
    }

    // Check if the OTP matches
    if (client.validationCode !== otp) {
      throw new Error("Le code de validation est incorrect.");
    }

    // Verify the client account
    const updatedClient = await this.prisma.client.update({
      where: { email },
      data: {
        verified: true,
        validationCode: null, // Clear the OTP after successful verification
      },
    });

    // Generate JWT token
    const token = this.jwtService.sign(
      {
        sub: updatedClient.id,
        email: updatedClient.email,
      },
      {
        expiresIn: "7d",
        secret: process.env.JWT_SECRET_CLIENT || "madamove_client",
      }
    );

    // Remove sensitive data
    const { password, validationCode, ...clientData } = updatedClient;

    // Return token and client details
    return { token, client: clientData };
  }

  async resendConfirmationEmail(email: string) {
    // Vérifier si le client existe
    const client = await this.prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'email ${email} non trouvé`);
    }

    // Vérifier si le client est déjà vérifié
    if (client.verified) {
      throw new NotAcceptableException("Le compte client est déjà vérifié.");
    }

    // Générer un nouveau code de validation
    const validationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Mettre à jour le client avec le nouveau code
    await this.prisma.client.update({
      where: { email },
      data: {
        validationCode,
      },
    });

    // Envoyer le nouvel email de confirmation
    await this.emailService.sendEmail(
      {
        to: email,
        subject: "Confirmation de votre inscription",
        template: path.join(
          process.cwd(),
          "src/templates/confirmRegistration.hbs"
        ),
      },
      {
        clientName: `${client.nom} ${client.prenom}`,
        validationCode,
        year: new Date().getFullYear(),
      }
    );

    return {
      message:
        "Un nouveau code de validation a été envoyé à votre adresse email.",
    };
  }

  async login(email: string, password: string) {
    // Find the client by email
    const client = await this.prisma.client.findUnique({
      where: { email },
      include: {
        _count: {
          select: { Transport: true },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'email ${email} non trouvé`);
    }

    // Check if the client is verified
    if (!client.verified) {
      throw new NotAcceptableException(
        "Le compte client n'est pas encore vérifié."
      );
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, client.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Email ou mot de passe incorrect.");
    }

    // Generate a signed token
    const token = this.jwtService.sign(
      {
        sub: client.id,
        email: client.email,
      },
      {
        expiresIn: "7d",
        secret: process.env.JWT_SECRET_CLIENT || "madamove_client",
      }
    );

    // Return the client details (you might want to exclude sensitive data like password)
    const { password: _, validationCode, ...clientData } = client;
    return { token, client: clientData };
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ClientWhereUniqueInput;
    where?: Prisma.ClientWhereInput;
    orderBy?: Prisma.ClientOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.client.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(id: number) {
    if (id === undefined) {
      throw new NotFoundException("Client non trouvé");
    }
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        Transport: {
          take: 10,
          include: {
            chauffeur: true,
          },
        },
        _count: {
          select: { Transport: true },
        },
        locations: true,
      },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'ID ${id} non trouvé`);
    }

    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    // Vérifier si le client existe
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'ID ${id} non trouvé`);
    }

    // Mettre à jour le client
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async updateProfileUrl(id: number, profileUrl: string) {
    // Vérifier si le client existe
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'ID ${id} non trouvé`);
    }

    if (client.profileUrl !== null) {
      const oldAvatarPath = path.join(
        "./uploads/photos/clients",
        path.basename(client.profileUrl)
      );
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Mettre à jour l'URL du profil
    return this.prisma.client.update({
      where: { id },
      data: { profileUrl: `uploads/photos/clients/${profileUrl}` },
    });
  }

  async remove(id: number) {
    // Vérifier si le client existe
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'ID ${id} non trouvé`);
    }

    // Supprimer le client
    return this.prisma.client.delete({
      where: { id },
    });
  }

  async count() {
    return this.prisma.client.count();
  }

  async sendEmail(data: SendEmailDto) {
    const { email, message } = data;
    const client = await this.prisma.client.findUnique({
      where: {
        email,
      },
    });
    if (!client) {
      throw new NotFoundException(`Client avec l'ID ${email} non trouvé`);
    }

    await this.emailService.sendEmail(
      {
        to: email,
        subject: "Message",
        template: path.join(process.cwd(), "src/templates/messageClient.hbs"),
      },
      {
        message,
        clientName: `${client.nom} ${client.prenom}`,
        year: new Date().getFullYear(),
      }
    );
  }

  async sendSms(data: SendSmsDto) {
    const testPhoneNumber = "whatsapp:+33774665378";
    const testMessage = "Hano ny tay eee";
    const { phone, message } = data;

    try {
      await this.smsService.sendSms(phone, message);
      console.log("Test SMS sent successfully.");
    } catch (error) {
      console.error("Failed to send test SMS:", error);
    }
  }

  async forgotPassword(data: ForgotPasswordDto) {
    const { email } = data;

    // Vérifier si le client existe
    const client = await this.prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'email ${email} non trouvé`);
    }

    // Générer un code de réinitialisation à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Définir l'expiration à 30 minutes
    const resetExpires = new Date();
    resetExpires.setMinutes(resetExpires.getMinutes() + 30);

    // Mettre à jour le client avec le code de réinitialisation
    await this.prisma.client.update({
      where: { email },
      data: {
        resetCode,
        resetCodeExpires: resetExpires,
      },
    });

    // Envoyer un email avec le code de réinitialisation
    await this.emailService.sendEmail(
      {
        to: email,
        subject: "Réinitialisation de votre mot de passe",
        template: path.join(process.cwd(), "src/templates/resetPassword.hbs"),
      },
      {
        clientName: `${client.nom} ${client.prenom}`,
        resetCode,
        year: new Date().getFullYear(),
      }
    );

    return {
      message:
        "Un code de réinitialisation a été envoyé à votre adresse email.",
    };
  }

  async resetPassword(data: ResetPasswordDto) {
    const { email, resetCode, password } = data;

    // Vérifier si le client existe
    const client = await this.prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'email ${email} non trouvé`);
    }

    // Vérifier si le code de réinitialisation est correct et non expiré
    if (client.resetCode !== resetCode) {
      throw new UnauthorizedException(
        "Le code de réinitialisation est incorrect."
      );
    }

    if (!client.resetCodeExpires || new Date() > client.resetCodeExpires) {
      throw new UnauthorizedException("Le code de réinitialisation a expiré.");
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour le client avec le nouveau mot de passe et réinitialiser le code
    await this.prisma.client.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null,
      },
    });

    return { message: "Votre mot de passe a été réinitialisé avec succès." };
  }

  async checkExistence(email?: string, telephone?: string) {
    if (!email && !telephone) {
      throw new NotAcceptableException(
        "Veuillez fournir un email ou un numéro de téléphone à vérifier."
      );
    }

    const filters: any = { OR: [] };

    if (email) {
      filters.OR.push({ email });
    }

    if (telephone) {
      filters.OR.push({ telephone });
    }

    const client = await this.prisma.client.findFirst({
      where: filters,
      select: {
        id: true,
        email: true,
        telephone: true,
      },
    });

    return {
      exists: !!client,
      field: client ? (client.email === email ? "email" : "telephone") : null,
      data: client || null,
    };
  }

  async addFavoriteDestination(
    clientId: number,
    data: CreateFavoriteDestinationDto
  ) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException("Client non trouvé");
    }

    return this.prisma.favoriteDestination.create({
      data: {
        ...data,
        client: {
          connect: { id: clientId },
        },
      },
    });
  }

  async getFavoriteDestinations(clientId: number) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        favorites: true,
      },
    });

    if (!client) {
      throw new NotFoundException("Client non trouvé");
    }

    return client.favorites;
  }

  async updateFavoriteDestination(
    clientId: number,
    favoriteId: number,
    data: Prisma.FavoriteDestinationUpdateInput
  ) {
    const favorite = await this.prisma.favoriteDestination.findFirst({
      where: {
        id: favoriteId,
        clientId: clientId,
      },
    });

    if (!favorite) {
      throw new NotFoundException("Destination favorite non trouvée");
    }

    return this.prisma.favoriteDestination.update({
      where: { id: favoriteId },
      data,
    });
  }

  async deleteFavoriteDestination(clientId: number, favoriteId: number) {
    const favorite = await this.prisma.favoriteDestination.findFirst({
      where: {
        id: favoriteId,
        clientId: clientId,
      },
    });

    if (!favorite) {
      throw new NotFoundException("Destination favorite non trouvée");
    }

    return this.prisma.favoriteDestination.delete({
      where: { id: favoriteId },
    });
  }

  async registerBySms(registerDto: RegisterClientBySmsDto) {
    const { telephone, ...clientData } = registerDto;

    // Vérifier si un client avec ce numéro existe déjà
    const existingClient = await this.prisma.client.findUnique({
      where: { telephone },
    });

    if (existingClient) {
      throw new Error("Un client avec ce numéro de téléphone existe déjà.");
    }

    // Créer le client sans mot de passe (authentification par SMS uniquement)
    const client = await this.prisma.client.create({
      data: {
        ...clientData,
        telephone,
        password: null, // Pas de mot de passe pour l'authentification SMS
        verified: true, // Directement vérifié car l'inscription se fait via SMS
      },
    });

    // Envoyer un SMS de bienvenue
    const welcomeMessage = `Bienvenue ${clientData.nom} ! Votre compte client MADAMOVE a été créé avec succès. Vous pouvez maintenant vous connecter en utilisant votre numéro de téléphone.`;
    await this.smsService.sendSms(telephone, welcomeMessage);

    return client;
  }

  async sendOtpForLogin(telephone: string) {
    // Vérifier si le client existe
    const client = await this.prisma.client.findUnique({
      where: { telephone },
    });

    if (!client) {
      throw new NotFoundException(
        "Aucun client trouvé avec ce numéro de téléphone"
      );
    }

    // Envoyer l'OTP
    const otp = await this.smsService.sendOtp(telephone);

    return {
      message: "Code OTP envoyé avec succès",
      telephone,
    };
  }

  async loginBySms(telephone: string, otp: string) {
    // Vérifier l'OTP
    const isOtpValid = await this.smsService.verifyOtp(telephone, otp);

    if (!isOtpValid) {
      throw new NotFoundException("Code OTP invalide ou expiré");
    }

    // Trouver le client par numéro de téléphone
    const client = await this.prisma.client.findUnique({
      where: { telephone },
    });

    if (!client) {
      throw new NotFoundException("Client non trouvé");
    }

    // Générer le token JWT
    const token = this.jwtService.sign(
      {
        sub: client.id,
        telephone: client.telephone,
      },
      {
        expiresIn: "7d",
        secret: process.env.JWT_SECRET_CLIENT || "madamove_client",
      }
    );

    // Supprimer les données sensibles de la réponse
    const { password, validationCode, ...clientWithoutSensitiveData } = client;

    return {
      token,
      client: clientWithoutSensitiveData,
    };
  }

  async resendOtpClient(telephone: string) {
    // Vérifier si le client existe
    const client = await this.prisma.client.findUnique({
      where: { telephone },
    });

    if (!client) {
      throw new NotFoundException(
        "Aucun client trouvé avec ce numéro de téléphone"
      );
    }

    // Renvoyer l'OTP
    await this.smsService.resendOtp(telephone);

    return {
      message: "Nouveau code OTP envoyé avec succès",
      telephone,
    };
  }

  async sendCustomSmsClient(sendSmsDto: SendCustomSmsClientDto) {
    return await this.smsService.sendCustomSms(sendSmsDto);
  }
}
