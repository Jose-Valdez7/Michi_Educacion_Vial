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
    console.log('📥 Recibiendo datos del frontend:', {
      childId,
      hasTitle: !!dto.title,
      hasTaskId: !!dto.taskId,
      hasPaths: !!dto.paths,
      pathsCount: dto.paths?.length || 0,
      hasColors: !!dto.colors,
      colorsCount: dto.colors?.length || 0,
      hasBaseImage: !!dto.baseImage,
      title: dto.title,
      taskId: dto.taskId,
      baseImage: dto.baseImage
    });

    // ✅ Validar que los datos existan
    if (!dto.title || !dto.taskId || !dto.paths || !dto.colors) {
      console.error('❌ Datos del dibujo incompletos:', {
        hasTitle: !!dto.title,
        hasTaskId: !!dto.taskId,
        hasPaths: !!dto.paths,
        hasColors: !!dto.colors
      });
      throw new Error('Datos del dibujo incompletos');
    }

    console.log('✅ Creando imagen en base de datos...');
    const result = await this.prisma.coloredImage.create({
      data: {
        childId,
        data: dto, // ✅ Guardar todo el objeto dto como JSON
      },
    });

    console.log('✅ Imagen creada exitosamente:', {
      id: result.id,
      childId: result.childId,
      dateCreated: result.dateCreated
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
