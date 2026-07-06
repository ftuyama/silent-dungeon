import { describe, expect, it } from 'vitest';
import {
  beginEncounter,
  executeSpellTurn,
  executePlayerTurn,
  playerAttack,
  playerSpellOnEnemy,
} from '../../src/engine/combat/index.ts';
import { createInitialState, createPlayerCharacter } from '../../src/engine/core/index.ts';
import {
  initialKnownSpellIds,
  unlockSpellsForNewLevel,
} from '../../src/engine/progression/index.ts';
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

function archerCombatState(seed: number, level = 1) {
  const data = createTestData();
  data.spells = { ...calvarioSpells };
  data.enemies = { dummy_a: dummyA, dummy_b: dummyB };
  const enc: Encounter = { combatType: 'battle', id: 'x', enemies: ['dummy_a', 'dummy_b'] };
  let state = createInitialState(testCampaign, seed);
  const archer = createPlayerCharacter('Veyr', 'archer');
  state = {
    ...state,
    party: [archer],
    level,
    knownSpells: initialKnownSpellIds(archer, data),
  };
  if (level >= 3) {
    const unlocked = unlockSpellsForNewLevel(state, 3, data);
    state = unlocked.state;
  }
  state = beginEncounter(state, enc, data, { returnScene: 'hub' });
  return { state, data };
}

describe('archer class', () => {
  it('creates archer with bow, robe and quiver', () => {
    const archer = createPlayerCharacter('Veyr', 'archer');
    expect(archer.agi).toBe(13);
    expect(archer.hp).toBe(10);
    expect(archer.weaponId).toBe('short_bow');
    expect(archer.armorId).toBe('hunter_robe');
    expect(archer.relicId).toBe('leather_quiver');
  });

  it('unlocks arrow_rain at level 3 only', () => {
    const data = createTestData();
    data.spells = { ...calvarioSpells };
    const archer = createPlayerCharacter('Veyr', 'archer');
    const level1 = initialKnownSpellIds(archer, data);
    expect(level1).toContain('headshot');
    expect(level1).not.toContain('arrow_rain');
    let state = createInitialState(testCampaign, 1);
    state = { ...state, party: [archer], level: 3, knownSpells: level1 };
    const unlocked = unlockSpellsForNewLevel(state, 3, data);
    expect(unlocked.learned).toContain('arrow_rain');
  });

  it('silent_arrow is learnOnly and deals damage when known', () => {
    const data = createTestData();
    data.spells = { ...calvarioSpells };
    const archer = createPlayerCharacter('Veyr', 'archer');
    const level1 = initialKnownSpellIds(archer, data);
    expect(level1).not.toContain('silent_arrow');

    const { state, data: combatData } = archerCombatState(77, 1);
    const withSpell = {
      ...state,
      knownSpells: [...state.knownSpells, 'silent_arrow'],
      party: [{ ...state.party[0]!, mana: 16 }],
    };
    const afterAim = executeSpellTurn(withSpell, 'silent_arrow', combatData);
    expect(afterAim.combat?.phase).toBe('choose_target');
    const after = playerSpellOnEnemy(afterAim, 0, combatData);
    const hit = after.combat?.log.find((e) => e.kind === 'damage' && e.spellId === 'silent_arrow');
    expect(hit).toBeDefined();
    expect(after.party[0]?.mana).toBe(6);
  });

  it('headshot enters choose_target then crits on playerAttack', () => {
    const { state, data } = archerCombatState(42, 1);
    const afterAim = executeSpellTurn(state, 'headshot', data);
    expect(afterAim.combat?.phase).toBe('choose_target');
    expect(afterAim.combat?.pendingSpellId).toBe('headshot');
    const afterShot = playerAttack(afterAim, 1, data, false);
    const dmg = afterShot.combat?.log.find((e) => e.kind === 'damage' && e.target === 'Alvo B');
    expect(dmg?.damageKind).toBe('crit');
    expect(dmg?.spellId).toBe('headshot');
    expect(afterShot.party[0]?.mana).toBe(0);
  });

  it('arrow rain damages all living enemies', () => {
    const { state, data } = archerCombatState(99, 3);
    const after = executeSpellTurn(state, 'arrow_rain', data);
    const hits = after.combat?.log.filter((e) => e.kind === 'damage' && e.spellId === 'arrow_rain');
    expect(hits?.length).toBe(2);
    expect(after.party[0]?.mana).toBe(16 - 9);
  });

  it('dodge passive inactive without morvayn shard', () => {
    const { state, data } = archerCombatState(100, 1);
    const afterStance = executePlayerTurn(state, 'aggressive', data, false, false);
    const enemyPhase = afterStance.combat?.phase;
    expect(enemyPhase === 'enemy' || enemyPhase === 'ended' || enemyPhase === 'choose_stance').toBe(
      true
    );
    const dodgeLog = afterStance.combat?.log.some((e) =>
      e.message.includes('esquiva') || e.message.includes('dodges')
    );
    expect(dodgeLog).toBeFalsy();
  });

  it('dodge can trigger with morvayn shard on some seeds', () => {
    let sawDodge = false;
    for (let seed = 0; seed < 400; seed++) {
      let { state, data } = archerCombatState(seed, 1);
      state = { ...state, inventory: ['morvayn_heart_shard'] };
      state = executePlayerTurn(state, 'aggressive', data, false, false);
      const dodged = state.combat?.log.some(
        (e) =>
          e.kind === 'attack' &&
          e.outcome === 'miss' &&
          (e.message.includes('esquiva') || e.message.includes('dodges'))
      );
      if (dodged) {
        sawDodge = true;
        break;
      }
    }
    expect(sawDodge).toBe(true);
  });
});
