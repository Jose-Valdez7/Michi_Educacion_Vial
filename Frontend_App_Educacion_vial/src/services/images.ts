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

    console.log('📋 [ImagesApi.list] Solicitando lista de imágenes para childId:', childId);

    const result = await api.request(`/images/${childId}`, {
      headers: AuthService.headersWithAuth(accessToken),
    }) as ColoredImage[];

    console.log('📋 [ImagesApi.list] Respuesta recibida:', {
      count: result.length,
      items: result.map((item: any) => ({
        id: item.id,
        title: item.data?.title,
        taskId: item.data?.taskId,
        dateCreated: item.dateCreated
      }))
    });

    return result;
  },

  async create(data: Record<string, any>): Promise<ColoredImage> {
    const { accessToken, childId } = await AuthService.getSession();
    if (!accessToken || !childId) throw new Error('No session');

    console.log('🔍 [ImagesApi.create] Datos recibidos:', {
      childId,
      dataKeys: Object.keys(data),
      dataType: typeof data,
      hasTitle: !!data.title,
      hasPaths: !!data.paths,
      pathsCount: data.paths?.length || 0,
      hasColors: !!data.colors,
      colorsCount: data.colors?.length || 0,
      hasBaseImage: !!data.baseImage,
      title: data.title,
      taskId: data.taskId,
      baseImage: data.baseImage,
      pathsData: data.paths,
      colorsData: data.colors
    });

    const requestBody = JSON.stringify(data);
    console.log('🔍 [ImagesApi.create] JSON enviado:', requestBody);

    const headers = {
      'Content-Type': 'application/json', // ✅ Configurar primero
      ...AuthService.headersWithAuth(accessToken), // ✅ Luego los headers de auth
    };

    console.log('🔍 [ImagesApi.create] Headers enviados:', headers);

    return api.request(`/images/${childId}`, { // ✅ Usar endpoint normal de creación
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
