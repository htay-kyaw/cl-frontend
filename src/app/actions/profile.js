'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, phoneApi, profileApi } from '@/lib/api';
import { getToken } from '@/lib/session';

// Runs an API call for the signed-in user and maps Laravel errors to { ok, message }
async function run(call, field) {
  if (!(await getToken())) return { ok: false, message: 'Please sign in first.' };

  try {
    await call();
    revalidatePath('/profile');
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: (field && e.errors?.[field]?.[0]) || e.message };
    }
    throw e;
  }
}

const field = (formData, name) => String(formData.get(name) ?? '').trim();

export async function saveName(_prevState, formData) {
  return run(() => profileApi.update(field(formData, 'name')), 'name');
}

// Used by the /phone onboarding step and the profile's "add phone" form.
// The first number a user adds becomes their primary number.
export async function addPhone(_prevState, formData) {
  return run(() => phoneApi.add(field(formData, 'phone')), 'phone');
}

export async function makePrimaryPhone(id) {
  return run(() => phoneApi.makePrimary(Number(id)));
}

export async function removePhone(id) {
  return run(() => phoneApi.remove(Number(id)));
}
