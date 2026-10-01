'use server';

import { ApiError, catalogApi } from '@/lib/api';

const MAX_LINES = 50;

// Re-reads every product in the cart so prices, stock and availability are current.
// lines: [{ id, variantId }] → { [`${id}-${variantId ?? 'x'}`]: { status: 'ok', ... } | { status: 'gone' } }
export async function syncCartLines(lines) {
  if (!Array.isArray(lines)) return {};

  const valid = lines
    .slice(0, MAX_LINES)
    .filter(l => Number.isInteger(l?.id) && (l.variantId == null || Number.isInteger(l.variantId)));

  const productIds = [...new Set(valid.map(l => l.id))];
  const products = new Map(await Promise.all(productIds.map(async (id) => {
    try {
      return [id, await catalogApi.product(id)];
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return [id, null]; // deleted or deactivated
      throw e;
    }
  })));

  const result = {};
  for (const { id, variantId } of valid) {
    const key = `${id}-${variantId ?? 'x'}`;
    const product = products.get(id);
    const variant = variantId != null ? product?.variants?.find(v => v.id === variantId) : null;

    if (!product || (variantId != null && !variant)) {
      result[key] = { status: 'gone' };
    } else if (variant) {
      result[key] = { status: 'ok', name: product.name, image: product.image, sell_price: variant.price, stock: variant.stock, is_in_stock: variant.is_in_stock };
    } else {
      result[key] = { status: 'ok', name: product.name, image: product.image, sell_price: product.sell_price, stock: product.stock, is_in_stock: product.is_in_stock };
    }
  }
  return result;
}
