'use client';

import { useEffect, useState } from 'react';
import { useT } from './Providers';

// Google's four-colour "G" (brand guidelines allow it on custom buttons)
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

// Our own button (matches the app) — a plain link into the redirect sign-in flow
// in /auth/google; Google's script and iframe are no longer loaded.
export default function GoogleSignInButton({ redirectTo = '/' }) {
  const t = useT();
  const [pending, setPending] = useState(false);

  // back button from Google restores this page from cache with the spinner still on
  useEffect(() => {
    const reset = (e) => e.persisted && setPending(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  return (
    <a
      href={`/auth/google?next=${encodeURIComponent(redirectTo)}`}
      onClick={() => setPending(true)}
      aria-busy={pending}
      className={`flex h-13 w-full max-w-sm items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 text-[15px] font-semibold text-text shadow-sm transition-colors hover:bg-surface active:scale-[0.99] ${pending ? 'pointer-events-none opacity-60' : ''}`}
    >
      {pending
        ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden="true" />
        : <GoogleLogo />}
      {t('continue_with_google')}
    </a>
  );
}
