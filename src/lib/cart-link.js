// The cart lives in each browser's localStorage, so when a shopper moves from Telegram's
// in-app browser to Chrome/Safari we carry it in the link: "12.x.2,15.40.1"
// (product id . variant id or x . quantity). Prices and names are re-read from the API on arrival.
export const MAX_CART_LINES = 50;

export function encodeCart(items) {
  return items
    .slice(0, MAX_CART_LINES)
    .map(i => `${i.id}.${i.variantId ?? 'x'}.${i.quantity}`)
    .join(',');
}

export function decodeCart(value) {
  if (typeof value !== 'string') return [];

  return value.split(',').slice(0, MAX_CART_LINES).flatMap((part) => {
    const match = /^(\d+)\.(\d+|x)\.(\d+)$/.exec(part);
    if (!match) return [];
    const quantity = Number(match[3]);
    if (quantity < 1) return [];
    return [{ id: Number(match[1]), variantId: match[2] === 'x' ? null : Number(match[2]), quantity }];
  });
}
