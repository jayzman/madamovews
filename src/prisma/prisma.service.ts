import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common"
import { PrismaClient } from "@prisma/client"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ["query", "info", "warn", "error"],
    })
  }

  async onModuleInit() {
    await this.$connect()
    console.log("Connexion à la base de données établie avec succès")
  }

  async onModuleDestroy() {
    await this.$disconnect()
    console.log("Déconnexion de la base de données")
  }
}

