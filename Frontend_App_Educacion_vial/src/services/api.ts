import Constants from 'expo-constants';

const DEFAULT_BASE_URL = 'http://localhost:3000';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    const extra = (Constants?.expoConfig?.extra ?? {}) as any;
    this.baseUrl = baseUrl || extra.API_BASE_URL || DEFAULT_BASE_URL;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      let body: any = null;
      try {
        body = await res.json();
      } catch {
        // ignore JSON parse error
      }
      const text = body?.message || body?.error || (await res.text());
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
  }
}

export const api = new ApiClient();
