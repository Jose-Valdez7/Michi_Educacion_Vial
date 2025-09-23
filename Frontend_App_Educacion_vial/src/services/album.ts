import { api } from './api';
import { AuthService } from './auth';

export type AlbumPayload = {
  characters?: any[];
  vehicles?: any[];
};

export type AlbumResponse = {
  characters: any[];
  vehicles: any[];
};

export const AlbumApi = {
  async get(): Promise<AlbumResponse> {
    const { accessToken, childId } = await AuthService.getSession();
    if (!accessToken || !childId) throw new Error('No session');
    return api.request<AlbumResponse>(`/album/${childId}`, {
      headers: AuthService.headersWithAuth(accessToken),
    });
  },
  async update(data: AlbumPayload): Promise<AlbumResponse> {
    const { accessToken, childId } = await AuthService.getSession();
    if (!accessToken || !childId) throw new Error('No session');
    return api.request<AlbumResponse>(`/album/${childId}`, {
      method: 'PUT',
      headers: AuthService.headersWithAuth(accessToken),
      body: JSON.stringify(data),
    });
  },
};
