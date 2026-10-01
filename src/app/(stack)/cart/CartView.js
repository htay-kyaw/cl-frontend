'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoAdd, IoCartOutline, IoInformationCircleOutline, IoRemove, IoTrashOutline } from 'react-icons/io5';
import { syncCartLines } from '@/app/actions/cart';
import EmptyState from '@/components/EmptyState';
import { useT } from '@/components/Providers';
import Skeleton from '@/components/Skeleton';
import { formatPrice } from '@/lib/links';
import useCartStore, { lineKey, selectTotalPrice, useCartHydrated } from '@/store/cartStore';

// checkoutHref depends on auth: /checkout, or via /login or /phone first
export default function CartView({ checkoutHref }) {
  const t        = useT();
  const hydrated = useCartHydrated();
  const items    = useCartStore(s => s.items);
  const total    = useCartStore(selectTotalPrice);
  const { updateQuantity, removeItem, applySync } = useCartStore.getState();

  const [notice, setNotice]   = useState(null);
  const [syncing, setSyncing] = useState(true);
  const synced = useRef(false);

  // once per visit: refresh prices/stock saved in the browser against the live catalog
  useEffect(() => {
    if (!hydrated || synced.current) return;
    synced.current = true;

    const lines = useCartStore.getState().items.map(i => ({ id: i.id, variantId: i.variantId ?? null }));

    (lines.length ? syncCartLines(lines) : Promise.resolve({}))
      .then(updates => {
        const { priceChanged, reduced, removed } = applySync(updates);
        const messages = [
          removed.length && t('cart_removed', { names: removed.join(', ') }),
          reduced.length && t('cart_reduced', { names: reduced.join(', ') }),
          priceChanged.length && t('cart_price_changed', { names: priceChanged.join(', ') }),
        ].filter(Boolean);
        if (messages.length) setNotice(messages);
      })
      .catch(() => { /* keep the saved cart; the order is re-validated by the server anyway */ })
      .finally(() => setSyncing(false));
  }, [hydrated, applySync, t]);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-3 p-4 md:px-0" aria-busy="true">
        {[0, 1].map(i => <Skeleton key={i} className="h-[92px] rounded-xl" />)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        {notice && <Notice messages={notice} />}
        <EmptyState Icon={IoCartOutline} title={t('empty_cart')} subtitle={t('empty_cart_sub')}>
          <Link href="/products" className="mt-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white">
            {t('browse_products')}
          </Link>
        </EmptyState>
      </>
    );
  }

  return (
    <div className="pb-40 md:grid md:grid-cols-[1fr_320px] md:items-start md:gap-8 md:pb-0">
      <div className="flex flex-col gap-3 p-4 md:p-0">
        {notice && <Notice messages={notice} />}

        <ul className="flex flex-col gap-3">
          {items.map(item => {
            const atMax = item.stock != null && item.quantity >= item.stock;
            return (
              <li key={lineKey(item)} className="flex overflow-hidden rounded-xl border border-border bg-card">
                <Link href={`/products/${item.id}`} className="relative h-[92px] w-[92px] shrink-0 bg-surface">
                  {item.image && <Image src={item.image} alt={item.name} fill sizes="92px" className="object-cover" />}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col p-2.5">
                  <Link href={`/products/${item.id}`} className="line-clamp-2 text-sm font-medium hover:underline">{item.name}</Link>
                  {item.variantLabel && <p className="text-xs text-text-secondary">{item.variantLabel}</p>}
                  <p className="mt-0.5 text-sm font-bold text-primary">{formatPrice(item.sell_price)} {t('mmk')}</p>

                  <div className="mt-auto flex items-center gap-3 pt-1.5">
                    <button
                      type="button"
                      aria-label="−"
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId ?? null)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface"
                    >
                      <IoRemove size={16} />
                    </button>
                    <span className="min-w-5 text-center font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="+"
                      disabled={atMax}
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId ?? null)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface disabled:opacity-40"
                    >
                      <IoAdd size={16} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id, item.variantId ?? null)}
                  aria-label={t('remove')}
                  className="px-3 text-danger"
                >
                  <IoTrashOutline size={20} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* pinned summary on mobile, sticky card on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:sticky md:top-24 md:rounded-2xl md:border">
        <div className="mb-3 flex items-center justify-between">
          <span>{t('total')}</span>
          <span className="text-lg font-bold text-primary">{formatPrice(total)} {t('mmk')}</span>
        </div>
        <p className="mb-3 text-xs text-text-secondary">{t('delivery_fee_at_checkout')}</p>
        <Link
          href={checkoutHref}
          aria-disabled={syncing}
          className={`flex h-[52px] items-center justify-center rounded-2xl bg-primary font-bold text-white ${syncing ? 'pointer-events-none opacity-60' : ''}`}
        >
          {t('checkout')}
        </Link>
      </div>
    </div>
  );
}

function Notice({ messages }) {
  return (
    <div role="status" className="flex gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
      <IoInformationCircleOutline size={20} className="shrink-0 text-warning" />
      <div className="flex flex-col gap-0.5">
        {messages.map(m => <p key={m}>{m}</p>)}
      </div>
    </div>
  );
}
