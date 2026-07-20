import { beforeEach, describe, expect, it } from 'vitest';
import { getMainMission, getMainMissionView } from '../../src/campaigns/calvario/mainMission.ts';
import { initI18n } from '../../src/i18n/index.ts';
import { clearStoredLocale } from '../../src/i18n/store.ts';
import type { GameState } from '../../src/engine/schema/index.ts';
import { createStateWithHero } from '../helpers/engineTestData.ts';

function stateWith(partial: Partial<GameState>): GameState {
  return { ...createStateWithHero(), ...partial };
}

describe('getMainMission (calvario) — título estável por ato', () => {
  beforeEach(() => {
    clearStoredLocale();
    initI18n('pt-BR');
  });

  it('ato 1: Descer na masmorra', () => {
    const state = stateWith({ chapter: 1, sceneId: 'act1/title', party: [] });
    expect(getMainMission(state)).toBe('Descer na masmorra');
  });

  it('ato 2: título estável mesmo com meta incompleta', () => {
    const state = stateWith({
      chapter: 2,
      sceneId: 'act2/hub_catacomb',
      visitedScenes: { 'act2/hub_catacomb': true },
    });
    expect(getMainMission(state)).toBe('Avançar pelo cruzeiro');
  });

  it('ato 2: título não muda ao subir de nível / completar mapa', () => {
    const state = stateWith({
      chapter: 2,
      sceneId: 'act2/hub_catacomb',
      level: 6,
      visitedScenes: { 'act2/hub_catacomb': true },
      flags: { act2_explore_goal_reached: true },
    });
    expect(getMainMission(state)).toBe('Avançar pelo cruzeiro');
  });

  it('ato 3: Abrir caminho ao Trono', () => {
    const state = stateWith({
      chapter: 3,
      sceneId: 'act3/hub_depths',
      visitedScenes: { 'act3/hub_depths': true },
    });
    expect(getMainMission(state)).toBe('Abrir caminho ao Trono');
  });

  it('ato 4: Enfrentar Morvayn', () => {
    const state = stateWith({
      chapter: 4,
      sceneId: 'act4/throne/throne_gate',
    });
    expect(getMainMission(state)).toBe('Enfrentar Morvayn');
  });

  it('ato 5: Dominar as Cimeiras', () => {
    const state = stateWith({
      chapter: 5,
      sceneId: 'act5/frost_hub',
      visitedScenes: { 'act5/frost_hub': true },
    });
    expect(getMainMission(state)).toBe('Dominar as Cimeiras');
  });
});

describe('getMainMissionView — submissões tickáveis', () => {
  beforeEach(() => {
    clearStoredLocale();
    initI18n('pt-BR');
  });

  it('no hub act2 lista submissões pendentes', () => {
    const state = stateWith({
      chapter: 2,
      sceneId: 'act2/hub_catacomb',
      visitedScenes: { 'act2/hub_catacomb': true },
    });
    const view = getMainMissionView(state);
    expect(view.title).toBe('Avançar pelo cruzeiro');
    expect(view.steps.some((s) => s.status === 'pending')).toBe(true);
    const byId = Object.fromEntries(view.steps.map((s) => [s.id, s]));
    expect(byId.reachHub?.status).toBe('done');
    expect(byId.exploreMap?.status).toBe('pending');
    expect(byId.recruitMira?.status).toBe('pending');
    expect(byId.clearRats?.status).toBe('pending');
  });

  it('marca Mira e mapa como done quando flags existem', () => {
    const state = stateWith({
      chapter: 2,
      sceneId: 'act2/hub_catacomb',
      level: 5,
      visitedScenes: { 'act2/hub_catacomb': true },
      flags: { mira_recruited: true, act2_explore_goal_reached: true, rats_cleared: true },
    });
    const view = getMainMissionView(state);
    const byId = Object.fromEntries(view.steps.map((s) => [s.id, s]));
    expect(byId.recruitMira?.status).toBe('done');
    expect(byId.exploreMap?.status).toBe('done');
    expect(byId.clearRats?.status).toBe('done');
    expect(byId.reachLevel6?.status).toBe('pending');
    expect(byId.reachLevel6?.hint).toBe('No hub: patrulhar até nível 6 (atual: 5)');
  });

  it('act3 reachLevel11 mostra dica de patrulha no hub', () => {
    const state = stateWith({
      chapter: 3,
      sceneId: 'act3/hub_depths',
      level: 9,
      visitedScenes: { 'act3/hub_depths': true },
      flags: { stone_guard_defeated: true, act3_explore_goal_reached: true },
    });
    const step = getMainMissionView(state).steps.find((s) => s.id === 'reachLevel11');
    expect(step?.status).toBe('pending');
    expect(step?.hint).toBe('No hub: patrulhar até nível 11 (atual: 9)');
  });

  it('Tomás resgatado / falhado no ato 5', () => {
    const rescued = stateWith({
      chapter: 5,
      sceneId: 'act5/frost_hub',
      level: 16,
      visitedScenes: { 'act5/frost_hub': true },
      flags: { tomas_rescued: true },
    });
    expect(getMainMissionView(rescued).steps.find((s) => s.id === 'rescueTomas')?.status).toBe(
      'done'
    );

    const missed = stateWith({
      chapter: 5,
      sceneId: 'act5/frost_hub',
      level: 16,
      visitedScenes: { 'act5/frost_hub': true },
      flags: { tomas_rescue_missed: true },
    });
    expect(getMainMissionView(missed).steps.find((s) => s.id === 'rescueTomas')?.status).toBe(
      'failed'
    );
  });

  it('Kael aparece após visita à sala e marca done com kr_won', () => {
    const pending = stateWith({
      chapter: 2,
      sceneId: 'act2/hub_catacomb',
      visitedScenes: { 'act2/hub_catacomb': true, 'act2/skeleton_room': true },
    });
    expect(getMainMissionView(pending).steps.find((s) => s.id === 'meetKael')?.status).toBe(
      'pending'
    );

    const won = stateWith({
      chapter: 2,
      sceneId: 'act2/hub_catacomb',
      visitedScenes: { 'act2/hub_catacomb': true, 'act2/skeleton_room': true },
      flags: { kr_won_act2: true },
    });
    expect(getMainMissionView(won).steps.find((s) => s.id === 'meetKael')?.status).toBe('done');
  });

  it('pending vêm antes de done na lista', () => {
    const state = stateWith({
      chapter: 2,
      sceneId: 'act2/hub_catacomb',
      visitedScenes: { 'act2/hub_catacomb': true },
      flags: { rats_cleared: true },
    });
    const statuses = getMainMissionView(state).steps.map((s) => s.status);
    const lastPending = statuses.lastIndexOf('pending');
    const firstDone = statuses.indexOf('done');
    if (lastPending >= 0 && firstDone >= 0) {
      expect(lastPending).toBeLessThan(firstDone);
    }
  });
});
