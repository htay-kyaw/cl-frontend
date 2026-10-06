'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { importCartLines } from '@/app/actions/cart';
import { setLanguage } from '@/app/actions/preferences';
import useCartStore, { useCartHydrated } from '@/store/cartStore';

// Arriving from Telegram's in-app browser (see OpenInBrowser): restore the cart and
// language from the link, then drop those params so a refresh doesn't import again.
export default function CartImport() {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const hydrated = useCartHydrated();
  const done     = useRef(false);

  const cart = params.get('cart');
  const lang = params.get('lang');

  useEffect(() => {
    if (!hydrated || done.current || (!cart && !lang)) return;
    done.current = true;

    (async () => {
      const [lines] = await Promise.all([
        cart ? importCartLines(cart).catch(() => []) : [],
        lang ? setLanguage(lang) : null,
      ]);
      if (lines.length) useCartStore.getState().mergeItems(lines);

      const rest = new URLSearchParams(params);
      rest.delete('cart');
      rest.delete('lang');
      router.replace(rest.size ? `${pathname}?${rest}` : pathname);
      if (lang) router.refresh(); // re-render server text in the carried-over language
    })();
  }, [hydrated, cart, lang, params, pathname, router]);

  return null;
}
