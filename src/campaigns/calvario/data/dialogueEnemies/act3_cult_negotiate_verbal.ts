import type { DialogueEnemyDef } from '../../../../engine/schema/index.ts';
import * as Spr from '../../ascii/sprites/enemies/index.ts';

/** Barganha com o encarregado antes do ferro (act3/lore/cult_negotiate). */
export const act3_cult_negotiate_verbal: DialogueEnemyDef = {
  id: 'act3_cult_negotiate_verbal',
  name: 'Encarregado do Terceiro Sino',
  sprite: Spr.act2_cultist.sprite,
  tensionMax: 15,
  graph: {
    rootNodeId: 'root',
    nodes: {
      root: {
        line:
          'O cultista inclina a moeda. “Contrato simples”, repete, voz seca. “Você falas baixo; nós escrevemos baixo. Se sua boca tremer, o cano lembra.” A tensão sobe do chão como humidade.',
        choices: [
          {
            text:
              'Enumerar cláusulas sem teatro — preço, silêncio, prazo, como quem fecha conta num balcão.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 8,
              successNodeId: 'measured',
              failNodeId: 'slip',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { enemyHpDelta: 3 },
          },
          {
            text:
              'Calar e deixar o olhar dizer “não vim armado de discurso” — só de medida.',
            resolution: { kind: 'fixed', nextNodeId: 'quiet_line' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Cortar com arrogância: exigir que o Sino prove que não é descartável.',
            resolution: { kind: 'fixed', nextNodeId: 'sharp' },
            effects: { enemyHpDelta: 4 },
          },
        ],
      },
      measured: {
        line:
          '“Assim”, murmura ele. “Sem poesia. O cano gosta de gente que sabe contar até ao fim sem desviar o olhar.”',
        choices: [
          {
            text:
              'Fechar o tom: aceitar o contrato verbal aqui, sem aditivos — e deixar o gesto fechar a frase.',
            resolution: { kind: 'fixed', nextNodeId: 'contract_sealed' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Pedir uma linha de retirada honrosa — uma última frase que não suje.',
            resolution: {
              kind: 'luck',
              tn: 8,
              luckPenalty: 0,
              successNodeId: 'v_success',
              failNodeId: 'slip',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { enemyHpDelta: 2 },
          },
        ],
      },
      contract_sealed: {
        line:
          'Ele inclina a cabeça um milímetro — não bênção, fecho de livro. “Assinado no ar”, diz. “O túnel lembra.”',
        choices: [
          {
            text: 'Recuar meio passo e deixar o silêncio ser o carimbo.',
            resolution: { kind: 'fixed', nextNodeId: 'v_success' },
            effects: { enemyHpDelta: -4 },
          },
        ],
      },
      quiet_line: {
        line:
          'O silêncio pesa dos dois lados. “Bom”, diz por fim. “Silêncio também assina.”',
        choices: [
          {
            text: 'Assentir com o queixo — sem palavra que possa virar faca.',
            resolution: { kind: 'fixed', nextNodeId: 'v_success' },
            effects: { enemyHpDelta: -4 },
          },
        ],
      },
      sharp: {
        line:
          '“Prova?” ri seco. “O cano não é tribunal. É dente.” Os dois atrás aproximam um passo.',
        choices: [
          {
            text:
              'Refazer o tom: descer o volume e pedir pragmática, não coroa.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 9,
              successNodeId: 'measured',
              failNodeId: 'd_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -2 },
            effectsOnFailure: { enemyHpDelta: 2 },
          },
          {
            text: 'Manter o desafio aberto — ver quem pisca primeiro.',
            resolution: { kind: 'fixed', nextNodeId: 'd_fail' },
          },
        ],
      },
      slip: {
        line:
          'As palavras escorregam. “Ouvi medo a fingir prudência”, diz o encarregado. “O Sino mastiga isso.”',
        choices: [
          {
            text:
              'Agarrar à sobrevivência crua — ferro, sangue, sem metáfora.',
            resolution: {
              kind: 'skill',
              attr: 'str',
              tn: 9,
              successNodeId: 'v_success',
              failNodeId: 'd_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -5 },
            effectsOnFailure: { enemyHpDelta: 2 },
          },
          {
            text: 'Recuar em titubeio — perder a linha.',
            resolution: { kind: 'fixed', nextNodeId: 'd_fail' },
          },
        ],
      },
      v_success: {
        line:
          '“Fechado”, diz ele, e recua meio passo. “Desce. E lembra: fora do túnel, seu nome não ecoa.”',
        terminal: 'victory',
      },
      d_fail: {
        line:
          '“Chega de preâmbulo”, sibila. “Se não aguentas sílaba, aguenta ferro.”',
        terminal: 'defeat',
      },
    },
  },
};
