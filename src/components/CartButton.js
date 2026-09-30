'use client';

import Link from 'next/link';
import { IoCartOutline } from 'react-icons/io5';
import useCartStore, { selectTotalItems, useCartHydrated } from '@/store/cartStore';
import { useT } from './Providers';

export default function CartButton() {
  const t          = useT();
  const hydrated   = useCartHydrated();
  const totalItems = useCartStore(selectTotalItems);

  return (
    <Link
      href="/cart"
      aria-label={t('cart')}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-text hover:bg-surface"
    >
      <IoCartOutline size={22} />
      {hydrated && totalItems > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
