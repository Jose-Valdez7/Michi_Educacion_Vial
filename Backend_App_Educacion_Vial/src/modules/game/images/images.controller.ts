import { Controller, Get, Post, Delete, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { ImagesService } from './images.service';
import type { CreateImageDto } from './images.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { Child } from '../../auth/decorators/child.decorator';
import type { CurrentChild } from '../../auth/interface/current-child.interface';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(':childId')
  @UseGuards(AuthGuard)
  list(@Param('childId') childId: string, @Child() child: CurrentChild) {
    if (child.id !== childId) throw new ForbiddenException('Forbidden');
    return this.imagesService.list(childId);
  }

  @Post(':childId')
  @UseGuards(AuthGuard)
  create(
    @Param('childId') childId: string,
    @Body() body: CreateImageDto,
    @Child() child: CurrentChild,
  ) {
    if (child.id !== childId) throw new ForbiddenException('Forbidden');
    return this.imagesService.create(childId, body);
  }

  @Post(':childId/test')
  @UseGuards(AuthGuard)
  testEndpoint(
    @Param('childId') childId: string,
    @Body() body: any,
    @Child() child: CurrentChild,
  ) {
    if (child.id !== childId) throw new ForbiddenException('Forbidden');

    return {
      success: true,
      message: 'Test endpoint working',
      received: body,
      timestamp: new Date().toISOString()
    };
  }

  @Delete(':childId/:imageId')
  @UseGuards(AuthGuard)
  remove(
    @Param('childId') childId: string,
    @Param('imageId') imageId: string,
    @Child() child: CurrentChild,
  ) {
    if (child.id !== childId) throw new ForbiddenException('Forbidden');
    return this.imagesService.remove(childId, imageId);
  }
}
