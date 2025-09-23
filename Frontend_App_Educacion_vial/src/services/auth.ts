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
};

export const AuthService = {
  async register(input: {
    name: string;
    cedula: string; // 10 chars
    username: string;
    birthdate: string; // YYYY-MM-DD
    sex: 'MALE' | 'FEMALE' | 'OTHER';
    role?: 'CHILD';
  }) {
    const body = { ...input, role: input.role ?? 'CHILD' };
    const res = await api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    // opcional: guardar últimas credenciales
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
    await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN, KEYS.CHILD_ID, KEYS.CHILD_NAME]);
  },

  async getSession() {
    const [[, access], [, refresh], [, childId], [, childName]] = await AsyncStorage.multiGet([
      KEYS.ACCESS_TOKEN,
      KEYS.REFRESH_TOKEN,
      KEYS.CHILD_ID,
      KEYS.CHILD_NAME,
    ]);
    return { accessToken: access || undefined, refreshToken: refresh || undefined, childId: childId || undefined, childName: childName || undefined };
  },

  headersWithAuth(accessToken?: string): Record<string, string> {
    if (accessToken) return { Authorization: `Bearer ${accessToken}` };
    return {} as Record<string, string>;
  },
};
