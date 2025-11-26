export const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

async function handleResponse(res: Response) {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  });
  return handleResponse(res);
}

export type EventSearchParams = {
  plate?: string;
  camera_id?: string;
  zone_id?: string;
  from_ts?: string;
  to_ts?: string;
  limit?: string;
  offset?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  min_confidence?: string;
};

export const api = {
  health: () => apiFetch('/healthz'),
  cameras: {
    list: () => apiFetch('/config/cameras'),
    create: (data: any) => apiFetch('/config/cameras', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiFetch(`/config/cameras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: number) => apiFetch(`/config/cameras/${id}`, { method: 'DELETE' }),
  },
  zones: {
    list: () => apiFetch('/config/zones'),
    create: (data: any) => apiFetch('/config/zones', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiFetch(`/config/zones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: number) => apiFetch(`/config/zones/${id}`, { method: 'DELETE' }),
  },
  models: {
    list: () => apiFetch('/config/models'),
    create: (data: any) => apiFetch('/config/models', { method: 'POST', body: JSON.stringify(data) }),
  },
  sensors: {
    list: () => apiFetch('/config/sensors'),
    create: (data: any) => apiFetch('/config/sensors', { method: 'POST', body: JSON.stringify(data) }),
  },
  exporters: {
    list: () => apiFetch('/config/exporters'),
    create: (data: any) => apiFetch('/config/exporters', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiFetch(`/config/exporters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  events: {
    search: (params: URLSearchParams) => apiFetch(`/events/search?${params.toString()}`),
    ingest: (data: any) => apiFetch('/events/ingest', { method: 'POST', body: JSON.stringify(data) }),
    stream: (params?: URLSearchParams) => {
      const urlParams = params && params.toString().length ? `?${params.toString()}` : '';
      return new EventSource(`${API_BASE}/events/stream${urlParams}`);
    },
  },
};
