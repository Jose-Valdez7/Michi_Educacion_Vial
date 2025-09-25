import { Controller, Get, Put, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { AlbumService } from './album.service';
import type { AlbumUpsertDto } from './album.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { Child } from '../../auth/decorators/child.decorator';
import type { CurrentChild } from '../../auth/interface/current-child.interface';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get(':childId')
  @UseGuards(AuthGuard)
  get(@Param('childId') childId: string, @Child() child: CurrentChild) {
    if (child.id !== childId) throw new ForbiddenException('Forbidden');
    return this.albumService.getByChildId(childId);
  }

  @Put(':childId')
  @UseGuards(AuthGuard)
  upsert(
    @Param('childId') childId: string,
    @Body() body: AlbumUpsertDto,
    @Child() child: CurrentChild,
  ) {
    if (child.id !== childId) throw new ForbiddenException('Forbidden');
    return this.albumService.upsert(childId, body);
  }
}
