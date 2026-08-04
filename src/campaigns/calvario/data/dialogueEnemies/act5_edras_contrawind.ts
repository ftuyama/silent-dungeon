import type { DialogueEnemyDef } from '../../../../engine/schema/index.ts';
import * as Spr from '../../ascii/sprites/enemies/index.ts';

const rollSuccess = { enemyHpDelta: -4 } as const;
const rollFailure = { enemyHpDelta: 3, playerHpLossPercent: 5 } as const;
const fixedCost = { enemyHpDelta: -3, playerHpLossPercent: 5 } as const;

export const act5_edras_contrawind: DialogueEnemyDef = {
  id: 'act5_edras_contrawind',
  name: 'Edras do Contravento',
  sprite: Spr.act5_edras_contrawind.sprite,
  tensionMax: 18,
  graph: {
    rootNodeId: 'root',
    nodes: {
      root: {
        line:
          'O círculo de Edras sibila sob a neve. “Mostre que seu poder sabe parar antes de tomar o que protege.”',
        choices: [
          {
            text:
              'Firmar os pés e conter uma rajada entre as mãos, sem deixá-la tocar o círculo.',
            resolution: { kind: 'skill', attr: 'str', tn: 10, successNodeId: 'stage2_clear', failNodeId: 'stage2_frayed' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Explicar que força sem limite destrói aquilo que prometeu guardar.',
            resolution: { kind: 'skill', attr: 'mind', tn: 10, successNodeId: 'stage2_clear', failNodeId: 'stage2_frayed' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Entrar um passo no vento e confiar que você saberá sair antes que ele feche.',
            resolution: { kind: 'luck', tn: 10, luckPenalty: 0, successNodeId: 'stage2_clear', failNodeId: 'stage2_frayed' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Pressionar a palma contra a borda do círculo e pagar com sangue pela passagem.',
            resolution: { kind: 'fixed', nextNodeId: 'stage2_clear' },
            effects: fixedCost,
          },
        ],
      },
      stage2_clear: {
        line:
          'Edras relaxa um dedo, mas o vento ainda corta seu rosto. “Conhecimento não é posse. Diga por que eu deveria abrir meus livros.”',
        choices: [
          {
            text:
              'Baixar a arma e mostrar que sua força aceita ficar sem uso diante de uma resposta.',
            resolution: { kind: 'skill', attr: 'str', tn: 10, successNodeId: 'stage3_clear', failNodeId: 'stage3_frayed' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Dizer que aprender cria uma obrigação; não transforma a lição em propriedade.',
            resolution: { kind: 'skill', attr: 'mind', tn: 10, successNodeId: 'stage3_clear', failNodeId: 'stage3_frayed' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Entregar a Edras o nome da magia que você mais teme desejar.',
            resolution: { kind: 'luck', tn: 10, luckPenalty: 0, successNodeId: 'stage3_clear', failNodeId: 'stage3_frayed' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Deixar o selo gelado queimar seu pulso e aceitar o conhecimento como dívida.',
            resolution: { kind: 'fixed', nextNodeId: 'stage3_clear' },
            effects: fixedCost,
          },
        ],
      },
      stage2_frayed: {
        line:
          'Sua primeira resposta se desfaz em ar branco. “Uma fissura”, diz Edras; o círculo aperta ao redor dos seus tornozelos.',
        choices: [
          {
            text:
              'Firmar os ombros e manter toda força imóvel enquanto Edras mede sua guarda.',
            resolution: { kind: 'skill', attr: 'str', tn: 10, successNodeId: 'stage3_frayed', failNodeId: 'rejected' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Corrigir a resposta: conhecimento recebido cria dever, nunca propriedade.',
            resolution: { kind: 'skill', attr: 'mind', tn: 10, successNodeId: 'stage3_frayed', failNodeId: 'rejected' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Revelar a magia que você teme desejar e deixar Edras julgar o risco.',
            resolution: { kind: 'luck', tn: 10, luckPenalty: 0, successNodeId: 'stage3_frayed', failNodeId: 'rejected' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Encostar o pulso no selo e pagar a dívida antes de conhecer a lição.',
            resolution: { kind: 'fixed', nextNodeId: 'stage3_frayed' },
            effects: fixedCost,
          },
        ],
      },
      stage3_clear: {
        line:
          'Os flocos param entre vocês, presos no contravento. “Toda lição muda quem a carrega. Mostre que você aceita a marca.”',
        choices: [
          {
            text:
              'Receber a rajada de frente e soltá-la sem devolver o golpe.',
            resolution: { kind: 'skill', attr: 'str', tn: 10, successNodeId: 'accepted', failNodeId: 'stage3_frayed' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Nomear a mudança que a lição fará em você e assumir seu preço.',
            resolution: { kind: 'skill', attr: 'mind', tn: 10, successNodeId: 'accepted', failNodeId: 'stage3_frayed' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Inspirar o vento do círculo e aceitar que ele escolha onde deixará a marca.',
            resolution: { kind: 'luck', tn: 10, luckPenalty: 0, successNodeId: 'accepted', failNodeId: 'stage3_frayed' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Deixar o selo cortar sua pele e carregar a cicatriz como parte da lição.',
            resolution: { kind: 'fixed', nextNodeId: 'accepted' },
            effects: fixedCost,
          },
        ],
      },
      stage3_frayed: {
        line:
          'O vento acha a fissura e arranca calor do seu peito. “Última medida”, diz Edras. “Controle, entendimento ou risco; escolha sem mentir.”',
        choices: [
          {
            text:
              'Conter a rajada nos braços trêmulos e soltá-la longe do círculo.',
            resolution: { kind: 'skill', attr: 'str', tn: 10, successNodeId: 'accepted', failNodeId: 'rejected' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Dizer com precisão como a lição mudará você e qual limite não cruzará.',
            resolution: { kind: 'skill', attr: 'mind', tn: 10, successNodeId: 'accepted', failNodeId: 'rejected' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Abrir a guarda para o contravento e aceitar a marca que vier.',
            resolution: { kind: 'luck', tn: 10, luckPenalty: 0, successNodeId: 'accepted', failNodeId: 'rejected' },
            effectsOnSuccess: rollSuccess,
            effectsOnFailure: rollFailure,
          },
          {
            text:
              'Oferecer a palma ao selo e deixar a dor confirmar sua resposta.',
            resolution: { kind: 'fixed', nextNodeId: 'accepted' },
            effects: fixedCost,
          },
        ],
      },
      accepted: {
        line:
          'Edras fecha a mão, e o vento cai como uma lâmina embainhada. “Você pode aprender sem chamar a lição de sua.”',
        terminal: 'victory',
      },
      rejected: {
        line:
          'Edras corta o ar com dois dedos; o círculo fecha e expulsa você para a neve. “Seu poder ainda confunde fome com direito.”',
        terminal: 'defeat',
      },
    },
  },
};
