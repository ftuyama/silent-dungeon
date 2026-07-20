import { describe, expect, it } from 'vitest';
import type { CombatLogEntry, Effect } from '../../src/engine/schema/index.ts';
import {
  hpBarMarkup,
  isHpCritical,
  parseCombatLogRounds,
  parseTurnBannerMessage,
  preserveExplorationNodeForChoiceEffects,
  stressBarMarkup,
} from '../../src/ui/gameAppUtils.ts';

describe('parseTurnBannerMessage', () => {
  it('reconhece sua vez e inimigos com travessão ou hífen', () => {
    expect(parseTurnBannerMessage('Rodada 2 — sua vez (postura e ataque)')).toEqual({
      round: 2,
      phase: 'player',
    });
    expect(parseTurnBannerMessage('Rodada 1 - inimigos')).toEqual({ round: 1, phase: 'enemy' });
  });

  it('reconhece banners em inglês', () => {
    expect(parseTurnBannerMessage('Round 2 — your turn (stance and attack)')).toEqual({
      round: 2,
      phase: 'player',
    });
    expect(parseTurnBannerMessage('Round 1 - enemies')).toEqual({ round: 1, phase: 'enemy' });
  });
});

describe('parseCombatLogRounds', () => {
  it('agrupa abertura e une fases da mesma rodada', () => {
    const log: CombatLogEntry[] = [
      { kind: 'info', message: 'Goblin aparece.' },
      { kind: 'info', message: 'Ordem: A, B.' },
      { kind: 'turn_banner', message: 'Rodada 1 — sua vez (postura e ataque)' },
      { kind: 'stance', message: 'Postura agressiva.' },
      { kind: 'turn_banner', message: 'Rodada 1 — inimigos' },
      { kind: 'attack', message: 'Goblin erra.' },
      { kind: 'turn_banner', message: 'Rodada 2 — sua vez (postura e ataque)' },
      { kind: 'info', message: 'Vitória!' },
    ];
    const { preamble, rounds } = parseCombatLogRounds(log);
    expect(preamble.map((e) => e.message)).toEqual(['Goblin aparece.', 'Ordem: A, B.']);
    expect(rounds).toHaveLength(2);
    expect(rounds[0]!.round).toBe(1);
    expect(rounds[0]!.sections).toHaveLength(2);
    expect(rounds[0]!.sections[0]!.kind).toBe('player');
    expect(rounds[0]!.sections[0]!.body).toHaveLength(1);
    expect(rounds[0]!.sections[1]!.kind).toBe('enemy');
    expect(rounds[1]!.round).toBe(2);
    expect(rounds[1]!.sections[0]!.body.map((e) => e.message)).toEqual(['Vitória!']);
  });
});

describe('isHpCritical', () => {
  it('usa o limiar de 30% com PV acima de zero', () => {
    expect(isHpCritical(3, 10)).toBe(true);
    expect(isHpCritical(4, 10)).toBe(false);
    expect(isHpCritical(6, 20)).toBe(true);
    expect(isHpCritical(7, 20)).toBe(false);
    expect(isHpCritical(0, 10)).toBe(false);
    expect(isHpCritical(5, 0)).toBe(false);
  });
});

describe('hpBarMarkup', () => {
  it('aplica estado crítico com HP baixo (≤30%)', () => {
    expect(hpBarMarkup(3, 10, 'hp-bar-resource', 'hp')).toContain('hp-bar-track--critical');
    expect(hpBarMarkup(4, 10, 'hp-bar-resource', 'hp')).not.toContain('hp-bar-track--critical');
    expect(hpBarMarkup(6, 20, 'hp-bar-resource', 'hp')).toContain('hp-bar-track--critical');
    expect(hpBarMarkup(7, 20, 'hp-bar-resource', 'hp')).not.toContain('hp-bar-track--critical');
  });

  it('não aplica estado crítico com HP zerado', () => {
    expect(hpBarMarkup(0, 10, 'hp-bar-resource', 'hp')).not.toContain('hp-bar-track--critical');
  });

  it('não aplica estado crítico na barra de XP', () => {
    expect(hpBarMarkup(1, 10)).not.toContain('hp-bar-track--critical');
  });
});

describe('stressBarMarkup', () => {
  it('aplica estado crítico com stress alto (≥3)', () => {
    expect(stressBarMarkup(3)).toContain('stress-bar-track--critical');
    expect(stressBarMarkup(2)).not.toContain('stress-bar-track--critical');
  });
});

describe('preserveExplorationNodeForChoiceEffects', () => {
  it('mantém nodeId atual ao reentrar no mesmo grafo', () => {
    const effects: Effect[] = [
      { op: 'setExploration', graphId: 'act2_catacomb', nodeId: 'center_breach' },
      { op: 'setAsciiMap', mapId: 'act2_catacomb' },
    ];
    const next = preserveExplorationNodeForChoiceEffects(effects, {
      graphId: 'act2_catacomb',
      nodeId: 'cross_north',
    });
    expect(next).toEqual([
      { op: 'setExploration', graphId: 'act2_catacomb', nodeId: 'cross_north' },
      { op: 'setAsciiMap', mapId: 'act2_catacomb' },
    ]);
  });
});
