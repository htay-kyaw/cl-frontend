'use server';

import { cookies } from 'next/headers';
import { LOCALES } from '@/i18n';
import { THEMES } from '@/lib/preferences';

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLanguage(locale) {
  if (!LOCALES.includes(locale)) return;
  (await cookies()).set('lang', locale, { path: '/', maxAge: ONE_YEAR, sameSite: 'lax' });
}

export async function setTheme(theme) {
  if (!THEMES.includes(theme)) return;
  (await cookies()).set('theme', theme, { path: '/', maxAge: ONE_YEAR, sameSite: 'lax' });
}
