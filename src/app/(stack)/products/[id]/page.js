import { cache } from 'react';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/nav/PageHeader';
import { ApiError, catalogApi } from '@/lib/api';
import { getT } from '@/lib/preferences';
import ImageGallery from './ImageGallery';
import { PhotoFocusProvider } from './PhotoFocus';
import ProductPurchase from './ProductPurchase';

// shared by generateMetadata and the page within one request
const getProduct = cache(async (id) => {
  if (!/^\d+$/.test(id)) notFound();
  try {
    return await catalogApi.product(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
});

export async function generateMetadata({ params }) {
  const product = await getProduct((await params).id);
  return {
    title: product.name,
    description: [product.category?.name, product.name].filter(Boolean).join(' · '),
    openGraph: { title: product.name, images: product.image ? [product.image] : [] },
  };
}

export default async function ProductPage({ params }) {
  const [t, product] = await Promise.all([getT(), getProduct((await params).id)]);

  // main photo, extra photos, then option photos (e.g. each color) not already among them
  const images = [...new Set([
    ...(product.image ? [product.image] : []),
    ...(product.images ?? []),
    ...(product.option_images ?? []).map(o => o.image),
  ])];
  const specs  = Object.entries(product.attributes ?? {});

  // structured data so search engines can show price and availability
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images,
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MMK',
      price: product.variants?.length ? Math.min(...product.variants.map(v => v.price)) : product.sell_price,
      availability: `https://schema.org/${product.is_in_stock ? 'InStock' : 'OutOfStock'}`,
    },
  };

  return (
    <>
      <PageHeader back />

      <PhotoFocusProvider>
        <article className="pb-24 md:grid md:grid-cols-2 md:gap-10 md:pb-0">
          <ImageGallery images={images} alt={product.name} />

          <div className="p-5 md:p-0">
            {product.category && <p className="mb-1 text-[13px] text-text-secondary">{product.category.name}</p>}
            <h1 className="mb-3 text-[22px] font-bold leading-snug">{product.name}</h1>

            <ProductPurchase product={product} />

            {specs.length > 0 && (
              <section className="overflow-hidden rounded-xl border border-border bg-surface">
                <h2 className="border-b border-border px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  {t('specifications')}
                </h2>
                <dl>
                  {specs.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 border-b border-border/50 px-4 py-3 last:border-0">
                      <dt className="text-sm text-text-secondary">{label}</dt>
                      <dd className="text-right text-sm font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        </article>
      </PhotoFocusProvider>

      <script
        type="application/ld+json"
        // escape "<" so product text can't close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  );
}
