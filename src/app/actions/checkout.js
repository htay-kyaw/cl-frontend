'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, addressApi, orderApi, uploadApi } from '@/lib/api';
import { getToken } from '@/lib/session';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // images are compressed in the browser first; keep under next.config's limit

const fail = (e) => {
  if (e instanceof ApiError) {
    const firstError = e.errors && Object.values(e.errors)[0]?.[0];
    return { ok: false, message: firstError || e.message };
  }
  throw e;
};

// formData: { image: File } → { ok, url } (a Cloudinary URL in our payments folder)
export async function uploadPaymentScreenshot(formData) {
  if (!(await getToken())) return { ok: false, message: 'Please sign in first.' };

  const file = formData.get('image');
  if (!(file instanceof File) || !file.type.startsWith('image/')) return { ok: false, message: 'Please choose an image.' };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, message: 'Image is too large.' };

  try {
    const { url } = await uploadApi.screenshot(file);
    return { ok: true, url };
  } catch (e) {
    return fail(e);
  }
}

const int = (v) => (Number.isInteger(v) && v > 0 ? v : undefined);
const text = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined);

// The backend re-validates everything (zone payment rules, stock, prices, points).
export async function placeOrder(input) {
  if (!(await getToken())) return { ok: false, message: 'Please sign in first.' };

  const items = Array.isArray(input?.items)
    ? input.items.slice(0, 50).map(i => ({ product_id: int(i.id), variant_id: int(i.variantId), quantity: int(i.quantity) }))
    : [];
  if (items.length === 0 || items.some(i => !i.product_id || !i.quantity)) {
    return { ok: false, message: 'Your cart is empty.' };
  }

  const order = {
    delivery_zone_id:   int(input.zoneId),
    house_no:           text(input.houseNo, 100),
    street:             text(input.street, 255),
    payment_method:     input.method === 'screenshot' ? 'screenshot' : 'cod',
    payment_screenshot: input.method === 'screenshot' ? text(input.screenshotUrl, 500) : undefined,
    promotion_id:       int(input.promotionId),
    notes:              text(input.notes, 500),
    items,
  };

  let placed;
  try {
    placed = await orderApi.place(order);
  } catch (e) {
    return fail(e);
  }

  // best effort: remember a newly typed address for next time
  if (input.saveAddress) {
    await addressApi.create({ delivery_zone_id: order.delivery_zone_id, house_no: order.house_no, street: order.street }).catch(() => {});
  }

  revalidatePath('/orders');
  return { ok: true, orderId: placed.id };
}
