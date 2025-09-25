import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

export type ProgressUpsertDto = {
  level?: number;
  points?: number;
  coins?: number;
  completedGames?: string[];
  levelPoints?: Record<string, number>;
  unlockedLevels?: number[];
};

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getByChildId(childId: string) {
    const progress = await this.prisma.progress.findUnique({ where: { childId } });
    if (!progress) {
      // create default
      return this.prisma.progress.create({
        data: {
          childId,
          level: 1,
          points: 0,
          coins: 0,
          completedGames: [],
          levelPoints: { 1: 0, 2: 0, 3: 0 },
          unlockedLevels: [1],
        },
      });
    }
    return progress;
  }

  async upsert(childId: string, data: ProgressUpsertDto) {
    // Ensure exists
    const existing = await this.prisma.progress.findUnique({ where: { childId } });
    if (!existing) {
      return this.prisma.progress.create({
        data: {
          childId,
          level: data.level ?? 1,
          points: data.points ?? 0,
          coins: data.coins ?? 0,
          completedGames: data.completedGames ?? [],
          levelPoints: data.levelPoints ?? { 1: 0, 2: 0, 3: 0 },
          unlockedLevels: data.unlockedLevels ?? [1],
        },
      });
    }

    return this.prisma.progress.update({
      where: { childId },
      data: {
        level: data.level ?? existing.level,
        points: data.points ?? existing.points,
        coins: data.coins ?? existing.coins,
        completedGames: data.completedGames ?? existing.completedGames,
        levelPoints: data.levelPoints ?? (existing.levelPoints as any),
        unlockedLevels: data.unlockedLevels ?? existing.unlockedLevels,
      },
    });
  }
}
