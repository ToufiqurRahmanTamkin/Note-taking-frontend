const TOKEN_KEY = 'note_app_token';

/**
 * Base URL for the API. Defaults to the relative `/api`, which Vite's dev
 * server proxies to the backend (see vite.config.ts). Override it via
 * VITE_API_BASE_URL for a deployed backend on a different origin.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Thin fetch wrapper: attaches the JWT, serialises JSON bodies and throws a
 * useful Error (with the server's message) on non-2xx responses.
 */
export const api = async <T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(payload?.message || `Request failed (${res.status})`);
  }
  return payload as T;
};
