import { Suspense } from 'react';
import Link from 'next/link';
import { IoChevronForward } from 'react-icons/io5';
import AnnouncementTicker from '@/components/home/AnnouncementTicker';
import BannerCarousel from '@/components/home/BannerCarousel';
import CategoryChips from '@/components/home/CategoryChips';
import PageHeader from '@/components/nav/PageHeader';
import ProductGrid from '@/components/products/ProductGrid';
import ProductGridSkeleton from '@/components/products/ProductGridSkeleton';
import Skeleton from '@/components/Skeleton';
import { catalogApi } from '@/lib/api';
import { getT } from '@/lib/preferences';

const HOME_PRODUCTS = 12; // same as the mobile app

async function Showcase({ selected }) {
  const [t, banners, announcements, categories] = await Promise.all([
    getT(), catalogApi.banners(), catalogApi.announcements(), catalogApi.categories(),
  ]);

  return (
    <>
      <BannerCarousel banners={banners} />
      <AnnouncementTicker announcements={announcements} />
      <CategoryChips categories={categories} selected={selected} allLabel={t('all')} />
    </>
  );
}

function ShowcaseSkeleton() {
  return (
    <div aria-busy="true">
      <Skeleton className="aspect-[2/1] w-full md:mt-4 md:aspect-[3/1] md:rounded-2xl" />
      <div className="flex justify-center gap-2 px-3 py-4">
        {['w-20', 'w-28', 'w-24'].map(w => <Skeleton key={w} className={`h-11 rounded-full ${w}`} />)}
      </div>
    </div>
  );
}

async function Products({ categoryId }) {
  const [t, { items, total }] = await Promise.all([
    getT(),
    catalogApi.products({ category_id: categoryId, per_page: HOME_PRODUCTS }),
  ]);

  return (
    <>
      <ProductGrid products={items} t={t} />
      {/* Home only shows the newest few; the full catalog (same category) lives on Products */}
      {total > 0 && (
        <div className="mt-5 flex justify-center px-3 md:px-0">
          <Link
            href={categoryId ? `/products?category=${categoryId}` : '/products'}
            className="flex items-center gap-1.5 rounded-full border border-primary px-6 py-2.5 text-sm font-semibold text-primary"
          >
            {t('see_all_products', { count: total })} <IoChevronForward />
          </Link>
        </div>
      )}
    </>
  );
}

export default async function HomePage({ searchParams }) {
  const t = await getT();
  const category = Number((await searchParams).category) || null;

  return (
    <>
      <PageHeader title={t('home')} />

      <Suspense fallback={<ShowcaseSkeleton />}>
        <Showcase selected={category} />
      </Suspense>

      {/* keyed so switching category shows the grid skeleton */}
      <Suspense key={category ?? 'all'} fallback={<ProductGridSkeleton />}>
        <Products categoryId={category} />
      </Suspense>
    </>
  );
}
