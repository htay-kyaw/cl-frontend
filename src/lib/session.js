import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';

// Sanctum token lives in an httpOnly cookie — never readable by browser JS.
const TOKEN_COOKIE = 'cl_token';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function getToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

const tokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: MAX_AGE,
});

// Only callable from Server Actions / Route Handlers
export async function setToken(token) {
  (await cookies()).set(TOKEN_COOKIE, token, tokenCookieOptions());
}

// For a Route Handler that returns its own response (e.g. a redirect)
export function setTokenOn(response, token) {
  response.cookies.set(TOKEN_COOKIE, token, tokenCookieOptions());
}

export async function clearToken() {
  (await cookies()).delete(TOKEN_COOKIE);
}

// Current user for this request, or null when signed out / token revoked.
// cache() dedupes the profile call across components in one render.
export const getCurrentUser = cache(async () => {
  if (!(await getToken())) return null;

  const { profileApi, ApiError } = await import('./api');
  try {
    return await profileApi.get();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
});
