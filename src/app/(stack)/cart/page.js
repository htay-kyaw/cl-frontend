import PageHeader from '@/components/nav/PageHeader';
import { getT } from '@/lib/preferences';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('cart') };
}

// Cart — line items and totals to follow the agreed design
export default async function CartPage() {
  const t = await getT();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title={t('cart')} back cart={false} />
      <section className="px-4 py-6 md:px-0" />
    </div>
  );
}
