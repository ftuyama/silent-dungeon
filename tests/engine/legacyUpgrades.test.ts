import { describe, expect, it } from 'vitest';
import {
  applyEffects,
  createInitialState,
  createPlayerCharacter,
  EventBus,
} from '../../src/engine/core/index.ts';
import {
  computeLegacyEchoGain,
  RUN_SETTLED_FLAG,
} from '../../src/engine/core/effects/legacySummary.ts';
import { legacyUpgrades } from '../../src/campaigns/calvario/data/legacyUpgrades.ts';
import { testCampaign, createTestData } from '../helpers/engineTestData.ts';

const testGameData = createTestData();

function stateWithProgress() {
  let s = createInitialState(testCampaign, 42);
  s = {
    ...s,
    chapter: 5,
    level: 7,
    marks: ['a', 'b', 'c', 'd', 'e', 'f'],
    party: [createPlayerCharacter('Test', 'knight')],
    legacy: {
      ...s.legacy,
      echoes: 20,
      unlockedUpgrades: [],
    },
  };
  return s;
}

describe('legacy echo gain', () => {
  it('victory grants more than defeat', () => {
    const s = stateWithProgress();
    const defeat = computeLegacyEchoGain(s, 'defeat');
    const victory = computeLegacyEchoGain(s, 'victory');
    expect(victory).toBeGreaterThan(defeat);
  });
});

describe('settleRun', () => {
  it('is idempotent via run_settled flag', () => {
    const bus = new EventBus();
    const ctx = { sceneId: 'shared/game_over', data: { ...testGameData, legacyUpgrades }, bus };
    let s = stateWithProgress();
    s = applyEffects(s, [{ op: 'settleRun', outcome: 'defeat' }], ctx);
    const echoesAfterFirst = s.legacy.echoes;
    s = applyEffects(s, [{ op: 'settleRun', outcome: 'defeat' }], ctx);
    expect(s.legacy.echoes).toBe(echoesAfterFirst);
    expect(s.flags[RUN_SETTLED_FLAG]).toBe(true);
    expect(s.legacy.lastRunStats?.gain).toBeGreaterThan(0);
  });
});

describe('purchaseLegacyUpgrade', () => {
  it('debits echoes and prevents repurchase', () => {
    const bus = new EventBus();
    const ctx = { sceneId: 'shared/game_over', data: { ...testGameData, legacyUpgrades }, bus };
    let s = stateWithProgress();
    s = applyEffects(s, [{ op: 'purchaseLegacyUpgrade', upgradeId: 'legacy_start_gold' }], ctx);
    expect(s.legacy.unlockedUpgrades).toContain('legacy_start_gold');
    expect(s.legacy.echoes).toBe(17);
    const again = applyEffects(s, [{ op: 'purchaseLegacyUpgrade', upgradeId: 'legacy_start_gold' }], ctx);
    expect(again.legacy.echoes).toBe(17);
  });

  it('rejects purchase when balance is insufficient', () => {
    const bus = new EventBus();
    const ctx = { sceneId: 'shared/game_over', data: { ...testGameData, legacyUpgrades }, bus };
    let s = stateWithProgress();
    s = { ...s, legacy: { ...s.legacy, echoes: 2 } };
    s = applyEffects(s, [{ op: 'purchaseLegacyUpgrade', upgradeId: 'legacy_max_hp' }], ctx);
    expect(s.legacy.unlockedUpgrades).not.toContain('legacy_max_hp');
    expect(s.legacy.echoes).toBe(2);
  });
});

describe('resetRun applies legacy upgrades', () => {
  it('applies resource and stat upgrades on new run', () => {
    const bus = new EventBus();
    const ctx = { sceneId: 'shared/game_over', data: { ...testGameData, legacyUpgrades }, bus };
    let s = stateWithProgress();
    s = applyEffects(s, [{ op: 'settleRun', outcome: 'defeat' }], ctx);
    s = applyEffects(s, [{ op: 'purchaseLegacyUpgrade', upgradeId: 'legacy_start_gold' }], ctx);
    s = applyEffects(s, [{ op: 'purchaseLegacyUpgrade', upgradeId: 'legacy_stat_str' }], ctx);
    s = applyEffects(s, [{ op: 'resetRun' }], ctx);
    expect(s.legacy.unlockedUpgrades).toContain('legacy_start_gold');
    expect(s.legacy.unlockedUpgrades).toContain('legacy_stat_str');
    expect(s.resources.gold).toBeGreaterThanOrEqual(13);
    const afterClass = applyEffects(s, [{ op: 'initClass', class: 'knight' }], ctx);
    expect(afterClass.party[0]?.str).toBeGreaterThan(12);
    expect(afterClass.flags.act1_class_chosen).toBe(true);
  });
});
