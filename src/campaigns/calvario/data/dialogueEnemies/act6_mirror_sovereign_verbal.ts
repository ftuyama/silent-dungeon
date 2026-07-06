import type { DialogueEnemyDef } from '../../../../engine/schema/index.ts';
import * as Spr from '../../ascii/sprites/enemies/index.ts';

/** Reflexo soberano antes do ferro (act6/encounters/mirror_boss_intro). */
export const act6_mirror_sovereign_verbal: DialogueEnemyDef = {
  id: 'act6_mirror_sovereign_verbal',
  name: 'O reflexo soberano',
  sprite: Spr.act6_shadow_self.sprite,
  tensionMax: 22,
  graph: {
    rootNodeId: 'root',
    nodes: {
      root: {
        line:
          'Do espelho sai seu rosto sem hesitação. “Eu sou você sem medo”, diz. “Você é eu sem coragem.” O sorriso dele não pede licença — pede rendição.',
        choices: [
          {
            text:
              'Nomear o medo sem poesia — o hábito feio, não o herói de palco.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 10,
              successNodeId: 'named',
              failNodeId: 'waver',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: {
              enemyHpDelta: 3,
              playerHpLossPercent: 6,
            },
          },
          {
            text:
              'Recusar o duelo de palavras: avançar devagar, sem discurso, só presença.',
            resolution: { kind: 'fixed', nextNodeId: 'silent_advance' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Atacar a imagem com fúria — provar que ainda mandas nseu rosto.',
            resolution: { kind: 'fixed', nextNodeId: 'waver' },
            effects: { enemyHpDelta: 4 },
          },
        ],
      },
      silent_advance: {
        line:
          '“Corpo sem frase”, murmura ele, irritado. “Isso também é linguagem — só que eu sei lê-la.”',
        choices: [
          {
            text:
              'Manter o passo até o sorriso dele falhar — ombro baixo, olhar que não pede aplauso.',
            resolution: {
              kind: 'skill',
              attr: 'str',
              tn: 10,
              successNodeId: 'named',
              failNodeId: 'strain',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { enemyHpDelta: 2, playerHpLossPercent: 5 },
          },
          {
            text:
              'Dar ao reflexo uma frase mínima — verdade pequena, sem lenda — para o vidro engasgar.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 10,
              successNodeId: 'named',
              failNodeId: 'strain',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { enemyHpDelta: 2, playerHpLossPercent: 5 },
          },
          {
            text:
              'Confiar no ritmo: deixar o acaso decidir se o silêncio te protege ou se o corredor te expõe.',
            resolution: {
              kind: 'luck',
              tn: 10,
              luckPenalty: 1,
              successNodeId: 'named',
              failNodeId: 'waver',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { enemyHpDelta: 3, playerHpLossPercent: 5 },
          },
        ],
      },
      named: {
        line:
          'O reflexo pisca — uma fração humana. “…Nomear”, repete, como quem odeia perder o argumento. “Isso não é vitória. É freio.”',
        choices: [
          {
            text:
              'Traçar fronteira: sombra fica no vidro; você ficas no corredor.',
            resolution: { kind: 'fixed', nextNodeId: 'last_test' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Calar e deixar o silêncio fechar o acordo — sem segunda peça para ele roubar.',
            resolution: {
              kind: 'luck',
              tn: 10,
              luckPenalty: 0,
              successNodeId: 'last_test',
              failNodeId: 'waver',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { enemyHpDelta: 3 },
          },
          {
            text:
              'Exigir prova física: tocar o batente com a palma e ver qual mundo responde primeiro.',
            resolution: {
              kind: 'skill',
              attr: 'str',
              tn: 11,
              successNodeId: 'last_test',
              failNodeId: 'strain',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { enemyHpDelta: 2, playerHpLossPercent: 6 },
          },
        ],
      },
      last_test: {
        line:
          'A fronteira está traçada; o vidro ainda tenta colonizar-te com um último sorriso. “Mostra”, sussurra o reflexo, “como fechas sem me dar o epílogo.”',
        choices: [
          {
            text:
              'Aceitar a trégua feia — levar o que ainda é seu, sem discurso final.',
            resolution: { kind: 'fixed', nextNodeId: 'v_success' },
            effects: { enemyHpDelta: -5 },
          },
          {
            text:
              'Responder com mente fria: uma cláusula, um preço, nada de mito.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 11,
              successNodeId: 'v_success',
              failNodeId: 'strain',
            },
            effectsOnSuccess: { enemyHpDelta: -5 },
            effectsOnFailure: { enemyHpDelta: 2, playerHpLossPercent: 7 },
          },
          {
            text:
              'Partir o instante com agilidade — um passo que quebra a sincronia antes que ele copie.',
            resolution: {
              kind: 'skill',
              attr: 'agi',
              tn: 10,
              successNodeId: 'v_success',
              failNodeId: 'd_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { enemyHpDelta: 3 },
          },
        ],
      },
      strain: {
        line:
          'O reflexo lê cada tensão nseu pescoço como promessa de queda. “Vês?” murmura. “O corpo já assinou antes da boca.”',
        choices: [
          {
            text:
              'Dizer seu nome em voz alta — âncora feia, sem pose de palco.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 11,
              successNodeId: 'v_success',
              failNodeId: 'd_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -6 },
            effectsOnFailure: { enemyHpDelta: 2, playerHpLossPercent: 8 },
          },
          {
            text:
              'Recuar o queixo, abrir as mãos visíveis — geografia de rendição mínima, não de teatro.',
            resolution: {
              kind: 'skill',
              attr: 'agi',
              tn: 10,
              successNodeId: 'v_success',
              failNodeId: 'd_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -5 },
            effectsOnFailure: { enemyHpDelta: 2 },
          },
        ],
      },
      waver: {
        line:
          '“Vês?” sussurra o reflexo. “Já vacilaste antes da lâmina.”',
        choices: [
          {
            text:
              'Agarrar à última linha: dizer seu nome em voz alta como âncora.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 11,
              successNodeId: 'last_test',
              failNodeId: 'd_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { enemyHpDelta: 2, playerHpLossPercent: 7 },
          },
          {
            text: 'Deixar a dúvida ganhar terreno.',
            resolution: { kind: 'fixed', nextNodeId: 'd_fail' },
          },
        ],
      },
      v_success: {
        line:
          'O reflexo recua meio tom — não derrota limpa, trégua. “Vai”, diz com sua boca. “Leva o que ainda é seu.”',
        terminal: 'victory',
      },
      d_fail: {
        line:
          '“Então ao ferro”, diz ele — e o espelho deixa de negociar.',
        terminal: 'defeat',
      },
    },
  },
};
