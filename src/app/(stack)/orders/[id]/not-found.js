import Link from 'next/link';
import { IoReceiptOutline } from 'react-icons/io5';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/nav/PageHeader';
import { getT } from '@/lib/preferences';

export default async function OrderNotFound() {
  const t = await getT();

  return (
    <>
      <PageHeader back />
      <EmptyState Icon={IoReceiptOutline} title={t('order_not_found')}>
        <Link href="/orders" className="mt-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white">
          {t('orders')}
        </Link>
      </EmptyState>
    </>
  );
}
