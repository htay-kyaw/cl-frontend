'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Ported from the mobile app's cartStore; persisted in localStorage.
// A cart line is identified by product id + variant id (null when the product has no variants).
const sameLine = (item, productId, variantId) => item.id === productId && (item.variantId ?? null) === variantId;

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
