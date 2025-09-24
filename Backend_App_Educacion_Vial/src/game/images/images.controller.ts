import { Controller, Get, Post, Delete, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { ImagesService } from './images.service';
import type { CreateImageDto } from './images.service';
import { AuthGuard } from '../../shared/auth/guards/auth.guard';
import { Child } from '../../shared/auth/decorators/child.decorator';
import type { CurrentChild } from '../../shared/auth/interface/current-child.interface';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(':childId')
  @UseGuards(AuthGuard)
  list(@Param('childId') childId: string, @Child() child: CurrentChild) {
    if (child.id !== childId) throw new ForbiddenException('Forbidden');
    return this.imagesService.list(childId);
  }

  @Post(':childId/test')
  @UseGuards(AuthGuard)
  testEndpoint(
    @Param('childId') childId: string,
    @Body() body: any,
    @Child() child: CurrentChild,
  ) {
    console.log('🧪 ENDPOINT DE PRUEBA recibió:', {
      childId,
      bodyType: typeof body,
      hasBody: !!body,
      bodyKeys: body ? Object.keys(body) : 'undefined',
      bodyContent: body,
      bodyString: JSON.stringify(body, null, 2),
      timestamp: new Date().toISOString()
    });

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
