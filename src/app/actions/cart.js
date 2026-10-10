'use server';

import { ApiError, catalogApi } from '@/lib/api';
import { decodeCart } from '@/lib/cart-link';
import { getT } from '@/lib/preferences';

const MAX_LINES = 50;

// id → product, or null when deleted or deactivated
async function loadProducts(ids) {
  return new Map(await Promise.all([...new Set(ids)].map(async (id) => {
    try {
      return [id, await catalogApi.product(id)];
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return [id, null];
      throw e;
    }
  })));
}

// Re-reads every product in the cart so prices, stock and availability are current.
// lines: [{ id, variantId }] → { [`${id}-${variantId ?? 'x'}`]: { status: 'ok', ... } | { status: 'gone' } }
export async function syncCartLines(lines) {
  if (!Array.isArray(lines)) return {};

  const valid = lines
    .slice(0, MAX_LINES)
    .filter(l => Number.isInteger(l?.id) && (l.variantId == null || Number.isInteger(l.variantId)));

  const products = await loadProducts(valid.map(l => l.id));

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

// Rebuilds full cart lines from a carried-over cart link (see lib/cart-link.js).
// Lines that no longer exist or are sold out are dropped; quantities are capped at stock.
export async function importCartLines(encoded) {
  const lines = decodeCart(encoded);
  if (!lines.length) return [];

  const [products, t] = await Promise.all([loadProducts(lines.map(l => l.id)), getT()]);

  return lines.flatMap(({ id, variantId, quantity }) => {
    const product = products.get(id);
    if (!product) return [];

    // a product with options must come back with one of them, and vice versa
    const variants = product.variants ?? [];
    const variant  = variantId != null ? variants.find(v => v.id === variantId) : null;
    if (variantId != null ? !variant : variants.length > 0) return [];

    const source = variant ?? product;
    if (!source.is_in_stock || source.stock <= 0) return [];

    // same label the product page puts on the line: "Color: Grey · Power: -2.00"
    const optionName = variant && (variant.attribute_name ?? variants.find(v => v.attribute_name)?.attribute_name ?? t('option'));
    const variantLabel = variant && (variant.options?.length
      ? variant.options.map(o => `${o.type}: ${o.value}`).join(' · ')
      : `${optionName}: ${variant.value}`);

    return [{
      id:          product.id,
      variantId:   variant?.id ?? null,
      ...(variant && { variantLabel }),
      name:        product.name,
      image:       product.image,
      sell_price:  variant ? variant.price : product.sell_price,
      stock:       source.stock,
      is_in_stock: true,
      quantity:    Math.min(quantity, source.stock),
    }];
  });
}
