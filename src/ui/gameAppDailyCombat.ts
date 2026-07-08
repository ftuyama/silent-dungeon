import type { Effect } from '../engine/schema/index.ts';
import type { LoadedScene } from '../engine/core/index.ts';
import { todayDateKey } from './gameAppDailyBonus.ts';
import { t } from '../i18n/index.ts';

/** Id sintético da escolha injetada nos hubs (nunca chega ao motor; tratado em `applyChoice`). */
export const DAILY_COMBAT_CHOICE_ID = 'daily_hub_combat';

/** Recompensa fixa do desafio diário (acima do dia 7 do bônus de login). Limites do motor: ouro 0–999, suprimento 0–10. */
export const DAILY_COMBAT_REWARD = { gold: 12, supply: 2, xp: 12 } as const;

/** Encontro do desafio diário por capítulo com hub; capítulos sem hub não têm desafio. */
const DAILY_COMBAT_ENCOUNTERS_BY_CHAPTER: Readonly<Record<number, string>> = {
  2: 'daily_hub_ch2',
  3: 'daily_hub_ch3',
  5: 'daily_hub_ch5',
  6: 'daily_hub_ch6',
};

export function dailyCombatEncounterForChapter(chapter: number): string | null {
  return DAILY_COMBAT_ENCOUNTERS_BY_CHAPTER[chapter] ?? null;
}

export function isDailyCombatEncounter(encounterId: string): boolean {
  return Object.values(DAILY_COMBAT_ENCOUNTERS_BY_CHAPTER).includes(encounterId);
}

export function isHubScene(scene: LoadedScene): boolean {
  return scene.frontmatter.type === 'hub';
}

export function dailyCombatRewardEffects(): Effect[] {
  return [
    { op: 'addResource', resource: 'gold', delta: DAILY_COMBAT_REWARD.gold },
    { op: 'addResource', resource: 'supply', delta: DAILY_COMBAT_REWARD.supply },
    { op: 'addXp', amount: DAILY_COMBAT_REWARD.xp },
  ];
}

/** Texto curto do prêmio ("+12 ouro · +2 suprimento · +12 XP"). */
export function dailyCombatRewardLabel(): string {
  return [
    t('dailyCombat.rewardGold', { n: String(DAILY_COMBAT_REWARD.gold) }),
    t('dailyCombat.rewardSupply', { n: String(DAILY_COMBAT_REWARD.supply) }),
    t('dailyCombat.rewardXp', { n: String(DAILY_COMBAT_REWARD.xp) }),
  ].join(' · ');
}

export type DailyCombatCopy = {
  choiceText: string;
  choicePreview: string;
  uiSection: string;
  victoryTitle: string;
  victorySubtitle: string;
};

/** Rótulos temáticos por capítulo — escolha e vitória disfarçam a mecânica diária. */
export function dailyCombatCopyForChapter(chapter: number): DailyCombatCopy | null {
  if (!dailyCombatEncounterForChapter(chapter)) return null;
  const key = `dailyCombat.ch${chapter}`;
  return {
    choiceText: t(`${key}.choiceText`),
    choicePreview: t(`${key}.choicePreview`),
    uiSection: t(`${key}.uiSection`),
    victoryTitle: t(`${key}.victoryTitle`),
    victorySubtitle: t(`${key}.victorySubtitle`),
  };
}

/** localStorage: último dia (YYYY-MM-DD) em que o desafio diário foi vencido neste slot. */
export function slotDailyCombatDateKey(campaignId: string, slot: number): string {
  return `${campaignId}_daily_combat_date_v1_s${slot}`;
}

export function hasSlotDailyCombatWonToday(
  campaignId: string,
  slot: number,
  today: string = todayDateKey()
): boolean {
  try {
    return localStorage.getItem(slotDailyCombatDateKey(campaignId, slot)) === today;
  } catch {
    return false;
  }
}

export function markSlotDailyCombatWon(
  campaignId: string,
  slot: number,
  today: string = todayDateKey()
): void {
  try {
    localStorage.setItem(slotDailyCombatDateKey(campaignId, slot), today);
  } catch {
    /* noop */
  }
}
