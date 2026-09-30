import 'server-only';
import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALES, getDictionary, translate } from '@/i18n';

// Language and theme live in plain cookies so the server renders the right
// text and colours on first paint. Defaults match the mobile app.
export const THEMES = ['dark', 'light'];
export const DEFAULT_THEME = 'dark';

export async function getLocale() {
  const value = (await cookies()).get('lang')?.value;
  return LOCALES.includes(value) ? value : DEFAULT_LOCALE;
}

export async function getTheme() {
  const value = (await cookies()).get('theme')?.value;
  return THEMES.includes(value) ? value : DEFAULT_THEME;
}

// Translator for server components
export async function getT() {
  const dict = getDictionary(await getLocale());
  return (key, vars) => translate(dict, key, vars);
}
