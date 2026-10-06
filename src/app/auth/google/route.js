import { NextResponse } from 'next/server';
import { OAUTH_COOKIE, OAUTH_COOKIE_MAX_AGE, startSignIn } from '@/lib/google-oauth';
import { safeRedirect } from '@/lib/safe-redirect';

// "Continue with Google" links here; we remember where to return and hand off to Google
export function GET(request) {
  const next = safeRedirect(request.nextUrl.searchParams.get('next'));
  const { url, state, verifier } = startSignIn(request.nextUrl.origin);

  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_COOKIE, JSON.stringify({ state, verifier, next }), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax', // sent on Google's top-level redirect back to us
    path:     '/auth/google',
    maxAge:   OAUTH_COOKIE_MAX_AGE,
  });
  return response;
}
