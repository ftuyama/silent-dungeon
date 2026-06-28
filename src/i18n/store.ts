import { DEFAULT_LOCALE, isLocale, type Locale } from './locale.ts';

const LOCALE_STORAGE_KEY = 'sd_locale_v1';

export function loadStoredLocale(): Locale | null {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw && isLocale(raw)) return raw;
  } catch {
    /* noop */
  }
  return null;
}

export function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* noop */
  }
}

export function clearStoredLocale(): void {
  try {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export { DEFAULT_LOCALE };
