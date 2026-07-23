import { describe, expect, it } from 'vitest';
import type { LoadedScene } from '../../src/engine/core/index.ts';
import { resolveContextPrimerId } from '../../src/ui/story/sessionPrimer.ts';

function sceneStub(partial: Partial<LoadedScene['frontmatter']> & { id: string }): LoadedScene {
  return {
    id: partial.id,
    body: '',
    frontmatter: {
      id: partial.id,
      chapter: 2,
      choices: [],
      onEnter: [],
      ...partial,
    },
  } as LoadedScene;
}

const noneDismissed = { hub_loop: false, camp: false, exploration: false };

describe('resolveContextPrimerId', () => {
  it('prioriza hub do cruzeiro sobre outros sinais na mesma cena', () => {
    expect(
      resolveContextPrimerId(
        sceneStub({
          id: 'act2/hub_catacomb',
          type: 'hub',
          campCombatHint: true,
        }),
        noneDismissed
      )
    ).toBe('hub_loop');
  });

  it('detecta acampamento principal via campCombatHint', () => {
    expect(
      resolveContextPrimerId(
        sceneStub({ id: 'act2/camp/vigilia_camp', campCombatHint: true }),
        noneDismissed
      )
    ).toBe('camp');
  });

  it('detecta exploração via type exploration', () => {
    expect(
      resolveContextPrimerId(
        sceneStub({ id: 'shared/explore_nav_act2', type: 'exploration' }),
        noneDismissed
      )
    ).toBe('exploration');
  });

  it('ignora subcenas de acampamento sem campCombatHint', () => {
    expect(
      resolveContextPrimerId(sceneStub({ id: 'act2/camp/use_consumable' }), noneDismissed)
    ).toBeNull();
  });

  it('respeita dismiss por contexto', () => {
    expect(
      resolveContextPrimerId(sceneStub({ id: 'act2/camp/vigilia_camp', campCombatHint: true }), {
        hub_loop: false,
        camp: true,
        exploration: false,
      })
    ).toBeNull();
  });
});
