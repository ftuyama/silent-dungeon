import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DAILY_COMBAT_REWARD,
  dailyCombatCopyForChapter,
  dailyCombatEncounterForChapter,
  dailyCombatRewardEffects,
  hasSlotDailyCombatWonToday,
  isDailyCombatEncounter,
  markSlotDailyCombatWon,
  slotDailyCombatDateKey,
} from '../../src/ui/gameAppDailyCombat.ts';
import encountersJson from '../../src/campaigns/calvario/data/encounters.json';

describe('dailyCombatEncounterForChapter', () => {
  it('maps every hub chapter to an encounter that exists in the campaign data', () => {
    for (const chapter of [2, 3, 5, 6]) {
      const id = dailyCombatEncounterForChapter(chapter);
      expect(id).not.toBeNull();
      expect((encountersJson as Record<string, unknown>)[id!]).toBeDefined();
    }
  });

  it('returns null for chapters without a hub', () => {
    expect(dailyCombatEncounterForChapter(1)).toBeNull();
    expect(dailyCombatEncounterForChapter(4)).toBeNull();
    expect(dailyCombatEncounterForChapter(7)).toBeNull();
  });
});

describe('isDailyCombatEncounter', () => {
  it('recognizes daily encounter ids and rejects wild encounter ids', () => {
    expect(isDailyCombatEncounter('daily_hub_ch2')).toBe(true);
    expect(isDailyCombatEncounter('daily_hub_ch6')).toBe(true);
    expect(isDailyCombatEncounter('rats_cellar_pair')).toBe(false);
    expect(isDailyCombatEncounter('act6_wild_fragment_solo')).toBe(false);
  });
});

describe('rewards', () => {
  it('pays more gold than the day-7 login bonus and respects engine caps', () => {
    expect(DAILY_COMBAT_REWARD.gold).toBeGreaterThan(0);
    expect(DAILY_COMBAT_REWARD.supply).toBeLessThanOrEqual(10);
    expect(DAILY_COMBAT_REWARD.xp).toBeGreaterThan(0);
  });

  it('builds addResource and addXp effects matching the fixed reward', () => {
    expect(dailyCombatRewardEffects()).toEqual([
      { op: 'addResource', resource: 'gold', delta: DAILY_COMBAT_REWARD.gold },
      { op: 'addResource', resource: 'supply', delta: DAILY_COMBAT_REWARD.supply },
      { op: 'addXp', amount: DAILY_COMBAT_REWARD.xp },
    ]);
  });
});

describe('dailyCombatCopyForChapter', () => {
  it('returns thematic copy for hub chapters and null elsewhere', () => {
    for (const chapter of [2, 3, 5, 6]) {
      const copy = dailyCombatCopyForChapter(chapter);
      expect(copy).not.toBeNull();
      expect(copy!.choiceText.length).toBeGreaterThan(0);
      expect(copy!.choicePreview.length).toBeGreaterThan(0);
      expect(copy!.uiSection.length).toBeGreaterThan(0);
      expect(copy!.victoryTitle.length).toBeGreaterThan(0);
      expect(copy!.victorySubtitle.length).toBeGreaterThan(0);
      expect(copy!.choiceText).not.toMatch(/desafio|diário|daily|challenge/i);
      expect(copy!.choicePreview).not.toMatch(/\+?\d+\s*(ouro|gold|XP|xp)/i);
    }
    expect(dailyCombatCopyForChapter(1)).toBeNull();
    expect(dailyCombatCopyForChapter(4)).toBeNull();
  });
});

describe('per-slot daily win tracking', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
    };
  });

  afterEach(() => {
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  it('is unclaimed by default and claimed after marking the win', () => {
    expect(hasSlotDailyCombatWonToday('calvario', 1, '2026-07-08')).toBe(false);
    markSlotDailyCombatWon('calvario', 1, '2026-07-08');
    expect(hasSlotDailyCombatWonToday('calvario', 1, '2026-07-08')).toBe(true);
  });

  it('resets on the next day and tracks slots independently', () => {
    markSlotDailyCombatWon('calvario', 1, '2026-07-08');
    expect(hasSlotDailyCombatWonToday('calvario', 1, '2026-07-09')).toBe(false);
    expect(hasSlotDailyCombatWonToday('calvario', 2, '2026-07-08')).toBe(false);
  });

  it('uses a key separate from the login bonus slot key', () => {
    expect(slotDailyCombatDateKey('calvario', 3)).toBe('calvario_daily_combat_date_v1_s3');
  });
});
