'use client';

import { useOptimistic, useTransition } from 'react';
import { setLanguage, setTheme } from '@/app/actions/preferences';
import { useT } from '@/components/Providers';

const LANGUAGES = [
  { value: 'my', label: 'မြန်မာ' },
  { value: 'en', label: 'EN' },
];

export default function SettingsCard({ theme, locale }) {
  const t = useT();
  const [, startTransition] = useTransition();
  const [optimisticTheme, setOptimisticTheme] = useOptimistic(theme);
  const [optimisticLocale, setOptimisticLocale] = useOptimistic(locale);

  const isDark = optimisticTheme === 'dark';

  const toggleTheme = () => startTransition(async () => {
    const next = isDark ? 'light' : 'dark';
    setOptimisticTheme(next);
    document.documentElement.dataset.theme = next; // repaint now; the cookie keeps it on reload
    await setTheme(next);
  });

  const changeLanguage = (value) => startTransition(async () => {
    setOptimisticLocale(value);
    await setLanguage(value);
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between py-1.5">
        <span className="text-[15px]">{t('theme')} ({isDark ? t('dark_mode') : t('light_mode')})</span>
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={t('theme')}
          onClick={toggleTheme}
          className={`relative h-7 w-12 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-text-disabled'}`}
        >
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${isDark ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>

      <div className="mt-1 flex items-center justify-between py-1.5">
        <span className="text-[15px]">{t('language')}</span>
        <div className="flex gap-2">
          {LANGUAGES.map(({ value, label }) => {
            const active = optimisticLocale === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => changeLanguage(value)}
                className={`rounded-lg border px-3.5 py-1.5 text-sm ${active ? 'border-primary bg-primary font-semibold text-white' : 'border-border bg-surface'}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
