import type { DialogueEnemyDef } from '../../../../engine/schema/index.ts';
import * as Spr from '../../ascii/sprites/enemies/index.ts';

type KaelVerbalOpts = {
  tensionMax: number;
  rootMindTn: number;
  edgeStrTn: number;
};

const kaelGraph = (
  id: string,
  name: string,
  rootLine: string,
  opts: KaelVerbalOpts,
): DialogueEnemyDef => ({
  id,
  name,
  sprite: Spr.rival_kael.sprite,
  tensionMax: opts.tensionMax,
  graph: {
    rootNodeId: 'root',
    nodes: {
      root: {
        line: rootLine,
        choices: [
          {
            text:
              'Medir palavras como distância de lâmina — sem insulto, sem súplica.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: opts.rootMindTn,
              successNodeId: 'respect',
              failNodeId: 'edge',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { enemyHpDelta: 3 },
          },
          {
            text:
              'Baixar a voz: reconhecer o rasto, não a acusação.',
            resolution: { kind: 'fixed', nextNodeId: 'respect' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Provocar: perguntar se o cinzento só sabe contar almas em fila.',
            resolution: { kind: 'fixed', nextNodeId: 'edge' },
            effects: { enemyHpDelta: 5 },
          },
        ],
      },
      respect: {
        line:
          'Kael inclina o elmo um milímetro — quase respeito. “…Disciplina”, murmura. “Não é amizade.”',
        choices: [
          {
            text: 'Aceitar o recuo mútuo e fechar a frase sem desfile.',
            resolution: { kind: 'fixed', nextNodeId: 'v_success' },
            effects: { enemyHpDelta: -4 },
          },
        ],
      },
      edge: {
        line:
          '“Então conta com ferro”, diz Kael, voz plana. O metal acorda no ar.',
        choices: [
          {
            text:
              'Tentar segurar a linha com o corpo — sem recuar o pé.',
            resolution: {
              kind: 'skill',
              attr: 'str',
              tn: opts.edgeStrTn,
              successNodeId: 'v_success',
              failNodeId: 'd_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { enemyHpDelta: 2 },
          },
          {
            text: 'Perder o ritmo — deixar a provocação fechar o círculo.',
            resolution: { kind: 'fixed', nextNodeId: 'd_fail' },
          },
        ],
      },
      v_success: {
        line:
          '“…Contagem”, diz por fim Kael, recuando meio passo. “Não foi vitória. Foi medida. Quando o número fechar, o ferro fala.”',
        terminal: 'victory',
      },
      d_fail: {
        line:
          '“Sem tribunal”, diz Kael. “Só conta.” A lâmina termina a conversa.',
        terminal: 'defeat',
      },
    },
  },
});

export const kael_rival_act2_verbal: DialogueEnemyDef = kaelGraph(
  'kael_rival_act2_verbal',
  'Kael, o Rastreador Cinzento',
  'O elmo devolve seu próprio sopro distorcido. “Rastreado”, diz Kael. “Registrado. Ainda não rematado — quero ver se sua boca sabe o que a mão promete.”',
  { tensionMax: 12, rootMindTn: 7, edgeStrTn: 8 },
);

export const kael_rival_act4_verbal: DialogueEnemyDef = kaelGraph(
  'kael_rival_act4_verbal',
  'Kael, o Rastreador Cinzento',
  '“Já te vi uma vez no silêncio”, diz Kael. “Agora você me vê inteiro. Fale se tiver linha — senão, o ferro resume.”',
  { tensionMax: 13, rootMindTn: 8, edgeStrTn: 9 },
);

export const kael_rival_act5_verbal: DialogueEnemyDef = kaelGraph(
  'kael_rival_act5_verbal',
  'Kael, o Rastreador Cinzento',
  'A geada no elmo não esconde o olhar. “O terceiro encontro não pede nome”, diz Kael. “Pede prova. Mostre se ainda tem sílaba ou só dente.”',
  { tensionMax: 15, rootMindTn: 8, edgeStrTn: 9 },
);

export const kael_rival_act6_verbal: DialogueEnemyDef = kaelGraph(
  'kael_rival_act6_verbal',
  'Kael, o Rastreador Cinzento',
  'Entre colunas que o mapa nega, Kael parece feito de nervura e paciência. “O abismo ouve”, diz. “Escolha: eco ou ferro.”',
  { tensionMax: 16, rootMindTn: 9, edgeStrTn: 10 },
);
