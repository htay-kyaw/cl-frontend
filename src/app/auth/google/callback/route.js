import { NextResponse } from 'next/server';
import { ApiError, authApi } from '@/lib/api';
import { OAUTH_COOKIE, exchangeCode } from '@/lib/google-oauth';
import { safeRedirect } from '@/lib/safe-redirect';
import { setTokenOn } from '@/lib/session';

function readCookie(request) {
  try {
    return JSON.parse(request.cookies.get(OAUTH_COOKIE)?.value ?? 'null');
  } catch {
    return null;
  }
}

// Google sends the shopper back here with ?code=…&state=…
export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const saved  = readCookie(request);
  const next   = safeRedirect(saved?.next);

  const back = (path) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    response.cookies.delete({ name: OAUTH_COOKIE, path: '/auth/google' });
    return response;
  };
  const loginPage = (error) => back(`/login?next=${encodeURIComponent(next)}${error ? `&error=${error}` : ''}`);

  // closed Google's account chooser: just show the sign-in page again
  if (params.get('error') === 'access_denied') return loginPage();

  const code = params.get('code');
  if (!saved || !code || params.get('state') !== saved.state) return loginPage('google');

  try {
    const idToken = await exchangeCode(request.nextUrl.origin, code, saved.verifier);
    const { token, user } = await authApi.google(idToken);
    const response = back(user.phone ? next : `/phone?next=${encodeURIComponent(next)}`);
    setTokenOn(response, token);
    return response;
  } catch (e) {
    console.error('Google sign-in failed:', e instanceof ApiError ? `${e.status} ${e.message}` : e);
    return loginPage('google');
  }
}
