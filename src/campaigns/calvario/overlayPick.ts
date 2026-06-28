import { getLocale } from '../../i18n/index.ts';
import {
  getExplorationOverlay,
  getNarrativeOverlay,
  type NarrativeOverlay,
} from './localeLoad.ts';

function narrativeOverlayMap<K extends keyof NarrativeOverlay>(
  key: K
): NarrativeOverlay[K] | undefined {
  return getNarrativeOverlay(getLocale())?.[key];
}

export function pickNarrativeString(
  mapKey: keyof NarrativeOverlay,
  id: string,
  fallback: string
): string {
  const map = narrativeOverlayMap(mapKey);
  if (map && typeof map === 'object' && !Array.isArray(map) && id in map) {
    const value = (map as Record<string, string>)[id];
    if (value?.trim()) return value;
  }
  return fallback;
}

export function pickNarrativeChapterLore(
  classId: string,
  beat: 'mid' | 'late',
  fallback: string
): string {
  const chapter = narrativeOverlayMap('heroChapterLore')?.[classId];
  const value = chapter?.[beat];
  return value?.trim() ? value : fallback;
}

export function pickCampCombatHints(fallback: readonly string[]): string[] {
  const hints = narrativeOverlayMap('campCombatHints');
  return hints?.length ? hints : [...fallback];
}

export function pickCampCombatHintParty(fallback: string): string {
  const hint = narrativeOverlayMap('campCombatHintParty');
  return hint?.trim() ? hint : fallback;
}

export function pickExplorationEdgeText(
  graphId: string,
  edgeId: string,
  fallback: string
): string {
  if (getLocale() === 'pt-BR') return fallback;
  const text = getExplorationOverlay(getLocale())?.[graphId]?.[edgeId]?.text;
  return text?.trim() ? text : fallback;
}
