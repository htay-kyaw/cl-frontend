'use server';

import { redirect } from 'next/navigation';
import { ApiError, authApi, profileApi } from '@/lib/api';
import { clearToken, getToken, setToken } from '@/lib/session';

// credential: the Google ID token from the "Sign in with Google" button
export async function signInWithGoogle(credential) {
  if (typeof credential !== 'string' || !credential) {
    return { ok: false, message: 'Missing Google credential.' };
  }

  try {
    const { token, is_new, user } = await authApi.google(credential);
    await setToken(token);
    return { ok: true, isNew: is_new, needsPhone: !user.phone };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

export async function signOut() {
  if (await getToken()) {
    // token may already be revoked; clear the cookie either way
    await authApi.logout().catch(() => {});
  }
  await clearToken();
  redirect('/');
}

// Google accounts have no phone; one is required before placing an order
export async function savePhone(_prevState, formData) {
  if (!(await getToken())) return { ok: false, message: 'Please sign in first.' };

  const phone = String(formData.get('phone') ?? '').trim();
  try {
    await profileApi.update({ phone });
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: e.errors?.phone?.[0] ?? e.message };
    }
    throw e;
  }
}
