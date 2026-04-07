import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://localhost:3000/api/v1';

let accessToken: string | null = null;

export async function initToken() {
  accessToken = await SecureStore.getItemAsync('accessToken');
}

export async function setToken(token: string | null) {
  accessToken = token;
  if (token) await SecureStore.setItemAsync('accessToken', token);
  else await SecureStore.deleteItemAsync('accessToken');
}

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}
