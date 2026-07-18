import { describe, expect, it } from 'vitest';
import {
  advanceToEnemyTurn,
  beginEncounter,
  chooseEnemyAction,
  expireStatusesAtEnemyPhaseStart,
  maybeApplyStatus,
  pickEnemyMeleeTarget,
  reducePartyStressAfterCombat,
  resolveEnemyAbility,
  rollParalysisSkip,
  statusAttackPenalty,
  statusDefensePenalty,
  tickPoisonAtRoundStart,
} from '../../src/engine/combat/index.ts';
import { createInitialState, createPlayerCharacter } from '../../src/engine/core/index.ts';
import type {
  Character,
  EnemyAbility,
  EnemyDef,
  EnemyInstance,
  Encounter,
} from '../../src/engine/schema/index.ts';
import { createTestData, testCampaign } from '../helpers/engineTestData.ts';

const stressWave: EnemyAbility = {
  id: 'wave',
  name: 'Onda de Pavor',
  kind: 'stress_wave',
  dice: 1,
  base: 0,
};

const venomBite: EnemyAbility = {
  id: 'venom',
  name: 'Mordida Venenosa',
  kind: 'area_strike',
  dice: 1,
  base: 0,
  applyStatus: { kind: 'poison', chance: 1, rounds: 2, intensity: 2 },
};

const powerUp: EnemyAbility = {
  id: 'power',
  name: 'Poder Sombrio',
  kind: 'self_buff',
  dice: 1,
  base: 5,
};

function makeEnemy(patch: Partial<EnemyDef>): EnemyDef {
  return {
    id: 'e',
    name: 'Inimigo',
    hp: 20,
    maxHp: 20,
    str: 8,
    agi: 6,
    mind: 8,
    armor: 0,
    type: 'normal',
    armorChips: 0,
    sprite: 'x',
    attackStrategy: 'random',
    ...patch,
  };
}

function makeInstance(def: EnemyDef, hp?: number): EnemyInstance {
  return {
    defId: def.id,
    hp: hp ?? def.hp,
    maxHp: def.maxHp,
    armorChipsRemaining: 0,
    stress: 0,
    statusConditions: [],
  };
}

describe('chooseEnemyAction', () => {
  const def = makeEnemy({
    abilities: [stressWave, powerUp],
    behavior: {
      opening: 'power',
      rotation: ['attack', 'wave'],
      desperation: { hpFractionLte: 0.25, rotation: ['wave'] },
    },
  });

  it('sem behavior cai no ataque legado', () => {
    const legacy = makeEnemy({});
    expect(chooseEnemyAction(legacy, makeInstance(legacy), 1)).toEqual({ type: 'attack' });
  });

  it('usa opening na rodada 1 e rotação cíclica depois', () => {
    const inst = makeInstance(def);
    const r1 = chooseEnemyAction(def, inst, 1);
    expect(r1.type).toBe('ability');
    if (r1.type === 'ability') expect(r1.ability.id).toBe('power');
    expect(chooseEnemyAction(def, inst, 2)).toEqual({ type: 'attack' });
    const r3 = chooseEnemyAction(def, inst, 3);
    if (r3.type === 'ability') expect(r3.ability.id).toBe('wave');
    else expect.fail('esperava ability na rodada 3');
    expect(chooseEnemyAction(def, inst, 4)).toEqual({ type: 'attack' });
  });

  it('troca para rotação de desespero com HP baixo', () => {
    const inst = makeInstance(def, 5);
    const r2 = chooseEnemyAction(def, inst, 2);
    expect(r2.type).toBe('ability');
    if (r2.type === 'ability') expect(r2.ability.id).toBe('wave');
  });

  it('token desconhecido cai em ataque comum', () => {
    const broken = makeEnemy({ behavior: { rotation: ['nao_existe'] } });
    expect(chooseEnemyAction(broken, makeInstance(broken), 1)).toEqual({ type: 'attack' });
  });
});

describe('pickEnemyMeleeTarget estratégias novas', () => {
  const rng = () => 0.99;
  function party(): Character[] {
    const lead = createPlayerCharacter('Lead', 'knight');
    const weak = { ...createPlayerCharacter('Weak', 'knight'), id: 'weak', hp: 3 };
    const tense = { ...createPlayerCharacter('Tense', 'knight'), id: 'tense', stress: 3 };
    return [lead, weak, tense];
  }

  it('focus_low_hp mira o membro com menos HP', () => {
    const def = makeEnemy({ attackStrategy: 'focus_low_hp' });
    expect(pickEnemyMeleeTarget(party(), def, rng)).toBe(1);
  });

  it('focus_stressed mira o membro com mais stress', () => {
    const def = makeEnemy({ attackStrategy: 'focus_stressed' });
    expect(pickEnemyMeleeTarget(party(), def, rng)).toBe(2);
  });
});

describe('status conditions', () => {
  it('maybeApplyStatus renova sem acumular (máx duração/intensidade)', () => {
    let ch = createPlayerCharacter('H', 'knight');
    ch = { ...ch, statusConditions: [{ kind: 'poison', remainingRounds: 1, intensity: 1 }] };
    const res = maybeApplyStatus(
      ch,
      { kind: 'poison', chance: 1, rounds: 3, intensity: 2 },
      () => 0
    );
    expect(res.applied).toBe(true);
    expect(res.ch.statusConditions).toHaveLength(1);
    expect(res.ch.statusConditions[0]).toEqual({
      kind: 'poison',
      remainingRounds: 3,
      intensity: 2,
    });
  });

  it('veneno nunca reduz abaixo de 1 HP', () => {
    const ch = {
      ...createPlayerCharacter('H', 'knight'),
      hp: 2,
      statusConditions: [{ kind: 'poison' as const, remainingRounds: 2, intensity: 5 }],
    };
    const out = tickPoisonAtRoundStart([ch], []);
    expect(out.party[0]!.hp).toBe(1);
    expect(out.log.some((e) => e.kind === 'damage')).toBe(true);
  });

  it('expiração decrementa e remove com log', () => {
    const ch = {
      ...createPlayerCharacter('H', 'knight'),
      statusConditions: [
        { kind: 'freeze' as const, remainingRounds: 1, intensity: 0 },
        { kind: 'poison' as const, remainingRounds: 2, intensity: 1 },
      ],
    };
    const out = expireStatusesAtEnemyPhaseStart([ch], []);
    expect(out.party[0]!.statusConditions).toEqual([
      { kind: 'poison', remainingRounds: 1, intensity: 1 },
    ]);
    expect(out.log).toHaveLength(1);
  });

  it('paralisia pode perder a ação; congelamento penaliza ataque e defesa', () => {
    const paralyzed = {
      ...createPlayerCharacter('H', 'knight'),
      statusConditions: [{ kind: 'paralysis' as const, remainingRounds: 1, intensity: 0 }],
    };
    expect(rollParalysisSkip(paralyzed, () => 0)).toBe(true);
    expect(rollParalysisSkip(paralyzed, () => 0.9)).toBe(false);

    const frozen = {
      ...createPlayerCharacter('H', 'knight'),
      statusConditions: [{ kind: 'freeze' as const, remainingRounds: 1, intensity: 0 }],
    };
    expect(statusAttackPenalty(frozen)).toBe(2);
    expect(statusDefensePenalty(frozen)).toBe(2);
    expect(statusAttackPenalty(paralyzed)).toBe(0);
  });

  it('condições são limpas ao terminar o combate', () => {
    let s = createInitialState(testCampaign, 1);
    s = {
      ...s,
      party: [
        {
          ...createPlayerCharacter('H', 'knight'),
          statusConditions: [{ kind: 'freeze', remainingRounds: 2, intensity: 0 }],
        },
      ],
    };
    const after = reducePartyStressAfterCombat(s);
    expect(after.party[0]!.statusConditions).toEqual([]);
  });
});

describe('fase inimiga com habilidades', () => {
  function setupCombat(def: EnemyDef) {
    const data = createTestData();
    data.enemies = { [def.id]: def };
    const enc: Encounter = { combatType: 'battle', id: 'enc', enemies: [def.id] };
    data.encounters = { enc };
    let state = createInitialState(testCampaign, 7);
    state = { ...state, party: [createPlayerCharacter('H', 'knight')] };
    state = beginEncounter(state, enc, data, { returnScene: 'hub' });
    return { state, data };
  }

  it('stress_wave aumenta o stress do grupo', () => {
    const def = makeEnemy({ abilities: [stressWave], behavior: { rotation: ['wave'] } });
    const { state, data } = setupCombat(def);
    const after = advanceToEnemyTurn(state, { ...state.combat!, phase: 'enemy' }, data);
    expect(after.party[0]!.stress).toBe(1);
    expect(after.combat!.log.some((e) => e.message.includes('Onda de Pavor'))).toBe(true);
  });

  it('area_strike com veneno aplica status e o veneno pinga na rodada seguinte', () => {
    const def = makeEnemy({ abilities: [venomBite], behavior: { rotation: ['venom'] } });
    const { state, data } = setupCombat(def);
    const hpBefore = state.party[0]!.hp;
    const after = advanceToEnemyTurn(state, { ...state.combat!, phase: 'enemy' }, data);
    const lead = after.party[0]!;
    expect(lead.statusConditions.some((s) => s.kind === 'poison')).toBe(true);
    // dano da área + tick de veneno (intensity 2) no início da rodada do jogador
    expect(lead.hp).toBeLessThan(hpBefore);
    expect(after.combat!.log.some((e) => e.message.includes('veneno'))).toBe(true);
  });

  it('self_buff acumula com teto no ataque inimigo', () => {
    const def = makeEnemy({ abilities: [powerUp], behavior: { rotation: ['power'] } });
    const { state, data } = setupCombat(def);
    const c = state.combat!;
    const first = resolveEnemyAbility({
      state,
      c,
      data,
      def,
      ability: powerUp,
      enemyIndex: 0,
      party: state.party,
      enemyBuffAttackRoll: 0,
      rng: () => 0.5,
      log: [],
    });
    expect(first.enemyBuffAttackRollDelta).toBe(3);
    const second = resolveEnemyAbility({
      state,
      c,
      data,
      def,
      ability: powerUp,
      enemyIndex: 0,
      party: state.party,
      enemyBuffAttackRoll: 3,
      rng: () => 0.5,
      log: [],
    });
    expect(second.enemyBuffAttackRollDelta).toBe(0);
  });
});
