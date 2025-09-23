import { api } from './api';
import { AuthService } from './auth';

export type ColoredImage = {
  id: string;
  data: Record<string, any>;
  dateCreated: string;
};

export const ImagesApi = {
  async list(): Promise<ColoredImage[]> {
    const { accessToken, childId } = await AuthService.getSession();
    if (!accessToken || !childId) throw new Error('No session');
    return api.request(`/images/${childId}`, {
      headers: AuthService.headersWithAuth(accessToken),
    });
  },

  async create(data: Record<string, any>): Promise<ColoredImage> {
    const { accessToken, childId } = await AuthService.getSession();
    if (!accessToken || !childId) throw new Error('No session');
    return api.request(`/images/${childId}`, {
      method: 'POST',
      headers: AuthService.headersWithAuth(accessToken),
      body: JSON.stringify({ data }),
    });
  },

  async remove(imageId: string): Promise<{ success: boolean }> {
    const { accessToken, childId } = await AuthService.getSession();
    if (!accessToken || !childId) throw new Error('No session');
    return api.request(`/images/${childId}/${imageId}`, {
      method: 'DELETE',
      headers: AuthService.headersWithAuth(accessToken),
    });
  },
};
