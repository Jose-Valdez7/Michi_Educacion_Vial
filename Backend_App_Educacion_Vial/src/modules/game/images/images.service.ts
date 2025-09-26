import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

export type CreateImageDto = {
  // Campos requeridos
  title: string;
  taskId: string;
  paths: Array<{ color: string; size: number; points: Array<{ x: number; y: number }> }>;
  colors: string[];

  // Campos adicionales del frontend
  description?: string;
  category?: string;
  type?: string;
  level?: string;
  status?: string;
  baseImage?: string;
  metadata?: any;

  // Información de la imagen procesada en backend
  imageDataUrl?: string;
  imageSvgMarkup?: string;
  imageMimeType?: string;
  imageFileName?: string;
};

@Injectable()
export class ImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(childId: string) {
    return this.prisma.coloredImage.findMany({
      where: { childId },
      orderBy: { dateCreated: 'desc' },
    });
  }

  async create(childId: string, dto: CreateImageDto) {
    // ✅ Validar que los datos existan
    if (!dto.title || !dto.taskId || !dto.paths || !dto.colors) {
      throw new Error('Datos del dibujo incompletos');
    }

    const result = await this.prisma.coloredImage.create({
      data: {
        childId,
        data: {
          ...dto,
          imageMimeType: dto.imageMimeType,
          imageFileName: dto.imageFileName,
          imageSvgMarkup: dto.imageSvgMarkup,
          imageDataUrl: dto.imageDataUrl,
        },
      },
    });

    return result;
  }

  async remove(childId: string, imageId: string) {
    // ensure image belongs to child
    const found = await this.prisma.coloredImage.findUnique({ where: { id: imageId } });
    if (!found || found.childId !== childId) return { success: false };

    await this.prisma.coloredImage.delete({ where: { id: imageId } });
    return { success: true };
  }
}
