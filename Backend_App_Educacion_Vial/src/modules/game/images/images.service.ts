import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

export type CreateImageDto = {
  // Datos del dibujo enviados directamente por el frontend
  title: string;
  taskId: string;
  paths: Array<{ color: string; size: number; points: Array<{ x: number; y: number }> }>;
  colors: string[];
  baseImage: string;
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
        data: dto, // ✅ Guardar todo el objeto dto como JSON
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
