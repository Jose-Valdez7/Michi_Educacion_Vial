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

  async test(data: Record<string, any>): Promise<any> {
    const { accessToken, childId } = await AuthService.getSession();
    if (!accessToken || !childId) throw new Error('No session');

    console.log('🧪 [ImagesApi.test] Enviando datos de prueba:', {
      childId,
      dataKeys: Object.keys(data),
      dataType: typeof data,
      dataContent: data,
      dataString: JSON.stringify(data, null, 2)
    });

    const requestBody = JSON.stringify(data);
    console.log('🧪 [ImagesApi.test] JSON enviado:', requestBody);

    return api.request(`/images/${childId}/test`, {
      method: 'POST',
      headers: AuthService.headersWithAuth(accessToken),
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
