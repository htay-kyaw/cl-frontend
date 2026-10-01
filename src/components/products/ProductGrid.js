import ProductCard from './ProductCard';

export const gridClass = 'grid grid-cols-2 gap-3 px-3 sm:grid-cols-3 md:px-0 lg:grid-cols-5';

export default function ProductGrid({ products, t }) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-sm text-text-secondary">{t('no_products')}</p>;
  }

  return (
    <div className={gridClass}>
      {products.map((p, i) => <ProductCard key={p.id} product={p} t={t} priority={i < 4} />)}
    </div>
  );
}
