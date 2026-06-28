import { DEFAULT_LOCALE, type Locale } from './locale.ts';

import type { LocalizedStringValue } from '../engine/schema/dialogueCombat.ts';

export type LocalizedString = {
  'pt-BR': string;
  'en-US'?: string;
};

export function pickLocalized(value: LocalizedStringValue | string, locale: Locale): string {
  if (typeof value === 'string') return value;
  const primary = value[locale];
  if (primary !== undefined && primary.length > 0) return primary;
  const fallback = value[DEFAULT_LOCALE];
  if (import.meta.env.DEV && locale !== DEFAULT_LOCALE && primary === undefined) {
    console.warn('[i18n] missing localized string for locale', locale);
  }
  return fallback ?? '';
}
