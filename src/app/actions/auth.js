'use server';

import { redirect } from 'next/navigation';
import { authApi } from '@/lib/api';
import { clearToken, getToken } from '@/lib/session';

// Signing in happens in the /auth/google route handlers (redirect flow)

export async function signOut() {
  if (await getToken()) {
    // token may already be revoked; clear the cookie either way
    await authApi.logout().catch(() => {});
  }
  await clearToken();
  redirect('/');
}
