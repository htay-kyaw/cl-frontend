import { Suspense } from 'react';
import Link from 'next/link';
import { IoChevronBack, IoClose, IoSearchOutline } from 'react-icons/io5';
import CategoryChips from '@/components/home/CategoryChips';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/nav/PageHeader';
import ProductCard from '@/components/products/ProductCard';
import { gridClass } from '@/components/products/ProductGrid';
import ProductGridSkeleton from '@/components/products/ProductGridSkeleton';
import Skeleton from '@/components/Skeleton';
import { catalogApi } from '@/lib/api';
import { getT } from '@/lib/preferences';
import { parseProductQuery, productQueryHref, toApiParams } from '@/lib/productQuery';
import FilterSheet from './FilterSheet';
import InfiniteProducts from './InfiniteProducts';
import SearchBar from './SearchBar';

export async function generateMetadata({ searchParams }) {
  const t = await getT();
  const query = parseProductQuery(await searchParams);
  return {
    title: query.q ? `${t('products')}: ${query.q}` : t('products'),
    alternates: { canonical: productQueryHref(query, query.page) },
  };
}

// category chips + filter sheet (filter values depend on the category)
async function Controls({ query }) {
  const [t, categories, groups] = await Promise.all([
    getT(),
    catalogApi.categories(),
    catalogApi.filters(query.category ? { category_id: query.category } : {}),
  ]);

  return (
    <>
      <div className="flex items-center gap-2 px-3 pt-3 md:px-0 md:pt-0">
        <SearchBar query={query} />
        {/* keyed so the sheet's draft resets when the applied query changes */}
        <FilterSheet key={productQueryHref(query)} query={query} groups={groups} />
      </div>
      <CategoryChips
        categories={categories}
        selected={query.category}
        allLabel={t('all')}
        // switching category clears attribute filters (values differ per category), like the app
        hrefFor={(id) => productQueryHref({ ...query, category: id, filters: {} })}
      />
    </>
  );
}

function ControlsSkeleton() {
  return (
    <div className="px-3 pt-3 md:px-0 md:pt-0" aria-busy="true">
      <Skeleton className="h-11 rounded-xl" />
      <div className="flex justify-center gap-2 py-4">
        {['w-20', 'w-28', 'w-24'].map(w => <Skeleton key={w} className={`h-11 rounded-full ${w}`} />)}
      </div>
    </div>
  );
}

async function Results({ query }) {
  const [t, { items, total, last_page }] = await Promise.all([getT(), catalogApi.products(toApiParams(query, query.page))]);
  const search = productQueryHref(query).split('?')[1] ?? '';

  // removable chips for the filters currently applied
  const applied = [
    ...(query.sort !== 'newest' ? [{ label: t(`sort_${query.sort}`), href: productQueryHref({ ...query, sort: 'newest' }) }] : []),
    ...Object.entries(query.filters).map(([name, value]) => {
      const rest = { ...query.filters };
      delete rest[name];
      return { label: `${name}: ${value}`, href: productQueryHref({ ...query, filters: rest }) };
    }),
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 px-3 pb-3 md:px-0">
        <span className="text-sm text-text-secondary">{t('products_count', { count: total })}</span>
        {applied.map(f => (
          <Link key={f.href} href={f.href} scroll={false} className="flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
            {f.label} <IoClose size={14} />
          </Link>
        ))}
      </div>

      {/* landed on a later page (e.g. from Google): offer the start of the list */}
      {query.page > 1 && (
        <div className="flex justify-center px-3 pb-3 md:px-0">
          <Link href={productQueryHref(query)} className="flex items-center gap-1 text-sm font-semibold text-primary">
            <IoChevronBack /> {t('back_to_first_page')}
          </Link>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState Icon={IoSearchOutline} title={t('no_products')}>
          {(query.q || applied.length > 0 || query.category || query.page > 1) && (
            <Link href="/products" className="mt-2 rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary">
              {t('clear_all')}
            </Link>
          )}
        </EmptyState>
      ) : (
        <div className={gridClass}>
          {items.map((p, i) => <ProductCard key={p.id} product={p} t={t} priority={i < 4} />)}
          <InfiniteProducts
            search={search}
            startPage={query.page}
            lastPage={last_page}
            seenIds={items.map(p => p.id)}
          />
        </div>
      )}
    </>
  );
}

export default async function ProductsPage({ searchParams }) {
  const [t, params] = await Promise.all([getT(), searchParams]);
  const query = parseProductQuery(params);
  const key = productQueryHref(query, query.page);

  return (
    <>
      <PageHeader title={t('products')} />
      <div className="md:pt-2">
        <Suspense key={`controls-${query.category ?? 'all'}`} fallback={<ControlsSkeleton />}>
          <Controls query={query} />
        </Suspense>
        {/* keyed by the full query so any change shows the grid skeleton and resets infinite scroll */}
        <Suspense key={key} fallback={<ProductGridSkeleton />}>
          <Results query={query} />
        </Suspense>
      </div>
    </>
  );
}
