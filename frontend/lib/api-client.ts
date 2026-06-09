import type { Product, AppUser, OrderItem } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://texttile.onrender.com';

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const productApi = {
  fetchAll: () => apiFetch<{ products: Product[] }>('/api/products'),
  fetchFeatured: () =>
    apiFetch<{ products: Product[] }>('/api/products/featured'),
  fetchByCategory: (categoryKey: string) =>
    apiFetch<{ products: Product[] }>(
      `/api/products?category=${encodeURIComponent(categoryKey)}`,
    ),
  fetchById: (id: string) =>
    apiFetch<{ product: Product }>(`/api/products/${id}`),

  // Admin CRUD operations
  fetchAllAdmin: (token: string) =>
    apiFetch<{ products: Product[] }>('/api/products?admin=true', { token }),
  upsert: (token: string, product: Partial<Product> & { id: string }, isFeatured: boolean) =>
    apiFetch<{ ok: true }>('/api/products', {
      method: 'POST',
      token,
      body: JSON.stringify({ product, isFeatured }),
    }),
  delete: (token: string, id: string) =>
    apiFetch<{ ok: true }>(`/api/products/${id}`, {
      method: 'DELETE',
      token,
    }),
  setVisibility: (token: string, id: string, visible: boolean) =>
    apiFetch<{ ok: true }>(`/api/products/${id}/visibility`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ isVisible: visible }),
    }),
  setFeatured: (token: string, id: string, featured: boolean) =>
    apiFetch<{ ok: true }>(`/api/products/${id}/featured`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ isFeatured: featured }),
    }),
};

export const orderApi = {
  fetchMine: (token: string) =>
    apiFetch<{ orders: OrderItem[] }>('/api/orders/mine', { token }),
  create: (
    token: string,
    body: {
      buyerName: string;
      buyerPhone?: string;
      lines: { productId: string; quantity: number }[];
      total: number;
    },
  ) =>
    apiFetch<{ ok: true }>('/api/orders', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),

  // Admin operations
  fetchAllAdmin: (token: string) =>
    apiFetch<{ orders: OrderItem[] }>('/api/orders', { token }),
  updateStatus: (token: string, id: string, status: string) =>
    apiFetch<{ ok: true }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    }),
};

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ accessToken: string; user: AppUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: {
    businessName: string;
    email: string;
    password: string;
    phone?: string;
  }) =>
    apiFetch<{ accessToken: string; user: AppUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: (token: string) =>
    apiFetch<{ user: AppUser }>('/api/auth/me', { token }),

  // Admin operations
  fetchBuyersAdmin: (token: string) =>
    apiFetch<{ buyers: { id: string; name: string; phone: string; orders: number }[] }>(
      '/api/auth/buyers',
      { token },
    ),
};

export const notificationApi = {
  registerToken: (token: string) =>
    apiFetch<{ ok: true }>('/api/notifications/register-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  status: () => apiFetch<{ configured: boolean }>('/api/notifications/status'),
};

export const bannerApi = {
  fetchUrls: () => apiFetch<{ urls: string[] }>('/api/banners'),

  // Admin operations
  fetchAllAdmin: (token: string) =>
    apiFetch<{ banners: { id: string; image_url: string; sort_order: number }[] }>('/api/banners', {
      token,
    }),
  add: (token: string, imageUrl: string, sortOrder: number = 0) =>
    apiFetch<{ ok: true }>('/api/banners', {
      method: 'POST',
      token,
      body: JSON.stringify({ imageUrl, sortOrder }),
    }),
  delete: (token: string, id: string) =>
    apiFetch<{ ok: true }>(`/api/banners/${id}`, {
      method: 'DELETE',
      token,
    }),
};
