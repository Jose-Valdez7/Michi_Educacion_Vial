import { ProgressApi } from './progress';

// Internal helper to apply updates with caps and unlocks for level 1
async function apply(update: { addPoints: number; addCoinsIfNoPoints?: number; addCompleted: string[] }) {
  const current = await ProgressApi.get();
  const level = 1;
  const levelPoints: Record<string, number> = current.levelPoints || { 1: 0, 2: 0, 3: 0 };
  const currentLP = Number(levelPoints[level] ?? 0);

  const newLevelPoints = Math.min(currentLP + (update.addPoints || 0), 25);
  const actualPointsEarned = newLevelPoints - currentLP;

  let coins = current.coins || 0;
  if (actualPointsEarned === 0 && update.addCoinsIfNoPoints) {
    coins += update.addCoinsIfNoPoints;
  }

  const completedGames: string[] = Array.isArray(current.completedGames) ? current.completedGames : [];
  const newCompleted = [...completedGames];
  for (const key of update.addCompleted) if (!newCompleted.includes(key)) newCompleted.push(key);

  const newUnlocked = Array.isArray(current.unlockedLevels) ? [...current.unlockedLevels] : [1];
  let newLevel = current.level || 1;
  const newLPObj = { ...levelPoints, [level]: newLevelPoints } as Record<string, number>;
  if (newLevelPoints >= 25 && newLevel < 3 && !newUnlocked.includes(2)) {
    newUnlocked.push(2);
    newLevel = Math.max(newLevel, 2);
  }

  return ProgressApi.update({
    level: newLevel,
    points: (current.points || 0) + actualPointsEarned,
    coins,
    completedGames: newCompleted,
    levelPoints: newLPObj,
    unlockedLevels: newUnlocked,
  });
}

export async function awardQuizLevel1Completion(pointsEarned = 10) {
  const l = 1;
  return apply({
    addPoints: pointsEarned,
    addCoinsIfNoPoints: Math.floor(pointsEarned / 2),
    addCompleted: [`${l}_quiz_vial`, `${l}_1`],
  });
}

export async function awardBicycleLevel1Completion(pointsEarned = 10) {
  const l = 1;
  return apply({
    addPoints: pointsEarned,
    addCoinsIfNoPoints: Math.floor(pointsEarned / 2),
    addCompleted: [`${l}_bicycle`, `${l}_2`],
  });
}

export async function awardColoringLevel1Completion(pointsEarned = 10) {
  const l = 1;
  return apply({
    addPoints: pointsEarned,
    addCoinsIfNoPoints: Math.floor(pointsEarned / 2),
    addCompleted: [`${l}_coloring`, `${l}_6`],
  });
}

export async function awardColoringTaskCompletion(task: 'cat' | 'patrol' | 'semaforo', pointsEarned = 8) {
  const l = 1;
  return apply({
    addPoints: pointsEarned,
    addCoinsIfNoPoints: Math.floor(pointsEarned / 2),
    addCompleted: [`${l}_coloring_${task}`],
  });
}

// Comprueba si las 3 tareas de colorear están completas y, si falta, añade la clave resumen '1_coloring'
export async function maybeAwardColoringSetStar() {
  const current = await ProgressApi.get();
  const needed = new Set(['1_coloring_cat', '1_coloring_patrol', '1_coloring_semaforo']);
  const done: string[] = Array.isArray(current.completedGames) ? current.completedGames : [];
  const hasAll = Array.from(needed).every((k) => done.includes(k));
  const hasSummary = done.includes('1_coloring') || done.includes('1_6');
  if (hasAll && !hasSummary) {
    return apply({ addPoints: 0, addCompleted: ['1_coloring', '1_6'] });
  }
  return current;
}
