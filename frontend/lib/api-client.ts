import type { Product, AppUser, OrderItem, Category } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://texttile.onrender.com';

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  
  // Disable caching so admin changes are immediately visible
  const fetchOptions: RequestInit = {
    ...init,
    headers,
    cache: 'no-store',
  };

  const res = await fetch(`${API_BASE}${path}`, fetchOptions);
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
    apiFetch<{ product: Product }>(`/api/products/${encodeURIComponent(id)}`),

  // Admin CRUD operations
  fetchAllAdmin: (token: string) =>
    apiFetch<{ products: Product[] }>('/api/products?admin=true', { token }),
  upsert: (token: string, product: Partial<Product> & { id: string }, isFeatured: boolean, oldId?: string) =>
    apiFetch<{ ok: true }>('/api/products', {
      method: 'POST',
      token,
      body: JSON.stringify({ product, isFeatured, oldId }),
    }),
  delete: (token: string, id: string) =>
    apiFetch<{ ok: true }>(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      token,
    }),
  setVisibility: (token: string, id: string, visible: boolean) =>
    apiFetch<{ ok: true }>(`/api/products/${encodeURIComponent(id)}/visibility`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ isVisible: visible }),
    }),
  setFeatured: (token: string, id: string, featured: boolean) =>
    apiFetch<{ ok: true }>(`/api/products/${encodeURIComponent(id)}/featured`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ isFeatured: featured }),
    }),
  notify: (token: string, id: string) =>
    apiFetch<{ ok: true }>(`/api/products/${encodeURIComponent(id)}/notify`, {
      method: 'POST',
      token,
    }),
  uploadImage: (token: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then(async res => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Upload failed (${res.status})`);
      }
      return res.json() as Promise<{ imageUrl: string }>;
    });
  },
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
  createManual: (
    token: string,
    body: {
      buyerName: string;
      buyerPhone?: string;
      itemName: string;
      quantity: number;
      price: number;
      imageUrl?: string;
    },
  ) =>
    apiFetch<{ ok: true }>('/api/orders/manual', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),
  updateStatus: (token: string, id: string, status: string) =>
    apiFetch<{ ok: true }>(`/api/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    }),
};

export const authApi = {
  login: (identifier: string, password: string) =>
    apiFetch<{ accessToken: string; user: AppUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),
  register: (payload: {
    name: string;
    password: string;
    mobile: string;
    gstin: string;
    businessName: string;
    address: string;
  }) =>
    apiFetch<{ accessToken: string; user: AppUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyGst: (gstin: string) =>
    apiFetch<{
      valid: boolean;
      businessName?: string;
      tradeName?: string;
      status?: string;
      message?: string;
    }>('/api/verify-gst', {
      method: 'POST',
      body: JSON.stringify({ gstin }),
    }),
  me: (token: string) =>
    apiFetch<{ user: AppUser }>('/api/auth/me', { token }),
  updateAddress: (token: string, address: string) =>
    apiFetch<{ ok: true }>('/api/auth/me/address', {
      method: 'PATCH',
      token,
      body: JSON.stringify({ address }),
    }),
  changePassword: (token: string, oldPassword: string, newPassword: string) =>
    apiFetch<{ ok: true }>('/api/auth/me/password', {
      method: 'PATCH',
      token,
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
  checkIp: () =>
    apiFetch<{ blocked: boolean }>('/api/auth/check-ip', { cache: 'no-store' }),

  // Admin operations
  fetchBuyersAdmin: (token: string) =>
    apiFetch<{ buyers: { id: string; name: string; email?: string; phone: string; orders: number; isBlocked: boolean }[] }>(
      '/api/auth/buyers',
      { token },
    ),
  toggleBlockBuyer: (token: string, buyerId: string, isBlocked: boolean) =>
    apiFetch<{ ok: boolean }>(`/api/auth/buyers/${encodeURIComponent(buyerId)}/block`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ isBlocked }),
    }),
  fetchBuyerIps: (token: string, buyerId: string) =>
    apiFetch<{ ips: { id: string; ipAddress: string; detectedAt: string; source: string }[] }>(`/api/auth/buyers/${encodeURIComponent(buyerId)}/ips`, {
      token,
    }),
  createAdmin: (token: string, payload: { name: string; email: string; password: string }) =>
    apiFetch<{ ok: true; admin: any }>('/api/auth/admins', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
  fetchAdmins: (token: string) =>
    apiFetch<{ admins: { id: string; email: string; name: string }[] }>('/api/auth/admins', { token }),
  fetchAdminActivity: (token: string, adminId: string) =>
    apiFetch<{ logs: any[] }>(`/api/auth/admins/${encodeURIComponent(adminId)}/activity`, { token }),
  deleteAdmin: (token: string, adminId: string) =>
    apiFetch<{ ok: true }>(`/api/auth/admins/${encodeURIComponent(adminId)}`, {
      method: 'DELETE',
      token,
    }),
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
  fetchUrls: () => apiFetch<{ urls: string[]; banners: { id: string; image_url: string; redirect_url: string; sort_order: number }[] }>('/api/banners', { cache: 'no-store' }),
  fetchAllAdmin: (token: string) =>
    apiFetch<{ urls: string[]; banners: { id: string; image_url: string; redirect_url: string; sort_order: number }[] }>('/api/banners', {
      token,
      cache: 'no-store',
    }),
  add: (token: string, imageUrl: string, redirectUrl: string, sortOrder?: number) =>
    apiFetch<{ ok: true }>('/api/banners', {
      method: 'POST',
      token,
      body: JSON.stringify({ imageUrl, redirectUrl, sortOrder }),
    }),
  delete: (token: string, id: string) =>
    apiFetch<{ ok: true }>(`/api/banners/${encodeURIComponent(id)}`, { method: 'DELETE', token }),
  reorder: (token: string, orderedIds: string[]) =>
    apiFetch<{ ok: true }>('/api/banners/reorder', {
      method: 'PATCH',
      token,
      body: JSON.stringify({ orderedIds }),
    }),
};

export const categoryApi = {
  fetchCategories: () =>
    apiFetch<{ categories: Category[] }>(`/api/categories?t=${Date.now()}`, { cache: 'no-store' }),
  upsertCategory: (token: string, name: string, icon?: string) =>
    apiFetch<{ ok: true; category: Category }>('/api/categories', {
      method: 'POST',
      token,
      body: JSON.stringify({ name, icon }),
    }),
  deleteCategory: (token: string, key: string) =>
    apiFetch<{ ok: true }>(`/api/categories/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      token,
    }),
};

export const collectionApi = {
  create: (productIds: string[]) =>
    apiFetch<{ id: string }>('/api/collections', {
      method: 'POST',
      body: JSON.stringify({ productIds }),
    }),
  fetchById: (id: string) =>
    apiFetch<{ products: Product[] }>(`/api/collections/${encodeURIComponent(id)}`),
};

