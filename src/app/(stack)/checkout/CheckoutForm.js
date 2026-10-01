'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoCallOutline, IoCartOutline } from 'react-icons/io5';
import { placeOrder } from '@/app/actions/checkout';
import EmptyState from '@/components/EmptyState';
import { useT } from '@/components/Providers';
import Skeleton from '@/components/Skeleton';
import useCartStore, { selectTotalPrice, useCartHydrated } from '@/store/cartStore';
import AddressSection from './AddressSection';
import OrderSummary from './OrderSummary';
import PaymentSection from './PaymentSection';
import PromotionSection from './PromotionSection';

export const sectionLabel = 'mb-2 text-[13px] font-semibold uppercase tracking-wide text-text-secondary';

export default function CheckoutForm({ zones, banks, promotions, addresses, phone, points }) {
  const t        = useT();
  const router   = useRouter();
  const hydrated = useCartHydrated();
  const items    = useCartStore(s => s.items);
  const subtotal = useCartStore(selectTotalPrice);

  // address: a saved one (pre-selected default) or a newly typed one
  const usable = addresses.filter(a => zones.some(z => z.id === a.delivery_zone?.id));
  const initial = usable.find(a => a.is_default) ?? usable[0] ?? null;
  const [address, setAddress] = useState(() => ({
    savedId: initial?.id ?? null,
    zoneId:  initial?.delivery_zone.id ?? null,
    houseNo: initial?.house_no ?? '',
    street:  initial?.street ?? '',
    save:    true,
  }));
  const zone = zones.find(z => z.id === address.zoneId) ?? null;

  const [method, setMethod]               = useState(zone && !zone.accepts_cod ? 'screenshot' : 'cod');
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [promotion, setPromotion]         = useState(null);
  const [notes, setNotes]                 = useState('');
  const [error, setError]                 = useState(null);
  const [placing, startPlacing]           = useTransition();

  // switching zone resets payment to what the new zone allows
  const changeAddress = (next) => {
    if (next.zoneId !== address.zoneId) {
      const z = zones.find(x => x.id === next.zoneId);
      setMethod(z && !z.accepts_cod ? 'screenshot' : 'cod');
      setScreenshotUrl(null);
    }
    setAddress(next);
  };

  const fee      = zone?.delivery_fee ?? 0;
  const discount = promotion
    ? Math.min(subtotal * (promotion.discount_percent / 100), promotion.max_discount_amount ?? Infinity)
    : 0;
  const total    = Math.round(subtotal - discount + fee);

  const missing = !zone ? t('checkout_need_zone')
    : method === 'screenshot' && !screenshotUrl ? t('checkout_need_screenshot')
    : null;

  const submit = () => {
    if (missing || placing || uploading) return;
    setError(null);
    startPlacing(async () => {
      const result = await placeOrder({
        zoneId: zone.id,
        houseNo: address.houseNo,
        street: address.street,
        saveAddress: address.savedId == null && address.save,
        method,
        screenshotUrl,
        promotionId: promotion?.id,
        notes,
        items: items.map(i => ({ id: i.id, variantId: i.variantId ?? null, quantity: i.quantity })),
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      useCartStore.getState().clearCart();
      router.replace(`/orders?placed=${result.orderId}`);
    });
  };

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4 p-4 md:px-0" aria-busy="true">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (items.length === 0 && !placing) {
    return (
      <EmptyState Icon={IoCartOutline} title={t('empty_cart')} subtitle={t('empty_cart_sub')}>
        <Link href="/products" className="mt-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white">
          {t('browse_products')}
        </Link>
      </EmptyState>
    );
  }

  return (
    // bottom padding clears the pinned totals + Place Order bar on mobile (~260px with a hint line)
    <div className="pb-[19rem] md:grid md:grid-cols-[1fr_340px] md:items-start md:gap-8 md:pb-0">
      <div className="flex flex-col gap-6 p-4 md:p-0">
        <AddressSection zones={zones} addresses={usable} value={address} onChange={changeAddress} zone={zone} />

        <section>
          <p className={sectionLabel}>{t('contact_phone')}</p>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
            <IoCallOutline size={18} className="text-primary" />
            <span className="flex-1 font-medium">{phone}</span>
            <Link href="/profile" className="text-sm font-semibold text-primary">{t('change')}</Link>
          </div>
        </section>

        {zone && (
          <PaymentSection
            zone={zone}
            banks={banks}
            method={method}
            onMethod={setMethod}
            screenshotUrl={screenshotUrl}
            onScreenshot={setScreenshotUrl}
            onUploading={setUploading}
          />
        )}

        {promotions.length > 0 && (
          <PromotionSection promotions={promotions} points={points} selected={promotion} onSelect={setPromotion} />
        )}

        <section>
          <label htmlFor="notes" className={sectionLabel}>{t('order_notes')}</label>
          <textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder={t('order_notes_placeholder')}
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-[15px] outline-none focus:border-primary"
          />
        </section>
      </div>

      <OrderSummary
        items={items}
        subtotal={subtotal}
        discount={discount}
        promotion={promotion}
        fee={fee}
        total={total}
        hint={missing}
        error={error}
        disabled={!!missing || uploading}
        placing={placing}
        onPlace={submit}
      />
    </div>
  );
}
