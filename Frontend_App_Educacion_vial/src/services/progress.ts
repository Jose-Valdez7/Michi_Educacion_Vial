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
    const { accessToken, childId } = await AuthService.getSession();
    if (!accessToken || !childId) throw new Error('No session');

    const result = await api.request<ProgressResponse>(`/progress/${childId}`, {
      headers: AuthService.headersWithAuth(await AuthService.getSession().then(s => s.accessToken)),
    });

    return result;
  },

  async update(data: Partial<ProgressResponse>): Promise<ProgressResponse> {
    const { childId } = await AuthService.getSession();
    if (!childId) throw new Error('No session');

    const result = await api.request<ProgressResponse>(`/progress/${childId}`, {
      method: 'PUT',
      headers: AuthService.headersWithAuth(await AuthService.getSession().then(s => s.accessToken)),
      body: JSON.stringify(data),
    });

    return result;
  },
};
