import type { DialogueEnemyDef } from '../../../../engine/schema/index.ts';
import * as Spr from '../../ascii/sprites/enemies/index.ts';

export const act4_morvayn_parley: DialogueEnemyDef = {
  id: 'act4_morvayn_parley',
  name: 'Morvayn',
  sprite: Spr.act4_morvayn_p1.sprite,
  tensionMax: 19,
  graph: {
    rootNodeId: 'root',
    nodes: {
      root: {
        line:
          'Morvayn inclina o cajado como quem ouve um voto — não uma promessa bonita, o peso do sim. “O Terceiro Sino não recolhe discursos”, murmura ele. “Recolhe silêncio com forma. Mostra-me se seu sim aguenta o metal dsua língua, ou se parte à primeira nota.” A hostilidade no ar espessa-se; um passo em falso e o pacto deixa de ser conversa.',
        choices: [
          {
            text:
              'Ordenar o medo e a lógica: dizer em voz baixa o preço que aceitas pagar, sem heroísmo nem poesia — só cláusulas.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 9,
              successNodeId: 'mind_measured',
              failNodeId: 'mind_frays',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { enemyHpDelta: 3 },
          },
          {
            text:
              'Ajoelhar a palavra: jurar serviço com o corpo em frente — mãos visíveis, respiração lenta, como quem entrega uma arma ao chão sem fingir humildade de palco.',
            resolution: { kind: 'fixed', nextNodeId: 'body_pledge' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Responder com fome de poder: exigir o que o culto te deve em troca do seu nome, como se o Sino fosse mercador e não sacerdote.',
            resolution: { kind: 'fixed', nextNodeId: 'hungry_terms' },
            effects: { enemyHpDelta: 4 },
          },
        ],
      },
      mind_measured: {
        line:
          'Os cantos da boca dele mexem — não sorriso, alívio controlado. “Assim”, diz Morvayn. “Assim soa a corrente fechando sem mentira. Ainda há uma dobra onde o metal pode pinçar-te.”',
        choices: [
          {
            text:
              'Pedir a dobra em troca de uma verdade pequena que já carrega — não escândalo, um fato que te envergonha de leve e prova que ainda é carne.',
            resolution: { kind: 'fixed', nextNodeId: 'morvayn_probe' },
            effects: { enemyHpDelta: -2 },
          },
          {
            text:
              'Silenciar e deixar o olhar negociar o resto — aguentar até ele perceber que não vai pedir desculpa por existir.',
            resolution: {
              kind: 'luck',
              tn: 9,
              luckPenalty: 0,
              successNodeId: 'morvayn_probe',
              failNodeId: 'nerve_cracks',
            },
            effectsOnSuccess: { enemyHpDelta: -2 },
            effectsOnFailure: { enemyHpDelta: 4 },
          },
        ],
      },
      morvayn_probe: {
        line:
          'Morvayn atrai o cajado um dedo. “Uma dobra ainda”, murmura. “Mostra se seu sim aguenta vergonha sem virar teatro — ou se precisas de plateia para crer nele.”',
        choices: [
          {
            text:
              'Entregar a vergonha pequena sem adorno — sem confissão de palco, só fato que não cabe em lenda.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 9,
              successNodeId: 'v_success',
              failNodeId: 'nerve_cracks',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { enemyHpDelta: 2 },
          },
          {
            text:
              'Fechar a boca e deixar o corpo dizer “sim” — ombros, mãos visíveis, respiração lenta.',
            resolution: { kind: 'fixed', nextNodeId: 'v_success' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Arriscar o silêncio como moeda — ver se o acaso paga do seu lado.',
            resolution: {
              kind: 'luck',
              tn: 9,
              luckPenalty: 0,
              successNodeId: 'v_success',
              failNodeId: 'nerve_cracks',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { enemyHpDelta: 3 },
          },
        ],
      },
      mind_frays: {
        line:
          'As frases escorregam. Morvayn não precisa rir: o silêncio dele fica mais lâmina. “Ouvi orgulho vestido de prudência”, diz. “O Sino mastiga isso e cospe sombra.”',
        choices: [
          {
            text:
              'Agarrar à pragmática com força brutal: empurrar a conversa para ferro, sangue, sobrevivência — menos teologia, mais muro.',
            resolution: {
              kind: 'skill',
              attr: 'str',
              tn: 9,
              successNodeId: 'v_success',
              failNodeId: 'd_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { enemyHpDelta: 2 },
          },
          {
            text:
              'Recuar em arrogânia vazia, insistindo que “não era isso” — e pedir que o acaso te salve de novo.',
            resolution: { kind: 'fixed', nextNodeId: 'd_fail' },
          },
        ],
      },
      body_pledge: {
        line:
          '“Boa”, sussurra Morvayn. “O corpo não mente tão alto quanto a boca.” O ar afina; a tensão baixa como fio a sangrar devagar.',
        choices: [
          {
            text:
              'Aceitar a palavra final dele sem aditivos — deixar o jurado cerrado como ferrolho.',
            resolution: { kind: 'fixed', nextNodeId: 'v_success' },
            effects: { enemyHpDelta: -3 },
          },
        ],
      },
      hungry_terms: {
        line:
          'Os olhos de Morvayn acendem com desdém quieto. “Quem vem comprar o Sino”, diz, “leva o preço na garganta.” A campa do cajado treme sem tocares.',
        choices: [
          {
            text:
              'Insistir no mercado — espremer benefícios, enumerar favores, falar como dono do ritual.',
            resolution: { kind: 'fixed', nextNodeId: 'd_fail' },
          },
          {
            text:
              'Engolir seco e refazer o tom: baixar volume, pedir direção, admitir que não você sabe o custo inteiro.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 9,
              successNodeId: 'mind_measured',
              failNodeId: 'd_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -2 },
            effectsOnFailure: { enemyHpDelta: 3 },
          },
        ],
      },
      nerve_cracks: {
        line:
          'O silêncio ganha dentes. Morvayn inclina-se: “Seu nervo partiu antes da frase.”',
        choices: [
          {
            text: 'Manter a linha a todo o custo — mesmo partida.',
            resolution: { kind: 'fixed', nextNodeId: 'd_fail' },
          },
        ],
      },
      v_success: {
        line:
          '“Serve”, diz Morvayn por fim — palavra curta como um ferro fechando. O ar rarefa; o Terceiro Sino parece adiar o osso para outra gaveta. “Agora sobes onde o pacto te espera.”',
        terminal: 'victory',
      },
      d_fail: {
        line:
          'Morvayn endireita o cajado. “Chega de preâmbulo”, diz, voz sem temperatura. “Se não aguentas o peso das sílabas, aguenta o peso do ferro.”',
        terminal: 'defeat',
      },
    },
  },
};
