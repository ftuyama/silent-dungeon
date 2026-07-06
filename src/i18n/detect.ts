import { DEFAULT_LOCALE, normalizeLocale, type Locale } from './locale.ts';
import { loadStoredLocale } from './store.ts';

export function resolveLocale(urlLang: string | null): Locale {
  if (urlLang) {
    const fromUrl = normalizeLocale(urlLang);
    if (fromUrl) return fromUrl;
  }
  const stored = loadStoredLocale();
  if (stored) return stored;
  // Campanha principal em pt-BR: só muda para en-US via ?lang= ou seletor de idioma.
  return DEFAULT_LOCALE;
}
