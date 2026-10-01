import Link from 'next/link';
import { IoSearchOutline } from 'react-icons/io5';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/nav/PageHeader';
import { getT } from '@/lib/preferences';

export default async function ProductNotFound() {
  const t = await getT();

  return (
    <>
      <PageHeader back />
      <EmptyState Icon={IoSearchOutline} title={t('product_not_found')}>
        <Link href="/products" className="mt-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white">
          {t('products')}
        </Link>
      </EmptyState>
    </>
  );
}
