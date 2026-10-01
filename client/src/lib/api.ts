const TOKEN_KEY = 'ls_admin_token';

/** Empty in local dev (Vite proxies /api); set to the Render URL in production. */
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, options: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token && options.auth !== false) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && path.startsWith('/admin')) tokenStore.clear();
    const fieldErrors = data?.details?.fieldErrors as Record<string, string[]> | undefined;
    const detail = fieldErrors ? Object.entries(fieldErrors).map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ') : '';
    throw new ApiError([data?.error, detail].filter(Boolean).join(' - ') || 'Request failed', res.status);
  }
  return data as T;
}
