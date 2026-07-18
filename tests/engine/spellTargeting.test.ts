import { describe, expect, it } from 'vitest';
import {
  beginEncounter,
  executeSpellTurn,
  playerAttack,
  playerSpellOnAlly,
  playerSpellOnEnemy,
} from '../../src/engine/combat/index.ts';
import { createInitialState, createPlayerCharacter } from '../../src/engine/core/index.ts';
import { initialKnownSpellIds } from '../../src/engine/progression/index.ts';
import type { EnemyDef, Encounter } from '../../src/engine/schema/index.ts';
import { createTestData, testCampaign } from '../helpers/engineTestData.ts';
import { spells as calvarioSpells } from '../../src/campaigns/calvario/data/spells.ts';

const dummyA: EnemyDef = {
  id: 'dummy_a',
  name: 'Alvo A',
  hp: 20,
  maxHp: 20,
  str: 6,
  agi: 6,
  mind: 6,
  armor: 0,
  type: 'normal',
  armorChips: 0,
  sprite: 'a',
  attackStrategy: 'random',
};

const dummyB: EnemyDef = {
  ...dummyA,
  id: 'dummy_b',
  name: 'Alvo B',
};

function dualEnemyCombat(
  seed: number,
  heroClass: 'mage' | 'cleric' | 'archer',
  heroName: string,
  partyExtras: ReturnType<typeof createPlayerCharacter>[] = []
) {
  const data = createTestData();
  data.spells = { ...calvarioSpells };
  data.enemies = { dummy_a: dummyA, dummy_b: dummyB };
  const enc: Encounter = { combatType: 'battle', id: 'x', enemies: ['dummy_a', 'dummy_b'] };
  let state = createInitialState(testCampaign, seed);
  const lead = createPlayerCharacter(heroName, heroClass);
  state = {
    ...state,
    party: [lead, ...partyExtras],
    level: 1,
    knownSpells: initialKnownSpellIds(lead, data),
  };
  state = beginEncounter(state, enc, data, { returnScene: 'hub' });
  return { state, data };
}

describe('spell targeting', () => {
  it('mage damage spell enters choose_target then hits chosen enemy', () => {
    const { state, data } = dualEnemyCombat(42, 'mage', 'Ysara');
    const withMana = {
      ...state,
      party: [{ ...state.party[0]!, mana: 10 }],
    };
    const afterAim = executeSpellTurn(withMana, 'ember_spark', data);
    expect(afterAim.combat?.phase).toBe('choose_target');
    expect(afterAim.combat?.pendingSpellId).toBe('ember_spark');
    expect(afterAim.combat?.enemies[0]?.hp).toBe(20);
    expect(afterAim.combat?.enemies[1]?.hp).toBe(20);

    const afterCast = playerSpellOnEnemy(afterAim, 1, data);
    const dmgB = afterCast.combat?.log.find(
      (e) => e.kind === 'damage' && e.spellId === 'ember_spark' && e.target === 'Alvo B'
    );
    expect(dmgB).toBeDefined();
    expect(afterCast.combat?.enemies[1]?.hp).toBeLessThan(20);
    expect(afterCast.combat?.enemies[0]?.hp).toBe(20);
    expect(afterCast.party[0]?.mana).toBe(7);
  });

  it('cleric heal targets a wounded companion', () => {
    const companion = createPlayerCharacter('Mira', 'mage');
    const wounded = { ...companion, hp: 3, maxHp: 12 };
    const { state, data } = dualEnemyCombat(77, 'cleric', 'Oris', [wounded]);
    const withMana = {
      ...state,
      party: [state.party[0]!, wounded],
      knownSpells: [...state.knownSpells],
    };
    withMana.party[0] = { ...withMana.party[0]!, mana: 10 };

    const afterAim = executeSpellTurn(withMana, 'lesser_heal', data);
    expect(afterAim.combat?.phase).toBe('choose_target');
    expect(afterAim.combat?.pendingSpellId).toBe('lesser_heal');

    const afterHeal = playerSpellOnAlly(afterAim, 1, data);
    const healLog = afterHeal.combat?.log.find(
      (e) => e.kind === 'heal' && e.spellId === 'lesser_heal' && e.target === 'Mira'
    );
    expect(healLog).toBeDefined();
    expect(healLog!.final).toBeGreaterThan(0);
    expect(afterHeal.party[0]?.mana).toBe(6);
  });

  it('cleric solo can heal self via ally targeting', () => {
    const { state, data } = dualEnemyCombat(88, 'cleric', 'Oris');
    const hurtLead = { ...state.party[0]!, hp: 4, maxHp: 14, mana: 10 };
    const withHurt = { ...state, party: [hurtLead] };

    const afterAim = executeSpellTurn(withHurt, 'lesser_heal', data);
    expect(afterAim.combat?.phase).toBe('choose_target');

    const afterHeal = playerSpellOnAlly(afterAim, 0, data);
    const healLog = afterHeal.combat?.log.find(
      (e) => e.kind === 'heal' && e.spellId === 'lesser_heal' && e.target === 'Oris'
    );
    expect(healLog).toBeDefined();
    expect(healLog!.final).toBeGreaterThan(0);
    expect(afterHeal.party[0]?.mana).toBe(6);
  });

  it('silver bolt hits all living enemies without targeting', () => {
    const { state, data } = dualEnemyCombat(55, 'mage', 'Ysara');
    const withSilver = {
      ...state,
      level: 8,
      knownSpells: [...state.knownSpells, 'silver_bolt'],
      party: [{ ...state.party[0]!, mana: 20 }],
    };
    const after = executeSpellTurn(withSilver, 'silver_bolt', data);
    expect(after.combat?.phase).not.toBe('choose_target');
    const hits = after.combat?.log.filter(
      (e) => e.kind === 'damage' && e.spellId === 'silver_bolt'
    );
    expect(hits?.length).toBe(2);
    expect(after.combat?.enemies[0]?.hp).toBeLessThan(20);
    expect(after.combat?.enemies[1]?.hp).toBeLessThan(20);
    expect(after.party[0]?.mana).toBe(11);
  });

  it('headshot regression: choose_target then crit on playerAttack', () => {
    const { state, data } = dualEnemyCombat(42, 'archer', 'Veyr');
    const withMana = {
      ...state,
      party: [{ ...state.party[0]!, mana: 20 }],
    };
    const afterAim = executeSpellTurn(withMana, 'headshot', data);
    expect(afterAim.combat?.phase).toBe('choose_target');
    expect(afterAim.combat?.pendingSpellId).toBe('headshot');
    const afterShot = playerAttack(afterAim, 1, data, false);
    const dmg = afterShot.combat?.log.find((e) => e.kind === 'damage' && e.target === 'Alvo B');
    expect(dmg?.damageKind).toBe('crit');
    expect(afterShot.party[0]?.mana).toBe(4);
  });

  it('ember spark can apply burn and tick damage on enemy phase', () => {
    const { state, data } = dualEnemyCombat(42, 'mage', 'Ysara');
    data.spells = {
      ...data.spells,
      ember_spark: {
        ...data.spells.ember_spark!,
        applyStatus: { kind: 'burn', chance: 1, rounds: 2, intensity: 1 },
      },
    };
    const withMana = {
      ...state,
      party: [{ ...state.party[0]!, mana: 10 }],
    };
    const afterAim = executeSpellTurn(withMana, 'ember_spark', data);
    const afterCast = playerSpellOnEnemy(afterAim, 0, data);
    expect(
      afterCast.combat?.log.some(
        (e) => e.kind === 'info' && e.message.includes('queimadura')
      )
    ).toBe(true);

    const burn = afterCast.combat?.enemies[0]?.statusConditions.find((s) => s.kind === 'burn');
    expect(burn).toBeDefined();
    expect(burn!.remainingRounds).toBe(1);

    const spellDmg = afterCast.combat?.log.find(
      (e) => e.kind === 'damage' && e.spellId === 'ember_spark'
    )!.final!;
    const burnTick = afterCast.combat?.log.find(
      (e) => e.kind === 'damage' && e.message.includes('queimadura')
    );
    expect(burnTick).toBeDefined();
    expect(afterCast.combat?.enemies[0]?.hp).toBe(20 - spellDmg - burnTick!.final!);
  });
});
