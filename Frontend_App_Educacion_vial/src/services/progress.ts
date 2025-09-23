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
    return api.request<ProgressResponse>(`/progress/${childId}`, {
      headers: AuthService.headersWithAuth(accessToken),
    });
  },

  async update(data: Partial<ProgressResponse>): Promise<ProgressResponse> {
    const { accessToken, childId } = await AuthService.getSession();
    if (!accessToken || !childId) throw new Error('No session');
    return api.request<ProgressResponse>(`/progress/${childId}`, {
      method: 'PUT',
      headers: AuthService.headersWithAuth(accessToken),
      body: JSON.stringify(data),
    });
  },
};
