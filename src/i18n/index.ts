import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import { resolveLocale } from './detect.ts';
import { localeHtmlLang, type Locale } from './locale.ts';
import { saveLocale } from './store.ts';
import {
  getActiveLocale,
  registerCatalog,
  setActiveLocale,
} from './translate.ts';

export type { Locale } from './locale.ts';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, isLocale, normalizeLocale, localeDisplayName } from './locale.ts';
export { pickLocalized } from './localized.ts';
export { t, translateKey, getCatalogKeys, getRegisteredCatalog, tArray } from './translate.ts';
export { matchesAnyLocale } from './combatLogMessages.ts';

type LocaleChangeHandler = (locale: Locale) => void;

const localeChangeHandlers = new Set<LocaleChangeHandler>();

registerCatalog('pt-BR', ptBR);
registerCatalog('en-US', enUS);

export function initI18n(urlLang?: string | null): Locale {
  const locale = resolveLocale(urlLang ?? null);
  setActiveLocale(locale);
  applyDocumentLocale(locale);
  return locale;
}

export function getLocale(): Locale {
  return getActiveLocale();
}

export function setLocale(locale: Locale): void {
  if (getActiveLocale() === locale) return;
  setActiveLocale(locale);
  saveLocale(locale);
  applyDocumentLocale(locale);
  for (const handler of localeChangeHandlers) handler(locale);
}

export function onLocaleChange(handler: LocaleChangeHandler): () => void {
  localeChangeHandlers.add(handler);
  return () => localeChangeHandlers.delete(handler);
}

function applyDocumentLocale(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = localeHtmlLang(locale);
  }
}
