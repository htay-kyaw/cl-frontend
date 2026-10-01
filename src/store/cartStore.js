'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Ported from the mobile app's cartStore; persisted in localStorage.
// A cart line is identified by product id + variant id (null when the product has no variants).
const sameLine = (item, productId, variantId) => item.id === productId && (item.variantId ?? null) === variantId;

// matches the keys returned by the syncCartLines server action
export const lineKey = (item) => `${item.id}-${item.variantId ?? 'x'}`;

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const variantId = product.variantId ?? null;
        const items     = get().items;
        if (items.some(i => sameLine(i, product.id, variantId))) {
          set({ items: items.map(i => sameLine(i, product.id, variantId) ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ items: [...items, { ...product, variantId, quantity: 1 }] });
        }
      },

      removeItem: (productId, variantId = null) => {
        set({ items: get().items.filter(i => !sameLine(i, productId, variantId)) });
      },

      updateQuantity: (productId, quantity, variantId = null) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({ items: get().items.map(i => sameLine(i, productId, variantId) ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [] }),

      // Apply fresh product data from syncCartLines(); returns what changed so the UI can say so
      applySync: (updates) => {
        const changes = { priceChanged: [], reduced: [], removed: [] };
        const items = [];

        for (const item of get().items) {
          const update = updates[lineKey(item)];
          if (!update) { items.push(item); continue; } // not checked (e.g. over the limit)

          if (update.status === 'gone' || !update.is_in_stock || update.stock <= 0) {
            changes.removed.push(item.name);
            continue;
          }
          if (update.sell_price !== item.sell_price) changes.priceChanged.push(update.name);

          const quantity = Math.min(item.quantity, update.stock);
          if (quantity < item.quantity) changes.reduced.push(update.name);

          const { name, image, sell_price, stock, is_in_stock } = update;
          items.push({ ...item, name, image, sell_price, stock, is_in_stock, quantity });
        }

        set({ items });
        return changes;
      },
    }),
    { name: 'eichit-cart', skipHydration: true }
  )
);

export const selectTotalItems = state => state.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectTotalPrice = state => state.items.reduce((sum, i) => sum + i.sell_price * i.quantity, 0);

// The server has no cart (and no persist API — there's no localStorage there),
// so load localStorage only after mount to avoid hydration mismatches.
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.resolve(useCartStore.persist.rehydrate()).then(() => alive && setHydrated(true));
    return () => { alive = false; };
  }, []);
  return hydrated;
}

export default useCartStore;
