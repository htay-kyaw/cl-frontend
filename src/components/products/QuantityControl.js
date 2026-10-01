'use client';

import { IoAdd, IoRemove } from 'react-icons/io5';
import useCartStore, { useCartHydrated } from '@/store/cartStore';
import { useT } from '../Providers';

// Add to Cart button that turns into a − qty + counter, like the mobile app.
// item: the purchasable line (product or chosen variant) with id, variantId, stock, is_in_stock.
export default function QuantityControl({ item, size = 'md' }) {
  const t        = useT();
  const hydrated = useCartHydrated();
  const variantId = item.variantId ?? null;
  const quantity = useCartStore(s => s.items.find(i => i.id === item.id && (i.variantId ?? null) === variantId)?.quantity ?? 0);
  const addItem  = useCartStore(s => s.addItem);
  const updateQuantity = useCartStore(s => s.updateQuantity);

  const box = size === 'lg' ? 'h-12 rounded-xl text-[15px]' : 'h-9 rounded-lg text-xs';

  if (!item.is_in_stock) {
    return <div className={`flex items-center justify-center bg-border text-text-secondary ${box}`}>{t('out_of_stock')}</div>;
  }

  if (!hydrated || quantity === 0) {
    return (
      <button type="button" onClick={() => addItem(item)} className={`w-full bg-primary font-bold text-white ${box}`}>
        {t('add_to_cart')}
      </button>
    );
  }

  // stock is checked again when the order is placed; this just stops obvious over-ordering
  const atMax = item.stock != null && quantity >= item.stock;
  const btn = 'flex aspect-square h-full items-center justify-center rounded-md border border-primary bg-white text-primary disabled:opacity-40';

  return (
    <div className={`flex items-center justify-between bg-primary-light p-1 ${box}`}>
      <button type="button" aria-label="−" onClick={() => updateQuantity(item.id, quantity - 1, variantId)} className={btn}>
        <IoRemove size={16} />
      </button>
      <span className="min-w-6 text-center font-bold text-primary" aria-live="polite">{quantity}</span>
      <button type="button" aria-label="+" onClick={() => addItem(item)} disabled={atMax} className={btn}>
        <IoAdd size={16} />
      </button>
    </div>
  );
}
