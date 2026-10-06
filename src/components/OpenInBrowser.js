'use client';

import { useEffect, useRef, useState } from 'react';
import { IoCheckmark, IoCopyOutline, IoOpenOutline } from 'react-icons/io5';
import useCartStore, { useCartHydrated } from '@/store/cartStore';
import { encodeCart } from '@/lib/cart-link';
import { useLocale, useT } from './Providers';

// Shown instead of the Google button inside Telegram/Messenger/… browsers, where Google
// refuses to sign anyone in. Sends the shopper to Chrome (Android) or Safari (iPhone) on
// this same sign-in page, carrying the cart and language along in the link.
export default function OpenInBrowser({ os, app, next }) {
  const t        = useT();
  const locale   = useLocale();
  const hydrated = useCartHydrated();
  const items    = useCartStore(s => s.items);
  const inputRef = useRef(null);
  const [link, setLink]     = useState('');
  const [copied, setCopied] = useState(false);

  const browser = os === 'ios' ? 'Safari' : 'Chrome';
  const appName = app ?? t('in_app_this_app');

  // the origin is only known in the browser; wait for the cart to load from storage
  useEffect(() => {
    if (!hydrated) return;
    const url = new URL('/login', window.location.origin);
    url.searchParams.set('next', next);
    if (items.length) url.searchParams.set('cart', encodeCart(items));
    url.searchParams.set('lang', locale);
    setLink(url.toString()); // eslint-disable-line react-hooks/set-state-in-effect -- needs window
  }, [hydrated, items, next, locale]);

  // Android: an intent link opens Chrome directly. iPhone (iOS 17+): x-safari-https:// opens Safari.
  let openHref = null;
  if (link && os === 'android') {
    const url = new URL(link);
    openHref = `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=${url.protocol.slice(0, -1)};package=com.android.chrome;end`;
  } else if (link && os === 'ios') {
    openHref = `x-safari-${link}`;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // some in-app browsers block the clipboard API — fall back to selecting the text
      inputRef.current?.select();
      document.execCommand?.('copy');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 text-left">
      <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
        <p className="font-bold">{t('in_app_title', { browser })}</p>
        <p className="mt-1 text-sm text-text-secondary">{t('in_app_body', { app: appName, browser })}</p>
      </div>

      {openHref && (
        <a
          href={openHref}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-bold text-white"
        >
          <IoOpenOutline size={20} />
          {t('open_in_browser', { browser })}
        </a>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          readOnly
          value={link}
          aria-label={t('copy_link')}
          onFocus={e => e.target.select()}
          className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 text-sm text-text-secondary"
        />
        <button
          type="button"
          onClick={copy}
          disabled={!link}
          className={`flex h-12 shrink-0 items-center gap-1.5 rounded-xl border px-4 text-sm font-semibold ${openHref ? 'border-border bg-card' : 'border-primary bg-primary text-white'}`}
        >
          {copied ? <IoCheckmark size={18} /> : <IoCopyOutline size={18} />}
          {copied ? t('copied') : t('copy_link')}
        </button>
      </div>
      {copied && <p className="text-sm text-success">{t('link_copied', { browser })}</p>}

      <p className="text-center text-xs text-text-secondary">{t('in_app_menu_hint')}</p>
    </div>
  );
}
