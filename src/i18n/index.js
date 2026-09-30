import en from './en';
import my from './my';

// Same dictionaries and default (Burmese) as the mobile app
export const LOCALES = ['my', 'en'];
export const DEFAULT_LOCALE = 'my';

const dictionaries = { en, my };

export function getDictionary(locale) {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

// t('select_option_title', { option: 'Power' }) → 'Select Power'
export function translate(dict, key, vars) {
  const text = dict[key] ?? en[key] ?? key;
  return vars ? text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '') : text;
}
