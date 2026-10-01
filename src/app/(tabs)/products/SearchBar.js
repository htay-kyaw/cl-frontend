'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoCloseCircle, IoSearchOutline } from 'react-icons/io5';
import { useT } from '@/components/Providers';
import { productQueryHref } from '@/lib/productQuery';

// Debounced search box that updates ?q= (other filters kept, paging reset)
export default function SearchBar({ query }) {
  const t = useT();
  const router = useRouter();
  const [value, setValue] = useState(query.q);
  const [syncedQ, setSyncedQ] = useState(query.q);
  const timer = useRef(null);
  const latestQuery = useRef(query);

  useEffect(() => { latestQuery.current = query; }, [query]);

  // follow ?q= changes made elsewhere (e.g. "Clear all"), without fighting the user's typing
  if (query.q !== syncedQ) {
    setSyncedQ(query.q);
    if (value.trim() !== query.q) setValue(query.q);
  }

  const navigate = (q) => {
    clearTimeout(timer.current);
    if (q.trim() === latestQuery.current.q) return;
    router.replace(productQueryHref({ ...latestQuery.current, q: q.trim() }), { scroll: false });
  };

  const onChange = (e) => {
    setValue(e.target.value);
    clearTimeout(timer.current);
    const next = e.target.value;
    timer.current = setTimeout(() => navigate(next), 400);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <form
      role="search"
      onSubmit={e => { e.preventDefault(); navigate(value); }}
      className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 focus-within:border-primary"
    >
      <IoSearchOutline size={18} className="shrink-0 text-placeholder" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        maxLength={100}
        placeholder={t('search_products')}
        aria-label={t('search_products')}
        enterKeyHint="search"
        className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => { setValue(''); navigate(''); }} aria-label={t('clear')} className="text-placeholder">
          <IoCloseCircle size={18} />
        </button>
      )}
    </form>
  );
}
