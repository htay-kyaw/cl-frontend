import { notFound, redirect } from 'next/navigation';
import { IoArchiveOutline, IoDocumentTextOutline, IoGiftOutline } from 'react-icons/io5';
import AutoRefresh from '@/components/AutoRefresh';
import PageHeader from '@/components/nav/PageHeader';
import StatusBadge from '@/components/orders/StatusBadge';
import { ApiError, orderApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { formatPrice } from '@/lib/links';
import { getLocale, getT } from '@/lib/preferences';
import { getToken } from '@/lib/session';
import OrderActions from './OrderActions';
import StatusTimeline from './StatusTimeline';

export async function generateMetadata({ params }) {
  const t = await getT();
  return { title: `${t('order_id')} #${(await params).id}` };
}

const card = 'rounded-xl border border-border bg-card p-4';
const label = 'mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary';

export default async function OrderPage({ params }) {
  const { id } = await params;
  if (!(await getToken())) redirect(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);
  if (!/^\d+$/.test(id)) notFound();

  let order;
  try {
    order = await orderApi.get(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const mmk = (v) => `${formatPrice(v)} ${t('mmk')}`;
  const finished = ['delivered', 'cancelled'].includes(order.status);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title={`${t('order_id')} #${order.id}`} back />

      <div className="flex flex-col gap-4 p-4 md:px-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-text-secondary">{formatDate(order.created_at, locale, true)}</span>
          <div className="flex items-center gap-2">
            {order.is_archived && (
              <span className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-text-secondary">
                <IoArchiveOutline size={12} /> {t('archived')}
              </span>
            )}
            <StatusBadge status={order.status} t={t} />
          </div>
        </div>

        <StatusTimeline status={order.status} t={t} />

        <section className={card}>
          <p className={label}>{t('delivery_address')}</p>
          <p>{[order.house_no, order.street, order.township, order.city].filter(Boolean).join(', ')}</p>
          <p className={`${label} mt-4`}>{t('payment_method')}</p>
          <p>{order.payment_method === 'screenshot' ? t('bank_transfer') : t('cod')}</p>
          {order.notes && (
            <>
              <p className={`${label} mt-4`}>{t('order_notes')}</p>
              <p className="whitespace-pre-line">{order.notes}</p>
            </>
          )}
        </section>

        <section className={card}>
          <p className={label}>{t('items')}</p>
          <ul className="flex flex-col divide-y divide-border/60">
            {order.items?.map(item => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="font-medium">{item.product_name}</p>
                  {item.variant_label && <p className="text-xs text-text-secondary">{item.variant_label}</p>}
                  <p className="text-xs text-text-secondary">{item.quantity} × {formatPrice(item.sell_price)}</p>
                </div>
                <span className="shrink-0 font-semibold">{mmk(item.subtotal)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${card} flex flex-col gap-1.5 text-sm`}>
          <div className="flex justify-between"><span className="text-text-secondary">{t('subtotal')}</span><span>{mmk(order.subtotal)}</span></div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-text-secondary">{t('discount')}{order.promotion_name ? ` (${order.promotion_name})` : ''}</span>
              <span className="text-success">−{mmk(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between"><span className="text-text-secondary">{t('delivery_fee')}</span><span>{mmk(order.delivery_fee)}</span></div>
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2.5">
            <span className="font-semibold">{t('total')}</span>
            <span className="text-lg font-bold text-primary">{mmk(order.total)}</span>
          </div>
          {order.points_earned > 0 && (
            <p className="flex items-center justify-end gap-1 text-xs font-semibold text-success">
              <IoGiftOutline /> {t('points_earned', { points: order.points_earned })}
            </p>
          )}
        </section>

        {order.invoice_path && (
          <a
            href={order.invoice_path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 font-semibold text-primary"
          >
            <IoDocumentTextOutline size={18} /> {t('download_invoice')}
          </a>
        )}

        <OrderActions
          id={order.id}
          canCancel={order.can_cancel}
          canArchive={finished && !order.is_archived}
          canUnarchive={order.is_archived}
        />
      </div>

      {!finished && <AutoRefresh />}
    </div>
  );
}
