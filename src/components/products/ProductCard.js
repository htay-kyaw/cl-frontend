import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/links';

// Grid card, same content as the mobile app: image, name, price, stock
export default function ProductCard({ product, t, priority = false }) {
  const hasVariants = product.variants?.length > 0;

  // options can have their own prices: show the lowest, as "From …" when they differ
  const prices = hasVariants ? product.variants.map(v => v.price) : [product.sell_price];
  const lowest = Math.min(...prices);
  const priceLabel = new Set(prices).size > 1
    ? t('from_price', { price: formatPrice(lowest) })
    : formatPrice(lowest);

  // a summed total across powers would be misleading — the specific power a shopper wants may be sold out
  const stockLabel = !product.is_in_stock
    ? t('out_of_stock')
    : hasVariants
      ? t('available')
      : t('stock_count', { count: product.stock });

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-surface">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-2">
        <p className="line-clamp-2 text-[13px] font-medium">{product.name}</p>
        <div className="mt-auto flex items-center justify-between gap-1 pt-1">
          <span className="text-sm font-bold text-primary">
            {priceLabel} {t('mmk')}
          </span>
          <span className={`text-[11px] font-semibold ${product.is_in_stock ? 'text-text-secondary' : 'text-danger'}`}>
            {stockLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
