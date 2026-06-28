export type Locale = 'pt-BR' | 'en-US';

export const SUPPORTED_LOCALES: readonly Locale[] = ['pt-BR', 'en-US'] as const;

export const DEFAULT_LOCALE: Locale = 'pt-BR';

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Map browser language tags to a supported locale. */
export function normalizeLocale(tag: string): Locale | null {
  const lower = tag.trim().toLowerCase();
  if (!lower) return null;
  if (lower === 'pt' || lower.startsWith('pt-')) return 'pt-BR';
  if (lower === 'en' || lower.startsWith('en-')) return 'en-US';
  return null;
}

export function localeHtmlLang(locale: Locale): string {
  return locale;
}

export function localeDisplayName(locale: Locale, inLocale: Locale): string {
  if (inLocale === 'en-US') {
    return locale === 'pt-BR' ? 'Português (Brasil)' : 'English';
  }
  return locale === 'pt-BR' ? 'Português (Brasil)' : 'English';
}
