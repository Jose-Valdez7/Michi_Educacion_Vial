import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './modules/login/login.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProgressModule } from './modules/game/progress/progress.module';
import { AlbumModule } from './modules/game/album/album.module';
import { ImagesModule } from './modules/game/images/images.module';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [LoginModule, AuthModule, ProgressModule, AlbumModule, ImagesModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
