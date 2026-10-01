import 'server-only';
import { headers } from 'next/headers';
import { getToken } from './session';

// Laravel API — called only from the Next.js server (server components / Server Actions).
// Endpoints mirror the mobile app's api.js.
const API_URL = process.env.API_URL;

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `API request failed (${status})`);
    this.status = status;
    this.errors = body?.errors ?? null;
  }
}

async function request(method, path, { body, query } = {}) {
  const url = new URL(API_URL + path);
  Object.entries(query ?? {}).forEach(([k, v]) => v != null && v !== '' && url.searchParams.set(k, v));

  const reqHeaders = { Accept: 'application/json' };

  const token = await getToken();
  if (token) reqHeaders.Authorization = `Bearer ${token}`;

  // pass the visitor's IP so Laravel rate-limits per visitor (see TRUSTED_PROXIES)
  const forwardedFor = (await headers()).get('x-forwarded-for');
  if (forwardedFor) reqHeaders['X-Forwarded-For'] = forwardedFor;

  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
    reqHeaders['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { method, headers: reqHeaders, body: payload, cache: 'no-store' });
  const json = await res.json().catch(() => null);

  if (!res.ok) throw new ApiError(res.status, json);
  return json?.data;
}

const get  = (path, query)  => request('GET', path, { query });
const post = (path, body)   => request('POST', path, { body });
const put  = (path, body)   => request('PUT', path, { body });
const del  = (path)         => request('DELETE', path);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  google: (credential) => post('/auth/google', { credential }),
  logout: ()           => post('/auth/logout'),
};

// ── Catalog ───────────────────────────────────────────────────────────────────
export const catalogApi = {
  banners:       ()       => get('/banners'),
  announcements: ()       => get('/announcements'),
  categories:    ()       => get('/categories'),
  products:      (params) => get('/products', params),
  product:       (id)     => get(`/products/${id}`),
  filters:       (params) => get('/products/filters', params),
};

// ── Delivery / bank ───────────────────────────────────────────────────────────
export const deliveryApi = { zones: () => get('/delivery-zones') };
export const bankApi     = { list:  () => get('/bank-accounts') };

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  get:    ()     => get('/profile'),
  update: (name) => put('/profile', { name }),
};

// ── Phone numbers (one is primary) ────────────────────────────────────────────
export const phoneApi = {
  list:        ()      => get('/phones'),
  add:         (phone) => post('/phones', { phone }),
  makePrimary: (id)    => post(`/phones/${id}/primary`),
  remove:      (id)    => del(`/phones/${id}`),
};

// ── Loyalty ───────────────────────────────────────────────────────────────────
export const loyaltyApi = { promotions: () => get('/promotions') };

// ── Addresses ─────────────────────────────────────────────────────────────────
export const addressApi = {
  list:    ()         => get('/addresses'),
  create:  (data)     => post('/addresses', data),
  update:  (id, data) => put(`/addresses/${id}`, data),
  destroy: (id)       => del(`/addresses/${id}`),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  list:          (params)   => get('/orders', params),          // { group: 'active' | 'history', page }
  archived:      (params)   => get('/orders/archived', params), // { page }
  get:           (id)       => get(`/orders/${id}`),
  place:         (data)     => post('/orders', data),
  cancel:        (id)       => post(`/orders/${id}/cancel`),
  archive:       (id)       => post(`/orders/${id}/archive`),
  unarchive:     (id)       => post(`/orders/${id}/unarchive`),
  requestReturn: (id, data) => post(`/orders/${id}/return`, data),
};

// ── Uploads ───────────────────────────────────────────────────────────────────
export const uploadApi = {
  // file: a File from a Server Action's FormData
  screenshot: (file) => {
    const form = new FormData();
    form.append('image', file);
    return post('/upload/screenshot', form);
  },
};
