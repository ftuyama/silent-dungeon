import { describe, expect, it } from 'vitest';
import {
  beginEncounter,
  fleeCombat,
  fleeDifficultyTn,
  finishCombat,
  getCharacterArmorClass,
  refreshCombatLogInitiativeLabels,
  resolveHitChance,
  agiToArmorClassMod,
} from '../../src/engine/combat/index.ts';
import { createInitialState, createPlayerCharacter } from '../../src/engine/core/index.ts';
import type { EnemyDef, Encounter, ItemDef } from '../../src/engine/schema/index.ts';
import { createTestData, testCampaign } from '../helpers/engineTestData.ts';

const leather: ItemDef = {
  id: 'leather',
  name: 'Leather',
  slot: 'armor',
  bonusStr: 0,
  bonusAgi: 0,
  bonusMind: 0,
  bonusLuck: 0,
  armor: 2,
  damage: 0,
};

describe('getCharacterArmorClass', () => {
  it('uses 7 + agiToArmorClassMod(AGI) + item armor', () => {
    const data = createTestData();
    data.items = { leather };
    const knight = createPlayerCharacter('K', 'knight');
    // knight agi 9 -> mod 1; CA = 7 + 1 + 2 = 10
    expect(getCharacterArmorClass(data, { ...knight, armorId: 'leather' })).toBe(10);
  });

  it('applies soft diminishing AGI contribution above mod +4', () => {
    const data = createTestData();
    data.items = {};
    const archer = createPlayerCharacter('A', 'archer');
    // agi 13 -> mod 3 -> +3; CA = 7 + 3 + 0 = 10
    expect(getCharacterArmorClass(data, { ...archer, agi: 13, armorId: null, relicId: null })).toBe(10);
    // agi 22 -> mod 8 -> 4 + floor(4/2) = 6; CA = 13
    expect(getCharacterArmorClass(data, { ...archer, agi: 22, armorId: null, relicId: null })).toBe(13);
    // agi 32 -> mod 13 -> 4 + floor(9/2) = 8; CA = 15
    expect(getCharacterArmorClass(data, { ...archer, agi: 32, armorId: null, relicId: null })).toBe(15);
  });
});

describe('agiToArmorClassMod', () => {
  it('is full mod through +4, then half of excess', () => {
    expect(agiToArmorClassMod(13)).toBe(3);
    expect(agiToArmorClassMod(14)).toBe(4);
    expect(agiToArmorClassMod(22)).toBe(6);
    expect(agiToArmorClassMod(32)).toBe(8);
  });
});

describe('resolveHitChance', () => {
  it('is 50% when attack equals defense', () => {
    expect(resolveHitChance(13, 13)).toBe(0.5);
  });

  it('gains 8% per point above defense, capped at 95%', () => {
    expect(resolveHitChance(18, 13)).toBeCloseTo(0.9);
    expect(resolveHitChance(30, 13)).toBe(0.95);
  });

  it('loses 8% per point below defense, floored at 5%', () => {
    expect(resolveHitChance(8, 13)).toBeCloseTo(0.1);
    expect(resolveHitChance(1, 13)).toBe(0.05);
  });
});

const dummyEnemy: EnemyDef = {
  id: 'dummy',
  name: 'Boneco',
  hp: 20,
  maxHp: 20,
  str: 6,
  agi: 6,
  mind: 6,
  armor: 0,
  type: 'normal',
  armorChips: 0,
  sprite: 'x',
  attackStrategy: 'random',
};

function combatTestData() {
  const data = createTestData();
  data.enemies = { dummy: dummyEnemy };
  data.encounters = {
    flee_ok: { combatType: 'battle', id: 'flee_ok', enemies: ['dummy'], fleeRate: 1 },
    flee_fail: { combatType: 'battle', id: 'flee_fail', enemies: ['dummy'], fleeRate: 0 },
    flee_default: { combatType: 'battle', id: 'flee_default', enemies: ['dummy'] },
    x: { combatType: 'battle', id: 'x', enemies: ['dummy'], fleeRate: 1 },
  };
  return data;
}

describe('fleeDifficultyTn', () => {
  it('maps fleeRate to TN in7..12', () => {
    expect(fleeDifficultyTn(1)).toBe(7);
    expect(fleeDifficultyTn(0)).toBe(12);
    expect(fleeDifficultyTn(0.5)).toBe(10);
  });
});

describe('finishCombat XP', () => {
  it('awards XP and lastCombatXpGain on battle victory', () => {
    const data = combatTestData();
    data.enemies = {
      dummy: { ...dummyEnemy, hp: 1, maxHp: 1, xp: 22 },
    };
    const enc: Encounter = { combatType: 'battle', id: 'x', enemies: ['dummy'] };
    let state = createInitialState(testCampaign, 77);
    state.party = [createPlayerCharacter('Hero', 'knight')];
    state = beginEncounter(state, enc, data, { returnScene: 'hub', onVictory: 'won' });
    const c = state.combat!;
    const after = finishCombat(
      state,
      {
        ...c,
        enemies: c.enemies.map((e) => ({ ...e, hp: 0 })),
        log: [...c.log, { kind: 'info', message: 'Vitória.' }],
        phase: 'ended',
      },
      true,
      data
    );
    expect(after.mode).toBe('story');
    expect(after.sceneId).toBe('won');
    expect(after.xp).toBe(22);
    expect(after.lastCombatXpGain).toBe(22);
  });
});

describe('fleeCombat', () => {
  it('escapes on success and goes to onFlee scene', () => {
    const data = combatTestData();
    const enc: Encounter = {
      combatType: 'battle',
      id: 'flee_ok',
      enemies: ['dummy'],
      fleeRate: 1,
    };
    let state = createInitialState(testCampaign, 42_424);
    state.party = [{ ...createPlayerCharacter('Ágil', 'knight'), agi: 18 }];
    state = beginEncounter(state, enc, data, {
      returnScene: 'hub',
      onFlee: 'cena_fuga',
    });
    const after = fleeCombat(state, data);
    expect(after.mode).toBe('story');
    expect(after.combat).toBeNull();
    expect(after.sceneId).toBe('cena_fuga');
  });

  it('failed flee consumes the player turn and advances to next player round', () => {
    const data = combatTestData();
    const enc: Encounter = {
      combatType: 'battle',
      id: 'flee_fail',
      enemies: ['dummy'],
      fleeRate: 0,
    };
    let state = createInitialState(testCampaign, 99_001);
    state.party = [{ ...createPlayerCharacter('Lento', 'knight'), agi: 3 }];
    state = beginEncounter(state, enc, data, { returnScene: 'hub', onFlee: 'cena_fuga' });
    const startRound = state.combat!.round;
    const after = fleeCombat(state, data);
    expect(after.mode).toBe('combat');
    expect(after.combat).not.toBeNull();
    expect(after.combat!.round).toBe(startRound + 1);
    expect(after.combat!.phase).toBe('choose_stance');
    const msg = after.combat!.log.some((e) => e.message.includes('não consegue fugir'));
    expect(msg).toBe(true);
  });

  it('uses fleeRate 0.5 when encounter omits fleeRate', () => {
    const data = combatTestData();
    const enc: Encounter = {
      combatType: 'battle',
      id: 'flee_default',
      enemies: ['dummy'],
    };
    let state = createInitialState(testCampaign, 7);
    state.party = [{ ...createPlayerCharacter('X', 'knight'), agi: 1 }];
    state = beginEncounter(state, enc, data, { returnScene: 'hub' });
    expect(state.combat!.fleeRate).toBeUndefined();
    const after = fleeCombat(state, data);
    expect(after.mode).toBe('combat');
    const tnLine = after.combat!.log.find(
      (e) => e.kind === 'info' && e.message.includes('vs TN 10')
    );
    expect(tnLine).toBeDefined();
  });

  it('no-ops when not in choose_stance phase', () => {
    const data = combatTestData();
    const enc: Encounter = { combatType: 'battle', id: 'x', enemies: ['dummy'], fleeRate: 1 };
    let state = createInitialState(testCampaign, 1);
    state.party = [createPlayerCharacter('H', 'knight')];
    state = beginEncounter(state, enc, data, { returnScene: 'hub', onFlee: 'f' });
    const mid = {
      ...state,
      combat: { ...state.combat!, phase: 'enemy' as const },
    };
    expect(fleeCombat(mid, data)).toBe(mid);
  });
});

describe('refreshCombatLogInitiativeLabels', () => {
  it('updates initiative label names when game data names change', () => {
    const data = combatTestData();
    data.enemies = { dummy: { ...dummyEnemy, name: 'Boneco' } };
    const enc: Encounter = { combatType: 'battle', id: 'x', enemies: ['dummy'] };
    let state = createInitialState(testCampaign, 12345);
    state.party = [createPlayerCharacter('Herói', 'knight')];
    state = beginEncounter(state, enc, data, { returnScene: 'hub' });
    const entry = state.combat!.log.find((e) => e.initiativeLabels);
    expect(entry?.initiativeLabels).toContain('Boneco');

    const localized = {
      ...data,
      enemies: { dummy: { ...dummyEnemy, name: 'Dummy' } },
    };
    const refreshed = refreshCombatLogInitiativeLabels(state, localized);
    const refreshedEntry = refreshed.combat!.log.find((e) => e.initiativeLabels);
    expect(refreshedEntry?.initiativeLabels).toContain('Dummy');
    expect(refreshedEntry?.initiativeLabels).not.toContain('Boneco');
  });

  it('no-ops outside combat', () => {
    const data = combatTestData();
    let state = createInitialState(testCampaign, 1);
    state.party = [createPlayerCharacter('H', 'knight')];
    expect(refreshCombatLogInitiativeLabels(state, data)).toBe(state);
  });
});
