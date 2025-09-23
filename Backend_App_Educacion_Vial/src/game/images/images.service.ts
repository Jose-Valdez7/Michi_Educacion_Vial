import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

export type CreateImageDto = {
  // any payload from frontend coloring feature
  // we store it as JSON to keep parity with AsyncStorage shape
  // e.g. { svgId: string, colors: Record<string,string>, preview?: string }
  data: Record<string, any>;
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
    return this.prisma.coloredImage.create({
      data: {
        childId,
        data: dto.data,
      },
    });
  }

  async remove(childId: string, imageId: string) {
    // ensure image belongs to child
    const found = await this.prisma.coloredImage.findUnique({ where: { id: imageId } });
    if (!found || found.childId !== childId) return { success: false };

    await this.prisma.coloredImage.delete({ where: { id: imageId } });
    return { success: true };
  }
}
