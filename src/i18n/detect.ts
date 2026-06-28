import { DEFAULT_LOCALE, normalizeLocale, type Locale } from './locale.ts';
import { loadStoredLocale } from './store.ts';

export function detectLocaleFromNavigator(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of langs) {
    const locale = normalizeLocale(tag);
    if (locale) return locale;
  }
  return DEFAULT_LOCALE;
}

export function resolveLocale(urlLang: string | null): Locale {
  if (urlLang) {
    const fromUrl = normalizeLocale(urlLang);
    if (fromUrl) return fromUrl;
  }
  const stored = loadStoredLocale();
  if (stored) return stored;
  return detectLocaleFromNavigator();
}
