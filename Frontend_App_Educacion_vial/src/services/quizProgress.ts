import AsyncStorage from '@react-native-async-storage/async-storage';

const QUIZ_PROGRESS_KEY = 'quiz_progress';

export interface QuizProgress {
  easy: {
    completed: boolean;
    score: number;
    completedAt?: string;
  };
  medium: {
    completed: boolean;
    score: number;
    completedAt?: string;
    unlocked: boolean;
    unlockedAt?: string;
  };
  hard: {
    completed: boolean;
    score: number;
    completedAt?: string;
    unlocked: boolean;
    unlockedAt?: string;
  };
  level1Completed: boolean;
  level1CompletedAt?: string;
}

const defaultProgress: QuizProgress = {
  easy: {
    completed: false,
    score: 0,
  },
  medium: {
    completed: false,
    score: 0,
    unlocked: false,
  },
  hard: {
    completed: false,
    score: 0,
    unlocked: false,
  },
  level1Completed: false,
};

export class QuizProgressService {
  static async getProgress(): Promise<QuizProgress> {
    try {
      const stored = await AsyncStorage.getItem(QUIZ_PROGRESS_KEY);
      if (stored) {
        return { ...defaultProgress, ...JSON.parse(stored) };
      }
      return defaultProgress;
    } catch (error) {
      console.error('Error getting quiz progress:', error);
      return defaultProgress;
    }
  }

  static async saveProgress(progress: QuizProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
  }

  static async completeLevel(levelId: 'easy' | 'medium' | 'hard', score: number): Promise<void> {
    const progress = await this.getProgress();

    // Marcar nivel como completado
    progress[levelId].completed = true;
    progress[levelId].score = score;
    progress[levelId].completedAt = new Date().toISOString();

    // Desbloquear siguiente nivel si existe
    if (levelId === 'easy') {
      progress.medium.unlocked = true;
      progress.medium.unlockedAt = new Date().toISOString();
    } else if (levelId === 'medium') {
      progress.hard.unlocked = true;
      progress.hard.unlockedAt = new Date().toISOString();
    }

    // Verificar si se completó todo el nivel 1
    if (progress.easy.completed && progress.medium.completed && progress.hard.completed) {
      progress.level1Completed = true;
      progress.level1CompletedAt = new Date().toISOString();
    }

    await this.saveProgress(progress);
  }

  static async resetProgress(): Promise<void> {
    await this.saveProgress(defaultProgress);
  }

  static async getNextAvailableLevel(): Promise<'easy' | 'medium' | 'hard'> {
    const progress = await this.getProgress();

    if (!progress.easy.completed) return 'easy';
    if (!progress.medium.unlocked) return 'medium';
    if (!progress.hard.unlocked) return 'hard';

    return 'easy'; // Si todos están completados, empezar de nuevo
  }

  static async isLevelUnlocked(levelId: 'easy' | 'medium' | 'hard'): Promise<boolean> {
    const progress = await this.getProgress();

    switch (levelId) {
      case 'easy':
        return true; // Siempre disponible
      case 'medium':
        return progress.medium.unlocked || progress.easy.completed;
      case 'hard':
        return progress.hard.unlocked || progress.medium.completed;
      default:
        return false;
    }
  }

  static async getLevelStatus(levelId: 'easy' | 'medium' | 'hard'): Promise<{
    unlocked: boolean;
    completed: boolean;
    score: number;
  }> {
    const progress = await this.getProgress();

    return {
      unlocked: await this.isLevelUnlocked(levelId),
      completed: progress[levelId].completed,
      score: progress[levelId].score,
    };
  }
}
