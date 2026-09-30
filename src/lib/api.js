import axios from 'axios';

// Same Laravel API as the mobile app — endpoints mirror mobile/src/services/api.js
const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Sanctum bearer token, kept in localStorage on web (SecureStore on mobile)
export const tokenStorage = {
  get:   ()      => (typeof window === 'undefined' ? null : localStorage.getItem('auth_token')),
  set:   (token) => localStorage.setItem('auth_token', token),
  clear: ()      => { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); },
};

client.interceptors.request.use(config => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// token invalid → clear it; auth-aware UI reacts to the missing token
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && typeof window !== 'undefined') tokenStorage.clear();
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  sendOtp:   (phone)             => client.post('/auth/send-otp',   { phone }),
  verifyOtp: (phone, code, name) => client.post('/auth/verify-otp', { phone, code, name }),
  logout:    ()                  => client.post('/auth/logout'),
};

// ── Catalog ───────────────────────────────────────────────────────────────────
export const catalogApi = {
  banners:       ()       => client.get('/banners'),
  announcements: ()       => client.get('/announcements'),
  categories:    ()       => client.get('/categories'),
  products:      (params) => client.get('/products', { params }),
  product:       (id)     => client.get(`/products/${id}`),
  filters:       (params) => client.get('/products/filters', { params }),
};

// ── Delivery / bank ───────────────────────────────────────────────────────────
export const deliveryApi = { zones: () => client.get('/delivery-zones') };
export const bankApi     = { list:  () => client.get('/bank-accounts') };

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  get:    ()     => client.get('/profile'),
  update: (name) => client.put('/profile', { name }),
};

// ── Loyalty ───────────────────────────────────────────────────────────────────
export const loyaltyApi = { promotions: () => client.get('/promotions') };

// ── Addresses ─────────────────────────────────────────────────────────────────
export const addressApi = {
  list:    ()         => client.get('/addresses'),
  create:  (data)     => client.post('/addresses', data),
  update:  (id, data) => client.put(`/addresses/${id}`, data),
  destroy: (id)       => client.delete(`/addresses/${id}`),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  list:      ()           => client.get('/orders'),
  archived:  ()           => client.get('/orders/archived'),
  get:       (id)         => client.get(`/orders/${id}`),
  place:     (data)       => client.post('/orders', data),
  cancel:    (id)         => client.post(`/orders/${id}/cancel`),
  archive:   (id)         => client.post(`/orders/${id}/archive`),
  unarchive: (id)         => client.post(`/orders/${id}/unarchive`),
  requestReturn: (id, data) => client.post(`/orders/${id}/return`, data),
};

// ── Uploads ───────────────────────────────────────────────────────────────────
export const uploadApi = {
  screenshot: (file) => {
    const form = new FormData();
    form.append('image', file);
    return client.post('/upload/screenshot', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default client;
