import { Module } from "@nestjs/common"
import { StatistiquesService } from "./statistiques.service"
import { StatistiquesController } from "./statistiques.controller"

@Module({
  controllers: [StatistiquesController],
  providers: [StatistiquesService],
  exports: [StatistiquesService],
})
export class StatistiquesModule {}

