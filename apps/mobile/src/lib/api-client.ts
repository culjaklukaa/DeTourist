import { getToken } from './secureStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.2.19:8000';

/**
 * A typed fetch wrapper stub wired to @detourist/api-types.
 * Used for future typed requests when OpenAPI generation is complete.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken('accessToken');
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // TODO: Port the 401 auto-refresh logic from axios here if we fully migrate to fetch
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
