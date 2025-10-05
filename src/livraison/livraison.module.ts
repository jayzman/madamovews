import { Module } from '@nestjs/common';
import { LivraisonService } from './livraison.service';
import { LivraisonController } from './livraison.controller';

@Module({
  controllers: [LivraisonController],
  providers: [LivraisonService],
  exports: [LivraisonService], // Exporter le service si d'autres modules en ont besoin
})
export class LivraisonModule {}