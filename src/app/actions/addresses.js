'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, addressApi } from '@/lib/api';
import { getToken } from '@/lib/session';

async function run(call) {
  if (!(await getToken())) return { ok: false, message: 'Please sign in first.' };
  try {
    await call();
  } catch (e) {
    if (e instanceof ApiError) {
      const firstError = e.errors && Object.values(e.errors)[0]?.[0];
      return { ok: false, message: firstError || e.message };
    }
    throw e;
  }
  revalidatePath('/addresses');
  revalidatePath('/profile');
  return { ok: true };
}

const text = (formData, name, max) => {
  const v = String(formData.get(name) ?? '').trim();
  return v ? v.slice(0, max) : null;
};

// create (no id) or update (id) from the address form
export async function saveAddress(_prevState, formData) {
  const id = Number(formData.get('id')) || null;
  const data = {
    delivery_zone_id: Number(formData.get('delivery_zone_id')) || undefined,
    house_no: text(formData, 'house_no', 100),
    street: text(formData, 'street', 255),
    is_default: formData.get('is_default') === 'on',
  };
  if (!data.delivery_zone_id) return { ok: false, message: 'Please choose a delivery zone.' };

  return run(() => (id ? addressApi.update(id, data) : addressApi.create(data)));
}

export async function makeDefaultAddress(id) {
  return run(() => addressApi.update(Number(id), { is_default: true }));
}

export async function deleteAddress(id) {
  return run(() => addressApi.destroy(Number(id)));
}
