import 'server-only';
import { createHash, randomBytes } from 'node:crypto';

// Google sign-in via the standard redirect (authorization code + PKCE) flow, so the
// button is our own design instead of Google's iframe. The ID token Google returns is
// sent to Laravel exactly like before (POST /auth/google), which verifies it.
const AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export const OAUTH_COOKIE = 'g_oauth';
export const OAUTH_COOKIE_MAX_AGE = 60 * 10; // the round trip to Google must finish within 10 minutes

const clientId = () => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Must be listed under "Authorized redirect URIs" of the OAuth client in Google Cloud Console
export const redirectUri = (origin) => `${origin}/auth/google/callback`;

const base64url = (buf) => buf.toString('base64url');

// state guards against CSRF, the verifier (PKCE) against a stolen code
export function startSignIn(origin) {
  const state    = base64url(randomBytes(24));
  const verifier = base64url(randomBytes(32));

  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id:             clientId(),
    redirect_uri:          redirectUri(origin),
    response_type:         'code',
    scope:                 'openid email profile',
    state,
    code_challenge:        base64url(createHash('sha256').update(verifier).digest()),
    code_challenge_method: 'S256',
    prompt:                'select_account',
  }).toString();

  return { url: url.toString(), state, verifier };
}

// Exchanges the code Google sent back for an ID token
export async function exchangeCode(origin, code, verifier) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     clientId(),
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      code_verifier: verifier,
      grant_type:    'authorization_code',
      redirect_uri:  redirectUri(origin),
    }),
    cache: 'no-store',
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.id_token) {
    throw new Error(`Google token exchange failed (${res.status}): ${json?.error ?? 'no id_token'}`);
  }
  return json.id_token;
}
