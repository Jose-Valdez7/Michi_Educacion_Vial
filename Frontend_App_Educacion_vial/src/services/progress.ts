import { api } from './api';
import { AuthService } from './auth';

export type ProgressResponse = {
  level: number;
  points: number;
  coins: number;
  completedGames: string[];
  levelPoints: Record<string, number>;
  unlockedLevels: number[];
};

export const ProgressApi = {
  async get(): Promise<ProgressResponse> {
    try {
      const { accessToken, childId } = await AuthService.ensureSession();

      const result = await api.request<ProgressResponse>(`/progress/${childId}`, {
        headers: {
          ...AuthService.headersWithAuth(accessToken),
          'Cache-Control': 'no-cache',
        },
      });

      // Asegurarse de que todos los campos requeridos estén presentes
      const response: ProgressResponse = {
        level: result?.level ?? 1,
        points: result?.points ?? 0,
        coins: result?.coins ?? 0,
        completedGames: Array.isArray(result?.completedGames) ? result.completedGames : [],
        levelPoints: result?.levelPoints || { 1: 0, 2: 0, 3: 0 },
        unlockedLevels: Array.isArray(result?.unlockedLevels) ? result.unlockedLevels : [1]
      };

      return response;

    } catch (error) {
      console.warn('⚠️ Could not fetch progress from server, using defaults:', error);
      // Retornar datos por defecto para permitir funcionamiento offline
      return {
        level: 1,
        points: 0,
        coins: 0,
        completedGames: [],
        levelPoints: { 1: 0, 2: 0, 3: 0 },
        unlockedLevels: [1]
      };
    }
  },

  async update(data: Partial<ProgressResponse>): Promise<ProgressResponse> {
    try {
      const { accessToken, childId } = await AuthService.ensureSession();

      const result = await api.request<ProgressResponse>(`/progress/${childId}`, {
        method: 'PUT',
        headers: {
          ...AuthService.headersWithAuth(accessToken),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Asegurarse de que completedGames sea siempre un array
      if (result && !Array.isArray(result.completedGames)) {
        console.warn('⚠️ Server returned non-array completedGames, fixing...');
        result.completedGames = [];
      }

      return result;
    } catch (error) {
      console.error('❌ Could not update progress on server:', error);
      throw error; // Re-lanzar para que el llamador pueda manejarlo
    }
  },

  // Nueva función para verificar conectividad
  async isConnected(): Promise<boolean> {
    try {
      await this.get();
      return true;
    } catch {
      return false;
    }
  }
};
