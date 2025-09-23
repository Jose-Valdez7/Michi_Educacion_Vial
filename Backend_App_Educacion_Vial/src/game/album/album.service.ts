import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

export type AlbumUpsertDto = {
  characters?: any[];
  vehicles?: any[];
};

@Injectable()
export class AlbumService {
  constructor(private readonly prisma: PrismaService) {}

  async getByChildId(childId: string) {
    const album = await this.prisma.album.findUnique({ where: { childId } });
    if (!album) {
      return this.prisma.album.create({
        data: {
          childId,
          characters: [],
          vehicles: [],
        },
      });
    }
    return album;
  }

  async upsert(childId: string, data: AlbumUpsertDto) {
    const existing = await this.prisma.album.findUnique({ where: { childId } });
    if (!existing) {
      return this.prisma.album.create({
        data: {
          childId,
          characters: data.characters ?? [],
          vehicles: data.vehicles ?? [],
        },
      });
    }
    return this.prisma.album.update({
      where: { childId },
      data: {
        characters: data.characters ?? (existing.characters as any),
        vehicles: data.vehicles ?? (existing.vehicles as any),
      },
    });
  }
}
