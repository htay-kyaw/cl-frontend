'use client';

import { useT } from '@/components/Providers';
import { formatPrice } from '@/lib/links';
import { lineKey } from '@/store/cartStore';

// Items + totals + Place Order; pinned on mobile, sticky card on desktop
export default function OrderSummary({ items, subtotal, discount, promotion, fee, total, hint, error, disabled, placing, onPlace }) {
  const t = useT();
  const mmk = (v) => `${formatPrice(Math.round(v))} ${t('mmk')}`;

  const row = (label, value, className = '') => (
    <div className={`flex items-center justify-between gap-3 text-sm ${className}`}>
      <span className="text-text-secondary">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );

  return (
    <>
      {/* desktop card with the item list */}
      <aside className="hidden md:sticky md:top-24 md:flex md:flex-col md:gap-3 md:rounded-2xl md:border md:border-border md:bg-card md:p-5">
        <ul className="flex max-h-60 flex-col gap-2 overflow-y-auto border-b border-border pb-3">
          {items.map(i => (
            <li key={lineKey(i)} className="flex justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="line-clamp-1">{i.name}</span>
                {i.variantLabel && <span className="block text-xs text-text-secondary">{i.variantLabel}</span>}
              </span>
              <span className="shrink-0 text-text-secondary">× {i.quantity}</span>
            </li>
          ))}
        </ul>
        {totals()}
        {action()}
      </aside>

      {/* mobile: totals + button pinned to the bottom */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-2 border-t border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:hidden">
        {totals()}
        {action()}
      </div>
    </>
  );

  function totals() {
    return (
      <div className="flex flex-col gap-1">
        {row(t('subtotal'), mmk(subtotal))}
        {discount > 0 && row(`${t('discount')} (${promotion.name})`, <span className="text-success">−{mmk(discount)}</span>)}
        {row(t('delivery_fee'), mmk(fee))}
        <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
          <span className="font-semibold">{t('total')}</span>
          <span className="text-lg font-bold text-primary">{mmk(total)}</span>
        </div>
      </div>
    );
  }

  function action() {
    return (
      <div className="flex flex-col gap-1.5">
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {!error && hint && <p className="text-xs text-text-secondary">{hint}</p>}
        <button
          type="button"
          onClick={onPlace}
          disabled={disabled || placing}
          className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-primary font-bold text-white disabled:opacity-50"
        >
          {placing && <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {t('place_order')}
        </button>
      </div>
    );
  }
}
