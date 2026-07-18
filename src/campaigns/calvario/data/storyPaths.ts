import type { StoryPathDef } from '../../../engine/data/index.ts';

/**
 * Paths narrativos (`state.storyPaths`): decisões grandes com ramos estáveis.
 * Distinto de `party[].path` (arquétipo de classe via `setPath`).
 */
export const storyPaths: Record<string, StoryPathDef> = {
  throne: {
    name: 'Trono de Morvayn',
    description: 'O que fizeste no trono define o tom do gelo — e do que desce depois.',
    values: {
      slain: {
        name: 'Ferro no trono',
        description:
          'Morvayn caiu sob aço. O eixo segue aberto; a vitória é magra e o frio não absolve.',
      },
      pact: {
        name: 'Pacto do Sino',
        description:
          'O Terceiro Sino escreveu-se na pele. A corrupção é o juro; o mundo aprende a calar quando respiras.',
      },
      sealed: {
        name: 'Selo do Calvário',
        description:
          'Selaste o buraco em fé. O subsolo cala porque carregaste o peso — cicatrizes na alma, paz frágil nas pedras.',
      },
    },
  },
};
