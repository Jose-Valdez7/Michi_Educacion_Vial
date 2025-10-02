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
    let progress = await this.prisma.progress.findUnique({
      where: { childId },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    if (!progress) {
      // create default
      progress = await this.prisma.progress.create({
        data: {
          childId,
          level: 1,
          points: 0,
          coins: 0,
          completedGames: { set: [] },
          levelPoints: { 1: 0, 2: 0, 3: 0 },
          unlockedLevels: { set: [1] },
        },
        include: {
          child: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        }
      });
    }

    // Asegurarse de que completedGames es un array
    if (!Array.isArray(progress.completedGames)) {
      console.warn('Progress.completedGames is not an array, fixing...');
      progress.completedGames = [];

      // Actualizar en la base de datos
      await this.prisma.progress.update({
        where: { id: progress.id },
        data: {
          completedGames: { set: [] }
        }
      });
    }

    return progress;
  }

  async upsert(childId: string, data: ProgressUpsertDto) {
    // Ensure exists
    const existing = await this.prisma.progress.findUnique({ where: { childId } });

    const currentCompletedGames = existing?.completedGames || [];
    const newCompletedGames = data.completedGames || [];

    // Asegurarse de que los arrays sean realmente arrays
    const safeCurrentGames = Array.isArray(currentCompletedGames) ? currentCompletedGames : [];
    const safeNewGames = Array.isArray(newCompletedGames) ? newCompletedGames : [];

    // Combinar juegos completados existentes con los nuevos, eliminando duplicados
    const combinedCompletedGames = Array.from(
      new Set([...safeCurrentGames, ...safeNewGames])
    ).filter(Boolean); // Eliminar valores nulos o indefinidos

    // Preparar datos para la actualización
    const updateData: any = {
      level: data.level ?? existing?.level ?? 1,
      points: data.points ?? existing?.points ?? 0,
      coins: data.coins ?? existing?.coins ?? 0,
      levelPoints: data.levelPoints ?? existing?.levelPoints ?? { 1: 0, 2: 0, 3: 0 },
      unlockedLevels: Array.isArray(data.unlockedLevels)
        ? [...new Set([...(existing?.unlockedLevels || []), ...data.unlockedLevels])]
        : existing?.unlockedLevels ?? [1],
    };

    // Solo actualizar completedGames si se proporciona en los datos
    if (data.completedGames !== undefined) {
      updateData.completedGames = {
        set: combinedCompletedGames
      };
    }

    if (!existing) {
      const createData: any = {
        childId,
        level: data.level ?? 1,
        points: data.points ?? 0,
        coins: data.coins ?? 0,
        completedGames: {
          set: combinedCompletedGames
        },
        levelPoints: data.levelPoints ?? { 1: 0, 2: 0, 3: 0 },
        unlockedLevels: {
          set: Array.isArray(data.unlockedLevels) ? data.unlockedLevels : [1]
        }
      };

      const result = await this.prisma.progress.create({
        data: createData,
      });

      return result;
    }

    const result = await this.prisma.progress.update({
      where: { childId },
      data: updateData,
    });

    return result;
  }
}
