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

    const result = await api.request(`/images/${childId}`, {
      headers: AuthService.headersWithAuth(accessToken),
    }) as ColoredImage[];

    return result;
  },

  async create(data: Record<string, any>): Promise<ColoredImage> {
    const { accessToken, childId } = await AuthService.getSession();
    if (!accessToken || !childId) throw new Error('No session');

    const requestBody = JSON.stringify(data);

    const headers = {
      'Content-Type': 'application/json',
      ...AuthService.headersWithAuth(accessToken),
    };

    return api.request(`/images/${childId}`, {
      method: 'POST',
      headers: headers,
      body: requestBody,
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
