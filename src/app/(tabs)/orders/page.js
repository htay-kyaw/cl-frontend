import { Suspense } from 'react';
import Link from 'next/link';
import { IoArchiveOutline, IoCheckmarkCircle, IoChevronBack, IoChevronForward, IoReceiptOutline, IoTimeOutline } from 'react-icons/io5';
import AutoRefresh from '@/components/AutoRefresh';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/nav/PageHeader';
import StatusBadge from '@/components/orders/StatusBadge';
import SignInPrompt from '@/components/SignInPrompt';
import Skeleton from '@/components/Skeleton';
import { orderApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { formatPrice } from '@/lib/links';
import { getLocale, getT } from '@/lib/preferences';
import { getCurrentUser } from '@/lib/session';

const TABS = ['active', 'history', 'archived'];

export async function generateMetadata() {
  const t = await getT();
  return { title: t('orders') };
}

const href = (tab, page = 1) => `/orders?tab=${tab}${page > 1 ? `&page=${page}` : ''}`;

async function OrderList({ tab, page }) {
  const [t, locale, data, counts] = await Promise.all([
    getT(),
    getLocale(),
    tab === 'archived' ? orderApi.archived({ page }) : orderApi.list({ group: tab, page }),
    // the archived endpoint has no counts; take them from a cheap first-page list call
    tab === 'archived' ? orderApi.list({ group: 'active' }).then(r => r.counts) : null,
  ]);
  const tabCounts = counts ?? data.counts;

  return (
    <>
      <nav aria-label={t('orders')} className="mx-4 mb-4 mt-3 grid grid-cols-3 rounded-xl border border-border bg-surface p-1 md:mx-0">
        {TABS.map(key => {
          const active = key === tab;
          const count = tabCounts?.[key] ?? 0;
          return (
            <Link
              key={key}
              href={href(key)}
              scroll={false}
              aria-current={active ? 'page' : undefined}
              className={`rounded-lg py-2.5 text-center text-sm font-semibold ${active ? 'bg-primary text-white' : 'text-text-secondary'}`}
            >
              {t(`tab_${key}`)}{count > 0 ? ` (${count})` : ''}
            </Link>
          );
        })}
      </nav>

      {data.items.length === 0 ? (
        <EmptyState
          Icon={tab === 'active' ? IoTimeOutline : tab === 'archived' ? IoArchiveOutline : IoReceiptOutline}
          title={tab === 'active' ? t('no_active_orders') : t('no_orders')}
          subtitle={tab === 'active' ? t('no_active_orders_sub') : t('no_orders_sub')}
        />
      ) : (
        <ul className="flex flex-col gap-3 px-4 md:grid md:grid-cols-2 md:px-0">
          {data.items.map(order => (
            <li key={order.id}>
              <Link href={`/orders/${order.id}`} className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 hover:border-primary">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{t('order_id')} #{order.id}</span>
                  <StatusBadge status={order.status} t={t} />
                </div>
                <span className="text-[13px] text-text-secondary">{formatDate(order.created_at, locale)}</span>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-text-secondary">{t('items_count', { count: order.items?.length ?? 0 })}</span>
                  <span className="font-bold text-primary">{formatPrice(order.total)} {t('mmk')}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data.last_page > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4 text-sm">
          {page > 1 ? (
            <Link href={href(tab, page - 1)} className="flex items-center gap-1 font-semibold text-primary"><IoChevronBack /> {t('previous')}</Link>
          ) : <span />}
          <span className="text-text-secondary">{page} / {data.last_page}</span>
          {page < data.last_page ? (
            <Link href={href(tab, page + 1)} className="flex items-center gap-1 font-semibold text-primary">{t('next')} <IoChevronForward /></Link>
          ) : <span />}
        </div>
      )}
    </>
  );
}

function OrderListSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-3 md:px-0" aria-busy="true">
      <Skeleton className="mb-1 h-12 rounded-xl" />
      {[0, 1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  );
}

export default async function OrdersPage({ searchParams }) {
  const [t, user, params] = await Promise.all([getT(), getCurrentUser(), searchParams]);
  const tab = TABS.includes(params.tab) ? params.tab : 'active';
  const page = Math.max(1, Number(params.page) || 1);
  const placedId = Number(params.placed) || null;

  return (
    <>
      <PageHeader title={t('orders')} />
      {user ? (
        <section className="pb-6">
          {placedId && (
            <Link
              href={`/orders/${placedId}`}
              role="status"
              className="mx-4 mt-3 flex items-start gap-3 rounded-2xl border border-success/40 bg-success/10 p-4 md:mx-0"
            >
              <IoCheckmarkCircle size={26} className="shrink-0 text-success" />
              <div className="flex-1">
                <p className="font-semibold">{t('order_placed')}</p>
                <p className="text-sm text-text-secondary">{t('order_placed_sub', { id: placedId })}</p>
              </div>
              <IoChevronForward className="mt-1 text-text-secondary" />
            </Link>
          )}
          <Suspense key={`${tab}-${page}`} fallback={<OrderListSkeleton />}>
            <OrderList tab={tab} page={page} />
          </Suspense>
          <AutoRefresh />
        </section>
      ) : (
        <SignInPrompt Icon={IoReceiptOutline} message={t('sign_in_orders')} next="/orders" />
      )}
    </>
  );
}
