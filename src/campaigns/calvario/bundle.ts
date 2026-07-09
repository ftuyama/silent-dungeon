import {
  CampaignIndexSchema,
  EncounterSchema,
  type CompanionDef,
  type DialogueEnemyDef,
  type EnemyDef,
  type Encounter,
  type ItemDef,
  type SpellDef,
} from '../../engine/schema/index.ts';
import { DialogueEnemyDefSchema } from '../../engine/schema/dialogueCombat.ts';
import { emptyGameData } from '../../engine/data/index.ts';
import { validateExplorationGraphCatalog } from '../../engine/world/index.ts';
import type { CampaignUIAdapter } from '../campaignUi.ts';
import campaignIndex from './index.json';
import { enemies as enemiesTs } from './data/enemies.ts';
import { dialogueEnemies as dialogueEnemiesTs } from './data/dialogueEnemies/index.ts';
import { items as itemsTs } from './data/items.ts';
import encounters from './data/encounters.json';
import companions from './data/companions.json';
import { spells as spellsTs } from './data/spells.ts';
import { journeyMarks as journeyMarksTs } from './data/journeyMarks.ts';
import { leadStoryPassives as leadStoryPassivesTs, passives as passivesTs } from './data/passives.ts';
import { legacyUpgrades as legacyUpgradesTs } from './data/legacyUpgrades.ts';
import { calvarioHeroNarrative } from './heroNarrative.ts';
import { renderMap } from './maps.ts';
import { SCENE_ART } from './ascii/art.ts';
import { getHeroClassLabel, getHeroLore, getHeroStoryProgress } from './classHero.ts';
import { getCompanionLore, getCompanionStoryProgress } from './classCompanion.ts';
import { getMainMission } from './mainMission.ts';
import { EXPLORATION_GRAPHS } from './exploration/graphs.ts';

import { pickSceneFilesFromGlob } from '../sceneLocale.ts';
import type { Locale } from '../../i18n/locale.ts';
import { applyCampaignIndexOverlay, applyEntityLocaleOverlay } from './localeLoad.ts';

const SCENE_GLOB_PT = import.meta.glob<string>('./scenes/pt-BR/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

validateExplorationGraphCatalog(EXPLORATION_GRAPHS);

export const calvarioUI: CampaignUIAdapter = {
  renderMap,
  sceneArt: SCENE_ART,
  getHeroClassLabel,
  getHeroLore,
  getHeroStoryProgress,
  getCompanionLore,
  getCompanionStoryProgress,
  getExplorationGraph: (id: string) => EXPLORATION_GRAPHS[id] ?? null,
  getMainMission,
};

export function loadCalvarioContent(locale: Locale) {
  const idx = CampaignIndexSchema.parse(applyCampaignIndexOverlay(campaignIndex, locale));
  const data = emptyGameData(idx, calvarioHeroNarrative);
  /** Clone antes do overlay de locale — evita mutar o módulo fonte entre pt-BR e en-US. */
  data.enemies = structuredClone(enemiesTs) as Record<string, EnemyDef>;
  for (const def of Object.values(dialogueEnemiesTs)) {
    DialogueEnemyDefSchema.parse(def);
  }
  data.dialogueEnemies = structuredClone(dialogueEnemiesTs) as Record<string, DialogueEnemyDef>;
  const encRecord: Record<string, Encounter> = {};
  for (const [key, raw] of Object.entries(encounters as Record<string, unknown>)) {
    const enc = EncounterSchema.parse(raw);
    if (
      enc.combatType === 'battle' &&
      (enc.twists?.length ?? 0) > 0 &&
      !enc.isBoss
    ) {
      throw new Error(`[calvario] Encounter "${enc.id}" has twists but isBoss is not true`);
    }
    encRecord[key] = enc;
  }
  data.encounters = encRecord;
  data.items = structuredClone(itemsTs) as Record<string, ItemDef>;
  data.companions = structuredClone(companions) as Record<string, CompanionDef>;
  data.spells = structuredClone(spellsTs) as Record<string, SpellDef>;
  data.passives = structuredClone(passivesTs);
  data.journeyMarks = structuredClone(journeyMarksTs);
  data.leadStoryPassives = structuredClone(leadStoryPassivesTs);
  data.legacyUpgrades = structuredClone(legacyUpgradesTs);
  applyEntityLocaleOverlay(data, locale);
  return { data, sceneFiles: pickSceneFilesFromGlob(SCENE_GLOB_PT), ui: calvarioUI };
}
