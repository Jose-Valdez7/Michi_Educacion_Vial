import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './child/login/login.module';
import { AuthModule } from './shared/auth/auth.module';
import { ProgressModule } from './game/progress/progress.module';
import { AlbumModule } from './game/album/album.module';
import { ImagesModule } from './game/images/images.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [LoginModule, AuthModule, ProgressModule, AlbumModule, ImagesModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
