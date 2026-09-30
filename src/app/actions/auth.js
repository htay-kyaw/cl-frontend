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

async function updateProfileField(field, formData) {
  if (!(await getToken())) return { ok: false, message: 'Please sign in first.' };

  const value = String(formData.get(field) ?? '').trim();
  try {
    await profileApi.update({ [field]: value });
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: e.errors?.[field]?.[0] ?? e.message };
    }
    throw e;
  }
}

// Google accounts have no phone; one is required before placing an order
export async function savePhone(_prevState, formData) {
  return updateProfileField('phone', formData);
}

export async function saveName(_prevState, formData) {
  return updateProfileField('name', formData);
}
