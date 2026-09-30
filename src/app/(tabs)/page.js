import PageHeader from '@/components/nav/PageHeader';
import { getT } from '@/lib/preferences';

// Home — banners, announcements and categories to follow the agreed design
export default async function HomePage() {
  const t = await getT();

  return (
    <>
      <PageHeader title={t('home')} />
      <section className="px-4 py-6 md:px-0" />
    </>
  );
}
