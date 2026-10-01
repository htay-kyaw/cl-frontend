'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, orderApi } from '@/lib/api';
import { getToken } from '@/lib/session';

async function run(id, call) {
  if (!(await getToken())) return { ok: false, message: 'Please sign in first.' };
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) return { ok: false, message: 'Order not found.' };

  try {
    await call(orderId);
  } catch (e) {
    if (e instanceof ApiError) {
      const firstError = e.errors && Object.values(e.errors)[0]?.[0];
      return { ok: false, message: firstError || e.message };
    }
    throw e;
  }

  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  return { ok: true };
}

export async function cancelOrder(id) {
  return run(id, orderApi.cancel);
}

export async function archiveOrder(id) {
  return run(id, orderApi.archive);
}

export async function unarchiveOrder(id) {
  return run(id, orderApi.unarchive);
}
