import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MvolaAuthService } from './mvola-auth.service';
import { MvolaModule } from './mvola.module'; // si MvolaAuthModule <-> MvolaModule circulaire

@Module({
  imports: [
    HttpModule,
    forwardRef(() => MvolaModule), // 🔁 casse la boucle circulaire
  ],
  providers: [MvolaAuthService],
  exports: [MvolaAuthService],
})
export class MvolaAuthModule {}
