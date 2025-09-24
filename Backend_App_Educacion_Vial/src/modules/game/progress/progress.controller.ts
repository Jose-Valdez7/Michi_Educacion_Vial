import { Controller, Get, Param, Put, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { ProgressService } from './progress.service';
import type { ProgressUpsertDto } from './progress.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { Child } from '../../auth/decorators/child.decorator';
import type { CurrentChild } from '../../auth/interface/current-child.interface';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get(':childId')
  @UseGuards(AuthGuard)
  get(@Param('childId') childId: string, @Child() child: CurrentChild) {
    if (child.id !== childId) throw new ForbiddenException('Forbidden');
    return this.progressService.getByChildId(childId);
  }

  @Put(':childId')
  @UseGuards(AuthGuard)
  upsert(
    @Param('childId') childId: string,
    @Body() body: ProgressUpsertDto,
    @Child() child: CurrentChild,
  ) {
    if (child.id !== childId) throw new ForbiddenException('Forbidden');
    return this.progressService.upsert(childId, body);
  }
}
