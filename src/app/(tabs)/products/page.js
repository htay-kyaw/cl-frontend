import PageHeader from '@/components/nav/PageHeader';
import { getT } from '@/lib/preferences';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('products') };
}

// Products — search, filters and grid to follow the agreed design
export default async function ProductsPage() {
  const t = await getT();

  return (
    <>
      <PageHeader title={t('products')} />
      <section className="px-4 py-6 md:px-0" />
    </>
  );
}
