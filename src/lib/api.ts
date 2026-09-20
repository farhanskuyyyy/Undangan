const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface FetchOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: { email, password }
    }),
  
  getSession: () =>
    apiFetch<{ user: any }>('/auth/session'),

  // Guests
  getGuests: (params?: { has_arrived?: boolean; qr_code?: string; message_not_null?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.has_arrived !== undefined) query.set('has_arrived', String(params.has_arrived));
    if (params?.qr_code) query.set('qr_code', params.qr_code);
    if (params?.message_not_null) query.set('message_not_null', 'true');
    const qs = query.toString();
    return apiFetch<any[]>(`/guests${qs ? `?${qs}` : ''}`);
  },

  getGuestByQrCode: (qrCode: string) =>
    apiFetch<any>(`/guests/${encodeURIComponent(qrCode)}`),

  createGuest: (guest: any) =>
    apiFetch<any>('/guests', { method: 'POST', body: guest }),

  createGuests: (guests: any[]) =>
    apiFetch<any>('/guests', { method: 'POST', body: guests }),

  updateGuest: (id: string, updates: any) =>
    apiFetch<any>(`/guests/${id}`, { method: 'PUT', body: updates }),

  deleteGuest: (id: string) =>
    apiFetch<void>(`/guests/${id}`, { method: 'DELETE' }),

  // Wedding Settings
  getWeddingSettings: () =>
    apiFetch<any>('/wedding_settings'),

  updateWeddingSettings: (settings: any) =>
    apiFetch<any>('/wedding_settings', { method: 'PUT', body: settings }),

  // Love Stories
  getLoveStories: () =>
    apiFetch<any[]>('/love_stories'),

  createLoveStory: (story: any) =>
    apiFetch<any>('/love_stories', { method: 'POST', body: story }),

  updateLoveStory: (id: number, story: any) =>
    apiFetch<any>(`/love_stories/${id}`, { method: 'PUT', body: story }),

  deleteLoveStory: (id: number) =>
    apiFetch<void>(`/love_stories/${id}`, { method: 'DELETE' }),

  // Galleries
  getGalleries: () =>
    apiFetch<any[]>('/galleries'),

  createGallery: (gallery: any) =>
    apiFetch<any>('/galleries', { method: 'POST', body: gallery }),

  updateGallery: (id: number, gallery: any) =>
    apiFetch<any>(`/galleries/${id}`, { method: 'PUT', body: gallery }),

  deleteGallery: (id: number) =>
    apiFetch<void>(`/galleries/${id}`, { method: 'DELETE' }),

  // Rundowns
  getRundowns: () =>
    apiFetch<any[]>('/rundowns'),

  createRundown: (rundown: any) =>
    apiFetch<any>('/rundowns', { method: 'POST', body: rundown }),

  updateRundown: (id: number, rundown: any) =>
    apiFetch<any>(`/rundowns/${id}`, { method: 'PUT', body: rundown }),

  deleteRundown: (id: number) =>
    apiFetch<void>(`/rundowns/${id}`, { method: 'DELETE' }),

  // Photo upload
  uploadPhoto: async (guestId: string, file: File) => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await fetch(`${API_BASE}/photos/${guestId}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return response.json();
  },

  deletePhoto: (guestId: string) =>
    apiFetch<void>(`/photos/${guestId}`, { method: 'DELETE' })
};
