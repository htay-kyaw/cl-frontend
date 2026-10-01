'use client';

import { createContext, useCallback, useContext } from 'react';
import { getDictionary, translate } from '@/i18n';

const LocaleContext = createContext('my');

// Translator for client components: const t = useT(); t('home')
export function useT() {
  const locale = useContext(LocaleContext);
  const dict = getDictionary(locale);
  return useCallback((key, vars) => translate(dict, key, vars), [dict]);
}

export function useLocale() {
  return useContext(LocaleContext);
}

export default function Providers({ locale, children }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
