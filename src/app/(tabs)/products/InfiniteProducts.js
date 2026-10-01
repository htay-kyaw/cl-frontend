'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { loadMoreProducts } from '@/app/actions/catalog';
import ProductCard from '@/components/products/ProductCard';
import { useT } from '@/components/Providers';

// Appends further pages to the server-rendered first page as the shopper scrolls,
// like the mobile app's onEndReached. A button is the fallback.
export default function InfiniteProducts({ search, lastPage, seenIds }) {
  const t = useT();
  const sentinel = useRef(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [total, setTotal] = useState(lastPage);

  const loadNext = useCallback(async () => {
    if (loading || page >= total) return;
    setLoading(true);
    setFailed(false);
    try {
      const next = page + 1;
      const result = await loadMoreProducts(search, next);
      // skip anything already shown (new products may shift pages while browsing)
      setItems(prev => {
        const seen = new Set([...seenIds, ...prev.map(p => p.id)]);
        return [...prev, ...result.items.filter(p => !seen.has(p.id))];
      });
      setPage(next);
      setTotal(result.lastPage);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [loading, page, total, search, seenIds]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || failed) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && loadNext(), { rootMargin: '400px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadNext, failed]);

  return (
    <>
      {items.map(p => <ProductCard key={p.id} product={p} t={t} />)}
      {page < total && (
        <div ref={sentinel} className="col-span-full flex justify-center py-4">
          {loading ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label={t('loading')} />
          ) : (
            <button type="button" onClick={loadNext} className="rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary">
              {failed ? t('retry') : t('load_more')}
            </button>
          )}
        </div>
      )}
    </>
  );
}
