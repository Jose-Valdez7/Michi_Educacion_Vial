import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export type LoginResponse = {
  status: number;
  message: string;
  data: {
    child: {
      id: string;
      name: string;
      roles: string[];
      cedula?: string;
      userName?: string;
      birthdate?: string;
      sex?: string[];
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  timestamp: string;
};

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  CHILD_ID: 'child_id',
  CHILD_NAME: 'child_name',
  CHILD_SEX: 'child_sex',
};

export const AuthService = {
  async register(input: {
    name: string;
    cedula: string;
    username: string;
    birthdate: string;
    sex: 'MALE' | 'FEMALE' | 'OTHER';
    role?: 'CHILD';
  }) {
    const body = { ...input, role: input.role ?? 'CHILD' };
    const res = await api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    try {
      await AsyncStorage.setItem('last_register_username', input.username);
      await AsyncStorage.setItem('last_register_cedula', input.cedula);
    } catch {}
    return res;
  },

  async login(userName: string, cedula: string) {
    const res = await api.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userName, cedula }),
    });
    const { accessToken, refreshToken, child } = res.data;
    await AsyncStorage.multiSet([
      [KEYS.ACCESS_TOKEN, accessToken],
      [KEYS.REFRESH_TOKEN, refreshToken],
      [KEYS.CHILD_ID, child.id],
      [KEYS.CHILD_NAME, child.name],
      [KEYS.CHILD_SEX, child.sex?.[0] || 'OTHER'],
    ]);
    return res.data;
  },

  async logout() {
    const refresh = await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
    if (refresh) {
      try {
        await api.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: refresh }),
        });
      } catch {}
    }
    await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN, KEYS.CHILD_ID, KEYS.CHILD_NAME, KEYS.CHILD_SEX]);
  },

  async getSession() {
    const session = await AsyncStorage.multiGet([
      KEYS.ACCESS_TOKEN,
      KEYS.REFRESH_TOKEN,
      KEYS.CHILD_ID,
      KEYS.CHILD_NAME,
      KEYS.CHILD_SEX,
    ]);
    return {
      accessToken: session[0][1] || undefined,
      refreshToken: session[1][1] || undefined,
      childId: session[2][1] || undefined,
      childName: session[3][1] || undefined,
      childSex: (session[4][1] as 'MALE' | 'FEMALE' | 'OTHER') || 'OTHER',
    };
  },

  async ensureSession(): Promise<{ accessToken: string; childId: string }> {
    let session = await this.getSession();

    if (!session.accessToken || !session.childId) {
      try {
        const testUser = {
          name: 'Usuario Prueba',
          cedula: '1234567890',
          username: 'test_user_' + Date.now(),
          birthdate: '2010-01-01',
          sex: 'MALE' as const,
        };

        await this.register(testUser);
        const loginResult = await this.login(testUser.username, testUser.cedula);

        session = await this.getSession();
      } catch (error) {
        throw new Error('No se pudo crear sesión de prueba: ' + error);
      }
    }

    if (!session.accessToken || !session.childId) {
      throw new Error('Sesión no válida');
    }

    return { accessToken: session.accessToken, childId: session.childId };
  },

  headersWithAuth(accessToken?: string): Record<string, string> {
    if (accessToken) return { Authorization: `Bearer ${accessToken}` };
    return {};
  },
};
