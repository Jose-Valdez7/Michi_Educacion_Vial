import { Controller, Get, Post, Delete, Param, Body, UseGuards, ForbiddenException, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
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
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Param('childId') childId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Child() child: CurrentChild,
  ) {
    if (child.id !== childId) throw new ForbiddenException('Forbidden');
    
    // 🔧 Extraer campos del FormData
    const parseJsonField = (value: any) => {
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    };

    const dto: CreateImageDto = {
      title: req.body.title,
      taskId: req.body.taskId,
      paths: parseJsonField(req.body.paths),
      colors: parseJsonField(req.body.colors),
      baseImage: req.body.baseImage,
      description: req.body.description,
      category: req.body.category,
      type: req.body.type,
      level: req.body.level,
      status: req.body.status,
      metadata: parseJsonField(req.body.metadata) ?? undefined,
      imageMimeType: req.body.imageMimeType,
      imageFileName: req.body.imageFileName,
      imageDataUrl: req.body.imageDataUrl,
      imageSvgMarkup: req.body.imageSvgMarkup,
    };

    if (file) {
      const mimeType = file.mimetype || dto.imageMimeType || 'image/png';
      const fileName = file.originalname || dto.imageFileName || `captured-image.${mimeType === 'image/svg+xml' ? 'svg' : 'png'}`;
      const base64 = file.buffer ? file.buffer.toString('base64') : undefined;

      if (base64) {
        dto.imageMimeType = mimeType;
        dto.imageFileName = fileName;
        dto.imageDataUrl = `data:${mimeType};base64,${base64}`;

        if (mimeType === 'image/svg+xml' && !dto.imageSvgMarkup) {
          dto.imageSvgMarkup = Buffer.from(base64, 'base64').toString('utf8');
        }
      }
    }
    
    return this.imagesService.create(childId, dto);
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
