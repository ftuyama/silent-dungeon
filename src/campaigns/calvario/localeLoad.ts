import type { Locale } from '../../i18n/locale.ts';
import type { CampaignIndex } from '../../engine/schema/index.ts';
import type { GameData } from '../../engine/data/index.ts';
import type { LoadedScene } from '../../engine/core/index.ts';
import indexEn from './locales/en-US/index.json';
import entitiesEn from './locales/en-US/entities.json';
import dialogueEn from './locales/en-US/dialogue.json';
import sceneAct1En from './locales/en-US/scenes/act1.json';
import sceneAct2En from './locales/en-US/scenes/act2.json';
import sceneAct3En from './locales/en-US/scenes/act3.json';
import sceneAct4En from './locales/en-US/scenes/act4.json';
import sceneAct5En from './locales/en-US/scenes/act5.json';
import sceneAct6En from './locales/en-US/scenes/act6.json';
import sceneAct7En from './locales/en-US/scenes/act7.json';
import sceneMiscEn from './locales/en-US/scenes/misc.json';
import narrativeEn from './locales/en-US/narrative.json';
import explorationEn from './locales/en-US/exploration.json';
import { mergeSceneOverlay, type SceneOverlay } from '../sceneOverlayApply.ts';

export type CampaignIndexOverlay = {
  name: string;
  chapterTitles: Record<string, string>;
  endings: Record<string, { title: string; blurb: string }>;
};

export type EntityOverlay = {
  items?: Record<string, { name?: string; description?: string }>;
  spells?: Record<string, { name?: string; description?: string }>;
  enemies?: Record<string, { name?: string }>;
  companions?: Record<string, { name?: string; lorePt?: string }>;
  journeyMarks?: Record<string, { name?: string; description?: string }>;
  passives?: Record<string, { name?: string; description?: string }>;
  leadStoryPassives?: Record<string, { name?: string; description?: string }>;
};

type DialogueChoiceOverlay = { text?: string };
type DialogueNodeOverlay = { line?: string; choices?: DialogueChoiceOverlay[] };
type DialogueEnemyOverlay = { name?: string; nodes?: Record<string, DialogueNodeOverlay> };

export type NarrativeOverlay = {
  heroLore?: Record<string, string>;
  heroPathLabels?: Record<string, string>;
  heroPathPromotion?: Record<string, string>;
  heroPathLore?: Record<string, string>;
  heroPathBackstory?: Record<string, string>;
  heroPassiveLore?: Record<string, string>;
  heroChapterLore?: Record<string, { mid?: string; late?: string }>;
  heroLeadPassiveLore?: Record<string, string>;
  companionLore?: Record<string, string>;
  campCombatHints?: string[];
  campCombatHintParty?: string;
};

export type ExplorationOverlay = Record<string, Record<string, { text?: string }>>;

const INDEX_OVERLAY_EN = indexEn as CampaignIndexOverlay;
const ENTITY_OVERLAY_EN = entitiesEn as EntityOverlay;

const SCENE_OVERLAYS_EN: Record<string, SceneOverlay> = {
  ...(sceneAct1En as Record<string, SceneOverlay>),
  ...(sceneAct2En as Record<string, SceneOverlay>),
  ...(sceneAct3En as Record<string, SceneOverlay>),
  ...(sceneAct4En as Record<string, SceneOverlay>),
  ...(sceneAct5En as Record<string, SceneOverlay>),
  ...(sceneAct6En as Record<string, SceneOverlay>),
  ...(sceneAct7En as Record<string, SceneOverlay>),
  ...(sceneMiscEn as Record<string, SceneOverlay>),
};

const DIALOGUE_OVERLAY_EN = dialogueEn as Record<string, DialogueEnemyOverlay>;
const NARRATIVE_OVERLAY_EN = narrativeEn as NarrativeOverlay;
const EXPLORATION_OVERLAY_EN = explorationEn as ExplorationOverlay;

export function applyCampaignIndexOverlay(base: CampaignIndex, locale: Locale): CampaignIndex {
  if (locale === 'pt-BR') return base;
  const overlay = INDEX_OVERLAY_EN;
  return {
    ...base,
    name: overlay.name ?? base.name,
    chapterTitles: { ...base.chapterTitles, ...overlay.chapterTitles },
    endings: mergeEndings(base.endings, overlay.endings),
  };
}

function mergeEndings(
  base: CampaignIndex['endings'],
  overlay: CampaignIndexOverlay['endings']
): CampaignIndex['endings'] {
  const out = { ...base };
  for (const [id, entry] of Object.entries(overlay)) {
    out[id] = { ...out[id], ...entry };
  }
  return out;
}

export function applySceneLocaleOverlay(scene: LoadedScene, locale: Locale): LoadedScene {
  if (locale === 'pt-BR') return scene;
  return mergeSceneOverlay(scene, SCENE_OVERLAYS_EN[scene.id]);
}

export function applyEntityLocaleOverlay(data: GameData, locale: Locale): void {
  if (locale === 'pt-BR') return;
  const overlay = ENTITY_OVERLAY_EN;
  applyRecordOverlay(data.items, overlay.items, (def, o) => {
    if (o.name) def.name = o.name;
  });
  applyRecordOverlay(data.spells, overlay.spells, (def, o) => {
    if (o.name) def.name = o.name;
  });
  applyRecordOverlay(data.enemies, overlay.enemies, (def, o) => {
    if (o.name) def.name = o.name;
  });
  applyRecordOverlay(data.companions, overlay.companions, (def, o) => {
    if (o.name) def.name = o.name;
    if (o.lorePt) def.lorePt = o.lorePt;
  });
  if (overlay.journeyMarks) {
    for (const [id, patch] of Object.entries(overlay.journeyMarks)) {
      const def = data.journeyMarks[id];
      if (def && patch.name) def.name = patch.name;
      if (def && patch.description) def.description = patch.description;
    }
  }
  if (overlay.passives) {
    for (const [id, patch] of Object.entries(overlay.passives)) {
      const def = data.passives[id as keyof typeof data.passives];
      if (def && patch.name) def.name = patch.name;
      if (def && patch.description) def.description = patch.description;
    }
  }
  if (overlay.leadStoryPassives) {
    for (const [id, patch] of Object.entries(overlay.leadStoryPassives)) {
      const def = data.leadStoryPassives[id];
      if (def && patch.name) def.name = patch.name;
      if (def && patch.description) def.description = patch.description;
    }
  }
  applyDialogueLocaleOverlay(data);
}

function applyDialogueLocaleOverlay(data: GameData): void {
  for (const [enemyId, enemyOv] of Object.entries(DIALOGUE_OVERLAY_EN)) {
    const def = data.dialogueEnemies[enemyId];
    if (!def) continue;
    if (enemyOv.name) def.name = enemyOv.name;
    if (!enemyOv.nodes) continue;
    for (const [nodeId, nodeOv] of Object.entries(enemyOv.nodes)) {
      const node = def.graph.nodes[nodeId];
      if (!node) continue;
      if (nodeOv.line) node.line = nodeOv.line;
      if (nodeOv.choices && node.choices) {
        node.choices = node.choices.map((choice, i) => {
          const co = nodeOv.choices?.[i];
          if (!co?.text) return choice;
          return { ...choice, text: co.text };
        });
      }
    }
  }
}

export function getNarrativeOverlay(locale: Locale): NarrativeOverlay | null {
  if (locale === 'pt-BR') return null;
  return NARRATIVE_OVERLAY_EN;
}

export function getExplorationOverlay(locale: Locale): ExplorationOverlay | null {
  if (locale === 'pt-BR') return null;
  return EXPLORATION_OVERLAY_EN;
}

function applyRecordOverlay<T extends { id?: string }>(
  target: Record<string, T>,
  overlay: Record<string, Partial<T>> | undefined,
  merge: (def: T, o: Partial<T>) => void
): void {
  if (!overlay) return;
  for (const [id, patch] of Object.entries(overlay)) {
    const def = target[id];
    if (def) merge(def, patch);
  }
}
