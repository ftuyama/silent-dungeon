import { DEFAULT_LOCALE, type Locale } from './locale.ts';

type Catalog = Record<string, unknown>;

const catalogs: Record<Locale, Catalog> = {
  'pt-BR': {},
  'en-US': {},
};

let activeLocale: Locale = DEFAULT_LOCALE;
const warnedKeys = new Set<string>();

export function registerCatalog(locale: Locale, catalog: Catalog): void {
  catalogs[locale] = catalog;
}

function lookupInCatalog(catalog: Catalog, key: string): string | undefined {
  const parts = key.split('.');
  let node: unknown = catalog;
  for (const part of parts) {
    if (typeof node !== 'object' || node === null || !(part in node)) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = params[name];
    return v !== undefined ? String(v) : `{${name}}`;
  });
}

export function translateKey(key: string, locale: Locale, params?: Record<string, string | number>): string {
  const primary = lookupInCatalog(catalogs[locale], key);
  if (primary !== undefined) return interpolate(primary, params);

  if (locale !== DEFAULT_LOCALE) {
    const fallback = lookupInCatalog(catalogs[DEFAULT_LOCALE], key);
    if (fallback !== undefined) {
      if (import.meta.env.DEV && !warnedKeys.has(key)) {
        warnedKeys.add(key);
        console.warn(`[i18n] missing key "${key}" for ${locale}, using ${DEFAULT_LOCALE}`);
      }
      return interpolate(fallback, params);
    }
  }

  if (import.meta.env.DEV && !warnedKeys.has(key)) {
    warnedKeys.add(key);
    console.warn(`[i18n] missing key "${key}"`);
  }
  return key;
}

export function setActiveLocale(locale: Locale): void {
  activeLocale = locale;
}

export function getActiveLocale(): Locale {
  return activeLocale;
}

export function t(key: string, params?: Record<string, string | number>): string {
  return translateKey(key, activeLocale, params);
}

export function getCatalogKeys(catalog: Catalog, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(catalog)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') keys.push(path);
    else if (typeof v === 'object' && v !== null) keys.push(...getCatalogKeys(v as Catalog, path));
  }
  return keys;
}

export function getRegisteredCatalog(locale: Locale): Catalog {
  return catalogs[locale];
}

function lookupNode(catalog: Catalog, key: string): unknown {
  const parts = key.split('.');
  let node: unknown = catalog;
  for (const part of parts) {
    if (typeof node !== 'object' || node === null || !(part in node)) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return node;
}

/** Locale string array (e.g. reputation flavor lines). Falls back like `t()`. */
export function tArray(key: string, locale: Locale = activeLocale): readonly string[] {
  const primary = lookupNode(catalogs[locale], key);
  if (Array.isArray(primary) && primary.every((x) => typeof x === 'string')) {
    return primary as string[];
  }
  if (locale !== DEFAULT_LOCALE) {
    const fallback = lookupNode(catalogs[DEFAULT_LOCALE], key);
    if (Array.isArray(fallback) && fallback.every((x) => typeof x === 'string')) {
      return fallback as string[];
    }
  }
  return [];
}
