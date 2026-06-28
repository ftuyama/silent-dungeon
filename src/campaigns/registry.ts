/**
 * Central registry of playable campaigns. Each campaign folder provides a loader that returns
 * GameData, raw scene files (for parsing), and a CampaignUIAdapter. Add a new campaign by
 * implementing bundle.ts + index.json under src/campaigns/<id>/ and registering the loader below.
 *
 * Cenas já parseadas: `src/content/registry.ts` (ContentRegistry).
 */
import type { CampaignUIAdapter } from './campaignUi.ts';
import { parseSceneMarkdown, type LoadedScene } from '../engine/core/index.ts';
import type { GameData } from '../engine/data/index.ts';
import type { Locale } from '../i18n/locale.ts';
import { loadCalvarioContent } from './calvario/bundle.ts';
import { loadDemoContent } from './demo/bundle.ts';
import { scenePathToId } from './sceneLocale.ts';
import { getLocale } from '../i18n/index.ts';
import { applySceneLocaleOverlay as applyCalvarioSceneOverlay } from './calvario/localeLoad.ts';
import { applyDemoSceneLocaleOverlay } from './demo/localeLoad.ts';

export type CampaignContentBundle = {
  data: GameData;
  /** Path → raw markdown (Vite glob) */
  sceneFiles: Record<string, string>;
  ui: CampaignUIAdapter;
};

export type CampaignLoader = (locale: Locale) => CampaignContentBundle;

export type ParsedCampaignContentBundle = {
  data: GameData;
  ui: CampaignUIAdapter;
  scenes: Map<string, LoadedScene>;
};

const LOADERS: Record<string, CampaignLoader> = {
  calvario: loadCalvarioContent,
  demo: loadDemoContent,
};

/** Parsed pt-BR scenes per campaign (locale overlays applied on read). */
const canonicalSceneCache = new Map<string, Map<string, LoadedScene>>();

function parseCanonicalScenes(campaignId: string): Map<string, LoadedScene> {
  const cached = canonicalSceneCache.get(campaignId);
  if (cached) return cached;

  const { sceneFiles } = loadCampaignContent(campaignId, 'pt-BR');
  const scenes = new Map<string, LoadedScene>();
  for (const [path, raw] of Object.entries(sceneFiles)) {
    const id = scenePathToId(path);
    try {
      const scene = parseSceneMarkdown(raw, id);
      if (scene.id !== id) {
        console.warn(`ID de cena diverge do caminho: ${id} vs ${scene.id}`);
      }
      scenes.set(scene.id, scene);
    } catch (e) {
      console.error(`Falha ao carregar cena ${path}`, e);
      throw e;
    }
  }
  canonicalSceneCache.set(campaignId, scenes);
  return scenes;
}

export function getRegisteredCampaignIds(): string[] {
  return Object.keys(LOADERS);
}

export function isCampaignRegistered(id: string): boolean {
  return id in LOADERS;
}

export function loadCampaignContent(campaignId: string, locale: Locale = getLocale()): CampaignContentBundle {
  const load = LOADERS[campaignId];
  if (!load) {
    throw new Error(`Unknown campaign: "${campaignId}". Registered: ${getRegisteredCampaignIds().join(', ')}`);
  }
  return load(locale);
}

/**
 * Pipeline único de conteúdo:
 * 1) load bundle bruto -> 2) parse markdown -> 3) validar ids -> 4) disponibilizar mapa de cenas.
 */
export function loadParsedCampaignContent(
  campaignId: string,
  locale: Locale = getLocale()
): ParsedCampaignContentBundle {
  const { data, ui } = loadCampaignContent(campaignId, locale);
  const canonical = parseCanonicalScenes(campaignId);
  const scenes = new Map<string, LoadedScene>();
  for (const [id, scene] of canonical) {
    let localized = scene;
    if (locale !== 'pt-BR') {
      if (campaignId === 'calvario') localized = applyCalvarioSceneOverlay(scene, locale);
      else if (campaignId === 'demo') localized = applyDemoSceneLocaleOverlay(scene, locale);
    }
    scenes.set(id, localized);
  }
  return { data, ui, scenes };
}
