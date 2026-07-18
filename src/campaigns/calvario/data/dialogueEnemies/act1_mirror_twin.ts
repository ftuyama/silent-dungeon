import type { DialogueEnemyDef } from '../../../../engine/schema/index.ts';
import * as Spr from '../../ascii/sprites/enemies/index.ts';

export const act1_mirror_twin: DialogueEnemyDef = {
  id: 'act1_mirror_twin',
  name: 'O outro no bronze',
  sprite: Spr.act1_mirror_twin.sprite,
  tensionMax: 13,
  lootDrops: [
    { chance: 0.22, resource: 'gold', amount: 2 },
    { chance: 0.08, itemId: 'potion_hp' },
  ],
  graph: {
    rootNodeId: 'root',
    nodes: {
      root: {
        line:
          'O bronze nos batentes não reflete: recolhe. Junta-se a você num ângulo que não escolheu — armadura e capa parecem emprestadas a quem ensaiou seu gesto antes de você. O corredor respira por duas bocas ao mesmo tempo. O metal não pergunta “quem é”; pergunta “quanto de você ainda é seu se eu te devolver o resto”.',
        choices: [
          {
            text:
              'Nomear em silêncio o medo mais pequeno — não o herói que queres ser, o hábito feio que conheces de cor.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 8,
              successNodeId: 'b_mind_ok',
              failNodeId: 'b_mind_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -2 },
            effectsOnFailure: { playerHpLossPercent: 5, enemyHpDelta: 2 },
          },
          {
            text:
              'Aproximar-se como quem entra em água fria: devagar, sem discurso, deixando o som dos passos dizer “ainda estou aqui”.',
            resolution: { kind: 'fixed', nextNodeId: 'b_soft' },
            effects: { enemyHpDelta: -2 },
          },
          {
            text:
              'Deixar o acaso decidir se o reflexo merece uma trégua ou uma lição — atirar a pergunta ao escuro e ouvir o que volta.',
            resolution: {
              kind: 'luck',
              tn: 8,
              luckPenalty: 0,
              successNodeId: 'b_luck_ok',
              failNodeId: 'b_luck_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -2 },
            effectsOnFailure: { playerHpLossPercent: 6, enemyHpDelta: 2 },
          },
          {
            text:
              'Empurrar para o espelho o que te pesa — vergonha, pressa, culpa — e exigir que ele carregue sozinho, ainda que isso rasgue.',
            resolution: { kind: 'fixed', nextNodeId: 'b_blunt' },
            effects: { playerHpLossPercent: 7, enemyHpDelta: 2 },
          },
        ],
      },

      b_mind_ok: {
        line:
          'A palavra certa não brilha: encaixa. O bronze hesita como quem perdeu o guião; por um instante, o reflexo não sabe se deve copiar ou corrigir.',
        choices: [
          {
            text:
              'Não pedir aplausos ao espelho; pedir silêncio — o tipo de silêncio que não vende postais.',
            resolution: { kind: 'fixed', nextNodeId: 'c_m_ok_a' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Confessar um pormenor ridículo (um tic, um cheiro, um medo de barata) para provar que sua humanidade não cabe num slogan.',
            resolution: { kind: 'fixed', nextNodeId: 'c_m_ok_b' },
            effects: { enemyHpDelta: -2 },
          },
          {
            text:
              'Testar se consegue desviar o olhar sem fugir — aguentar o brilho até ele perder graça.',
            resolution: {
              kind: 'skill',
              attr: 'agi',
              tn: 8,
              successNodeId: 'c_m_ok_c',
              failNodeId: 'c_m_ok_c_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -2 },
            effectsOnFailure: { playerHpLossPercent: 5, enemyHpDelta: 1 },
          },
        ],
      },
      b_mind_fail: {
        line:
          'A frase escorrega. O metal agradece: adora quando tenta ser profundo e sai pretensioso. O reflexo te devolve uma versão mais limpa — e por isso mais falsa — do que disse.',
        choices: [
          {
            text:
              'Aceitar o tropeço; rir por dentro, seco, e voltar à coisa concreta: respiração, peso dos pés, frio na nuca.',
            resolution: { kind: 'fixed', nextNodeId: 'c_m_fail_a' },
            effects: { playerHpLossPercent: 4, enemyHpDelta: -1 },
          },
          {
            text:
              'Apertar a mandíbula e insistir na mesma linha — “não, eu sei o que quis dizer” — sabendo que insistência aqui é combustível.',
            resolution: { kind: 'fixed', nextNodeId: 'c_m_fail_b' },
            effects: { playerHpLossPercent: 8, enemyHpDelta: 3 },
          },
          {
            text:
              'Pedir ao corpo uma saída de emergência: força bruta de presença, como quem empurra uma porta emperrada.',
            resolution: {
              kind: 'skill',
              attr: 'str',
              tn: 9,
              successNodeId: 'c_m_fail_c_ok',
              failNodeId: 'c_m_fail_c_bad',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { playerHpLossPercent: 8, enemyHpDelta: 2 },
          },
        ],
      },

      b_soft: {
        line:
          'No limiar, o frio sobe pela nuca. O espelho assume que você já estava lá, só virado ao contrário. Por um instante, duas sombras discutem qual nasceu primeiro — e nenhuma quer perder.',
        choices: [
          {
            text:
              'Esvaziar o peito devagar, sem performance, até o reflexo não ter frase pronta para roubar.',
            resolution: { kind: 'fixed', nextNodeId: 'c_soft_a' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Desafiar o bronze com o olhar até arder — “prova que não sou eu” — sem abrir a boca.',
            resolution: { kind: 'fixed', nextNodeId: 'c_soft_b' },
            effects: { enemyHpDelta: 2 },
          },
          {
            text:
              'Deixar a sorte escolher se o silêncio te protege ou se o corredor te expõe de lado.',
            resolution: {
              kind: 'luck',
              tn: 7,
              luckPenalty: 0,
              successNodeId: 'c_soft_c_ok',
              failNodeId: 'c_soft_c_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -2 },
            effectsOnFailure: { playerHpLossPercent: 4, enemyHpDelta: 2 },
          },
        ],
      },

      b_luck_ok: {
        line:
          'Algo no ar desalinha a cópia. O reflexo ainda tenta acompanhar você, mas chega atrasado: riso que não combinava, gesto que não ensaiou — e mesmo assim foi seu.',
        choices: [
          {
            text:
              'Aproveitar o desalinhamento: falar baixo, quase trivial, para que o metal não tenha eco heroico.',
            resolution: { kind: 'fixed', nextNodeId: 'c_l_ok_a' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Exigir prova física: tocar o batente com a palma da mão e sentir se o mundo “real” responde primeiro.',
            resolution: {
              kind: 'skill',
              attr: 'str',
              tn: 8,
              successNodeId: 'c_l_ok_b_ok',
              failNodeId: 'c_l_ok_b_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { playerHpLossPercent: 7, enemyHpDelta: 1 },
          },
          {
            text:
              'Virar as costas meio segundo ao reflexo — não por desprezo, por confiança maldosa nseu próprio eixo.',
            resolution: { kind: 'fixed', nextNodeId: 'c_l_ok_c' },
            effects: { enemyHpDelta: -2 },
          },
        ],
      },
      b_luck_fail: {
        line:
          'O acaso escolhe o pior eco. O espelho devolve uma risada que não é sua e, mesmo assim, soa convincente. Por um segundo, acreditas — e esse segundo é buraco.',
        choices: [
          {
            text:
              'Soltar o orgulho e voltar ao básico: um fato simples, sem adorno, que nem o bronze consiga torcer.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 9,
              successNodeId: 'c_l_fail_a_ok',
              failNodeId: 'c_l_fail_a_bad',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { playerHpLossPercent: 8, enemyHpDelta: 2 },
          },
          {
            text:
              'Correr o risco de novo — pedir outra moeda ao poço, mesmo com a mão a tremer.',
            resolution: {
              kind: 'luck',
              tn: 9,
              luckPenalty: 1,
              successNodeId: 'c_l_fail_b_ok',
              failNodeId: 'c_l_fail_b_bad',
            },
            effectsOnSuccess: { enemyHpDelta: -2 },
            effectsOnFailure: { playerHpLossPercent: 10, enemyHpDelta: 3 },
          },
          {
            text:
              'Aguentar o choque sem fingir coragem: deixar o corpo tremer e mesmo assim não dar palavra afiada.',
            resolution: { kind: 'fixed', nextNodeId: 'c_l_fail_c' },
            effects: { playerHpLossPercent: 10 },
          },
        ],
      },

      b_blunt: {
        line:
          'O espelho não recua: espelha sua dureza e acrescenta a dela. O verde do bronze espessa; vês dois rostos a discutir quem começou — e percebe que acusação é munição que você entregaste.',
        choices: [
          {
            text:
              'Baixar as armas verbais antes que o metal as devore — reconhecer o tom partido.',
            resolution: { kind: 'fixed', nextNodeId: 'c_bl_a' },
            effects: { enemyHpDelta: -2 },
          },
          {
            text:
              'Responder fogo com fogo, exigindo prova, sabendo que isso alimenta o reflexo.',
            resolution: { kind: 'fixed', nextNodeId: 'c_bl_b' },
            effects: { playerHpLossPercent: 6, enemyHpDelta: 3 },
          },
          {
            text:
              'Tentar partir a tensão com o corpo: avanço curto, firme, como quem ocupa terreno sem gritar.',
            resolution: {
              kind: 'skill',
              attr: 'str',
              tn: 9,
              successNodeId: 'c_bl_c_ok',
              failNodeId: 'c_bl_c_bad',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { playerHpLossPercent: 6, enemyHpDelta: 2 },
          },
        ],
      },

      c_m_ok_a: {
        line:
          'O silêncio que pediste não é bonito: é útil. O reflexo fica sem reverberação e, por um instante, parece… sobrar demais espaço.',
        choices: [
          {
            text: 'Atravessar esse espaço sem olhar para trás.',
            resolution: { kind: 'fixed', nextNodeId: 'd_truce_space' },
            effects: { enemyHpDelta: -1 },
          },
          {
            text:
              'Deixar uma promessa mínima ao espelho: “não te uso para me punir hoje” — e cumpri-la só com postura.',
            resolution: { kind: 'fixed', nextNodeId: 'd_truce_oath' },
            effects: { enemyHpDelta: -1 },
          },
        ],
      },
      d_truce_space: {
        line:
          'No meio do espaço novo, o corredor parece mais alto e o bronze mais baixo — como se a distância tivesse mudado de dono. Ainda assim, o reflexo tenta colar-se ao seu ângulo de fuga.',
        choices: [
          {
            text:
              'Parar, ouvir a pedra antes do metal — deixar o corredor falar baixo o suficiente para o espelho perder o costume dsua voz.',
            resolution: { kind: 'fixed', nextNodeId: 'h_armistice' },
            effects: { enemyHpDelta: -2 },
          },
          {
            text:
              'Atravessar de rompante: não dar tempo ao bronze de ensaiar a segunda frase.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Medir o passo com agilidade de quem foge a cordas invisíveis — sem correr, sem tropeçar no próprio medo.',
            resolution: {
              kind: 'skill',
              attr: 'agi',
              tn: 8,
              successNodeId: 'd_truce_space_agile',
              failNodeId: 'h_armistice',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { enemyHpDelta: -1 },
          },
        ],
      },
      d_truce_space_agile: {
        line:
          'O passo encaixa; o reflexo chega atrasado por um compasso. Por um instante, o corredor parece seu aliado mesquinho — só sombra e rangido, nada de cena.',
        choices: [
          {
            text: 'Não mitificar o instante: aproveitar e calar antes que o mito renasca.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Permitir a você olhar uma vez — só uma — para confirmar que o espelho ainda está tentando alcançar você.',
            resolution: { kind: 'fixed', nextNodeId: 'h_armistice' },
            effects: { enemyHpDelta: -2 },
          },
        ],
      },
      d_truce_oath: {
        line:
          'A promessa mínima pesa como anel apertado: pequena, real. O bronze quer transformá-la em juramento épico — porque epicidade aqui é armadilha.',
        choices: [
          {
            text:
              'Dizer a promessa ao batente de madeira, ao chão, ao ar — a qualquer coisa que não peça aplausos.',
            resolution: { kind: 'fixed', nextNodeId: 'h_armistice' },
            effects: { enemyHpDelta: -2 },
          },
          {
            text:
              'Cumprir postura de frente para o reflexo: olhos nele, corpo fechado em promessa silenciosa.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Testar se sua mente aguenta o tom sem virar peça.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 8,
              successNodeId: 'gate_release',
              failNodeId: 'h_armistice',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { enemyHpDelta: -1 },
          },
        ],
      },
      h_armistice: {
        line:
          'Rotas diferentes, mesmo limiar: o bronze baixa o volume como quem finalmente percebe que seu silêncio não é falta de argumento — é recusa em emprestar-te o guião. Ainda assim, exige uma última escolha.',
        choices: [
          {
            text:
              'Fechar em trégua quieta — sem música, sem pose — só espaço que respira sem réplica.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Fechar em promessa mínima cumprida: não bonita, mas sua — e o espelho fica com a vergonha dele.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -2 },
          },
          {
            text:
              'Escolher a verdade pequena, feia, de cozinha — a que não impressiona ninguém e por isso não mente.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Deixar um suspiro feio subir ao corredor antes que o metal o roube e o torne “bonito”.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -3 },
          },
        ],
      },
      c_m_ok_b: {
        line:
          'O pormenor ridículo fica mais real que qualquer discurso. O bronze tenta ironizar e engasga-se: não há graça limpa quando a vergonha tem nome de cozinha.',
        choices: [
          {
            text: 'Fechar o assunto com um aceno seco — sem vitória bonita, com vitória sua.',
            resolution: { kind: 'fixed', nextNodeId: 'h_armistice' },
            effects: { enemyHpDelta: -2 },
          },
          {
            text:
              'Permitir a você um suspiro feio, honesto, que o corredor ouça antes do metal.',
            resolution: { kind: 'fixed', nextNodeId: 'h_armistice' },
            effects: { enemyHpDelta: -2 },
          },
        ],
      },
      c_m_ok_c: {
        line:
          'O brilho perde graça quando não o alimentas com medo. O reflexo ainda está lá, mas já não manda no ritmo dsua pupila.',
        choices: [
          {
            text: 'Seguir em frente como quem sabe onde pisa.',
            resolution: { kind: 'fixed', nextNodeId: 'd_steady_prep' },
            effects: { enemyHpDelta: -1 },
          },
          {
            text:
              'Guardar este truque para você: olhar “morto” que desarma espelhos famintos.',
            resolution: { kind: 'fixed', nextNodeId: 'd_steady_prep' },
            effects: { enemyHpDelta: -1 },
          },
        ],
      },
      d_steady_prep: {
        line:
          'Antes de crer que já ganhaste o olhar, o corredor pede uma confirmação mesquinha: um som real — rangido, sua respiração, qualquer coisa que não seja eco do bronze.',
        choices: [
          {
            text:
              'Dar ao corpo o comando: ombros largos, queixo neutro, olhar que não alimenta o espetáculo.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_steady' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Guardar o truque como segredo operacional — não exibir frieza, usá-la.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_steady' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Deixar o espelho tentar copiar seu “olhar morto” e rir por dentro quando ele exagera.',
            resolution: { kind: 'fixed', nextNodeId: 'h_armistice' },
            effects: { enemyHpDelta: -2 },
          },
        ],
      },
      c_m_ok_c_fail: {
        line:
          'O olhar escapa na hora H. O metal lambe a falha e devolve uma lágrima que você não pediu — convincente até demais.',
        choices: [
          {
            text: 'Aceitar o corte e seguir mesmo assim — sem negociar com o reflexo.',
            resolution: { kind: 'fixed', nextNodeId: 'h_winter_edge' },
          },
          {
            text:
              'Repor distância fisicamente: um passo atrás, ombros baixos, ar que não alimenta o incêndio.',
            resolution: { kind: 'fixed', nextNodeId: 'h_winter_edge' },
          },
        ],
      },

      c_m_fail_a: {
        line:
          'O tropeço fica no ar como cheiro a queimado. Ainda assim, o corpo lembra você de coisas que o discurso esqueceu: peso, chão, respiração.',
        choices: [
          {
            text: 'Deixar o erro ficar pequeno onde está.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Transformar o tropeço em piada seca — arriscar o espelho rir com você e não de você.',
            resolution: {
              kind: 'luck',
              tn: 8,
              luckPenalty: 0,
              successNodeId: 'gate_release',
              failNodeId: 'gate_release',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { playerHpLossPercent: 6, enemyHpDelta: -2 },
          },
        ],
      },
      c_m_fail_b: {
        line:
          'A insistência acende o bronze. Agora o reflexo fala por você em frases perfeitas — e cada uma é uma facada de cortesia.',
        choices: [
          {
            text:
              'Cortar o fio: calar de vez, mesmo com a garganta pedindo justiça.',
            resolution: { kind: 'fixed', nextNodeId: 'h_winter_edge' },
          },
          {
            text:
              'Pagar o preço e empurrar até o fim — sangrar para ver se o espelho sangra também.',
            resolution: { kind: 'fixed', nextNodeId: 'h_winter_edge' },
          },
        ],
      },
      h_winter_edge: {
        line:
          'Chegas ao mesmo lugar quente por caminhos diferentes: o bronze aperta onde a pele ainda acredita que pode fingir que não sente. Aqui, hostilidade e vergonha trocam de lugar — e o corredor pede que escolha como sai da borda, não como entras no mito.',
        choices: [
          {
            text:
              'Aceitar o corte moral e seguir sem negociar com o reflexo do reflexo.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_winter' },
            effects: { playerHpLossPercent: 9, enemyHpDelta: -3 },
          },
          {
            text:
              'Repor distância no corpo: um passo atrás, ombros baixos, ar que não alimenta o incêndio.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { playerHpLossPercent: 5, enemyHpDelta: -2 },
          },
          {
            text:
              'Calar de vez, mesmo com a garganta pedindo justiça — deixar o silêncio ser faca.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_winter' },
            effects: { playerHpLossPercent: 12, enemyHpDelta: -4 },
          },
          {
            text:
              'Empurrar até o fim — sangrar para ver se o espelho sangra também.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_winter' },
            effects: { playerHpLossPercent: 18, enemyHpDelta: -7 },
          },
        ],
      },
      c_m_fail_c_ok: {
        line:
          'A porta cede ao ombro — não por violência gloriosa, por teimosia física honesta. O reflexo perde um instante de sincronia e, nesse instante, você existes inteiro.',
        choices: [
          {
            text: 'Passar enquanto a fresta ainda respira.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_shoulder' },
            effects: { enemyHpDelta: -6 },
          },
          {
            text:
              'Não celebrar; só ocupar o espaço como quem sabe que empurrões também cansam.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_shoulder' },
            effects: { enemyHpDelta: -5 },
          },
        ],
      },
      c_m_fail_c_bad: {
        line:
          'O ombro encontra pedra com pele de metal. O corredor ri por você, baixinho. O reflexo agradece a lição de impaciência.',
        choices: [
          {
            text:
              'Aceitar o hematoma moral e seguir — vitória feia, mas vitória.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 14, enemyHpDelta: -5 },
          },
          {
            text:
              'Recuar e pagar o preço do espetáculo — sangrar, mas tirar ao espelho a última gargalhada.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 20, enemyHpDelta: -8 },
          },
        ],
      },

      c_soft_a: {
        line:
          'O silêncio aprende sua forma. O bronze deixa de vibrar com frases prontas e passa a escutar pausas — essas, sim, suas.',
        choices: [
          {
            text:
              'Escolher a verdade pequena: o pormenor feio que não impressiona ninguém, mas não mente.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 7,
              successNodeId: 'c_soft_a_ok',
              failNodeId: 'c_soft_a_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { playerHpLossPercent: 5, enemyHpDelta: 1 },
          },
          {
            text:
              'Endurecer por dentro “para não ceder” — e sentir o metal agradecer a você a armadura invisível.',
            resolution: { kind: 'fixed', nextNodeId: 'c_soft_a_hard' },
            effects: { enemyHpDelta: 2 },
          },
          {
            text:
              'Convidar o reflexo a copiar seu cansaço em vez do seu discurso — deixar as pálpebras pesadas falarem.',
            resolution: { kind: 'fixed', nextNodeId: 'c_soft_a_tired' },
            effects: { enemyHpDelta: -2 },
          },
        ],
      },
      c_soft_a_ok: {
        line:
          'A verdade pequena encaixa. O espelho não tem como a alargar em lenda sem partir.',
        choices: [
          {
            text: 'Encerrar com a mesma simplicidade com que começaste.',
            resolution: { kind: 'fixed', nextNodeId: 'd_soft_merge' },
          },
          {
            text:
              'Oferecer ao bronze uma segunda pequena verdade — talvez cruel com você, justa com o mundo.',
            resolution: { kind: 'fixed', nextNodeId: 'd_soft_merge' },
          },
        ],
      },
      d_soft_merge: {
        line:
          'O corredor parece alargar um dedo: ainda há duas maneiras de saíres dali sem  tornares monumento — e ambas exigem que continues pequeno o suficiente para seres real.',
        choices: [
          {
            text:
              'Fechar com um aceno seco — sem vitória bonita, com vitória sua.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Permitir o suspiro feio e seguir — sem segunda peça.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -5 },
          },
          {
            text:
              'Ouvir o corredor pedir trégua por você — e deixar a palavra certa nascer no silêncio, não no bronze.',
            resolution: { kind: 'fixed', nextNodeId: 'h_armistice' },
            effects: { enemyHpDelta: -2 },
          },
        ],
      },
      c_soft_a_fail: {
        line:
          'A verdade pequena sai torta na boca e vira confissão dramática. O metal adora drama — bebe-o sem sede.',
        choices: [
          {
            text: 'Parar de falar até o drama morrer de fome.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { playerHpLossPercent: 6, enemyHpDelta: -3 },
          },
          {
            text:
              'Aceitar o ridículo e seguir — com a pele a arder de vergonha, mas com os pés a avançar.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 9, enemyHpDelta: -4 },
          },
        ],
      },
      c_soft_a_hard: {
        line:
          'A dureza devolve dureza. O reflexo ganha bordas; seu rosto duplica-se em camadas que se julgam umas às outras.',
        choices: [
          {
            text:
              'Dissolver a postura: ombros, mandíbula, mentira de “estou bem”.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 5, enemyHpDelta: -2 },
          },
          {
            text:
              'Manter a couraça e pagar o preço — ver se o metal cansa antes de você.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 11, enemyHpDelta: -3 },
          },
        ],
      },
      c_soft_a_tired: {
        line:
          'O cansaço não é espetáculo; é biologia. O espelho tenta transformá-lo em derrota e falha — porque cansaço também é humano demais para mito.',
        choices: [
          {
            text: 'Deixar o cansaço ficar com você sem vergonha.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_fatigue' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Usar o cansaço como escudo: “não tenho energia para sua performance”.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_fatigue' },
            effects: { enemyHpDelta: -5 },
          },
        ],
      },

      c_soft_b: {
        line:
          'O olhar ardente alimenta o bronze. O reflexo sorri com sua boca e soma-lhe um segundo sorriso — o que você não pediu.',
        choices: [
          {
            text:
              'Apagar o fogo no olhar: frio controlado, quase rude, sem hostilidade de palco.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 8,
              successNodeId: 'c_soft_b_ok',
              failNodeId: 'c_soft_b_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -3 },
            effectsOnFailure: { playerHpLossPercent: 6, enemyHpDelta: 2 },
          },
          {
            text:
              'Manter o desafio e pagar o calor — suor, tontura, a sensação de estares a negociar com chama.',
            resolution: { kind: 'fixed', nextNodeId: 'c_soft_b_burn' },
            effects: { playerHpLossPercent: 10, enemyHpDelta: 1 },
          },
          {
            text:
              'Deslocar o duelo para o ironismo mínimo — um detalhe absurdo que desmonte a pose de herói sem virar palhaço.',
            resolution: { kind: 'fixed', nextNodeId: 'c_soft_b_wry' },
            effects: { enemyHpDelta: -1 },
          },
        ],
      },
      c_soft_b_wry: {
        line:
          'O absurdo pequeno fica mais afiado que a bravura. O espelho tenta copiar seu humor e atras-se meia batida — o suficiente para a cópia parecer doente.',
        choices: [
          {
            text:
              'Fechar com um último pormenor ridículo e calar — deixar o riso morrer na garganta, não no metal.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_irony' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Deixar o riso sair — baixo, feio, humano — e ver se o bronze sabe engolir som que não ensaiou.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_irony' },
            effects: { enemyHpDelta: -3 },
          },
        ],
      },
      c_soft_b_ok: {
        line:
          'O calor baixa sem humilhação. O espelho procura outra emoção para roubar e não encontra — só atenção seca, quase clínica.',
        choices: [
          {
            text: 'Fechar o confronto com essa clínica fria.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Virar costas ao reflexo por três passos — tempo suficiente para o mito morrer de sede.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -3 },
          },
        ],
      },
      c_soft_b_fail: {
        line:
          'Tentas apagar o fogo e acendes cinismo. O metal adora cinismo: é açúcar para espelhos.',
        choices: [
          {
            text: 'Sair do cinismo à força — voltar ao corpo, à tolice honesta.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 8, enemyHpDelta: -3 },
          },
          {
            text:
              'Aceitar o preço e seguir com o cinismo como cicatriz visível.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 13, enemyHpDelta: -5 },
          },
        ],
      },
      c_soft_b_burn: {
        line:
          'O calor torna-se úmidos e barulho dentro da cabeça. O reflexo dança nsua vertigem — e por um instante quase te convence que gosta disso.',
        choices: [
          {
            text: 'Cortar o trance com dor física mínima — morder a língua, agarrar o cinto, ancorar.',
            resolution: { kind: 'fixed', nextNodeId: 'd_burn_stall' },
          },
          {
            text:
              'Deixar arder até o fim e arrancar vitória dos restos — caro, mas seu.',
            resolution: { kind: 'fixed', nextNodeId: 'd_burn_stall' },
          },
        ],
      },
      d_burn_stall: {
        line:
          'No meio do calor, o corredor oferece um instante de “real” — rangido, frio na pedra — como se quisesse lembrar você que o fogo também cansa se não lhe deres palha.',
        choices: [
          {
            text:
              'Ancorar no corpo: morder a língua, agarrar o cinto, existir fora do monólogo.',
            resolution: { kind: 'fixed', nextNodeId: 'h_burn_merge' },
            effects: { playerHpLossPercent: 4, enemyHpDelta: -1 },
          },
          {
            text:
              'Empurrar o fogo até o limite e ver o que resta quando a chama não tem público.',
            resolution: { kind: 'fixed', nextNodeId: 'h_burn_merge' },
            effects: { enemyHpDelta: -2 },
          },
        ],
      },
      h_burn_merge: {
        line:
          'Fogo com fogo deixa o bronze espelhado em cinzas verdes. Chegas aqui por vertigem ou por confronto — o resultado cheira igual a metal quente e orgulho mal dormido.',
        choices: [
          {
            text:
              'Ancorar no corpo quando o calor verbal vira vertigem — morder a língua, agarrar o cinto.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_burn' },
            effects: { playerHpLossPercent: 8, enemyHpDelta: -3 },
          },
          {
            text:
              'Deixar arder até o fim e arrancar vitória dos restos — choque limpo, sem pose.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_burn' },
            effects: { playerHpLossPercent: 12, enemyHpDelta: -5 },
          },
          {
            text:
              'Engolir o orgulho e procurar a beira do silêncio antes que ele te procure com dentes.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_burn' },
            effects: { playerHpLossPercent: 8, enemyHpDelta: -4 },
          },
          {
            text:
              'Manter o ritmo da provocação até o fim — choque limpo, sem cena.',
            resolution: { kind: 'fixed', nextNodeId: 'linger_burn' },
            effects: { playerHpLossPercent: 18, enemyHpDelta: -8 },
          },
        ],
      },

      c_soft_c_ok: {
        line:
          'O corredor escolhe seu lado por acidente — sombra na pedra, rangido longe do bronze. O espelho hesita como quem perdeu o compasso.',
        choices: [
          {
            text: 'Seguir o acidente como bússola.',
            resolution: { kind: 'fixed', nextNodeId: 'h_calm_echo' },
          },
          {
            text:
              'Não mitificar o acaso — só agradecer em silêncio e andar.',
            resolution: { kind: 'fixed', nextNodeId: 'h_calm_echo' },
          },
        ],
      },
      h_calm_echo: {
        line:
          'O mesmo sossego chega por rotas diferentes: o bronze baixa o volume e o corredor parece lembrar que existem sons que não nascem do metal. Ainda assim, falta escolher como fechas o capítulo sem lenda.',
        choices: [
          {
            text:
              'Seguir o acidente como bússola — deixar o anti-mito respirar.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Agradecer em silêncio e andar — sem romance, sem pedestal.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -3 },
          },
          {
            text:
              'Rir por dentro sem oferecer som ao metal — deixar o corpo roubar a última linha.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Acelerar o passo só o suficiente para quebrar a sincronia com o reflexo.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -5 },
          },
        ],
      },
      c_soft_c_fail: {
        line:
          'O corredor entrega você ao bronze outra vez. O acaso ri com dentes de metal; sua sombra tropeça na dele.',
        choices: [
          {
            text:
              'Rolar os dados do corpo: agilidade para não ser puxado para a cópia.',
            resolution: {
              kind: 'skill',
              attr: 'agi',
              tn: 9,
              successNodeId: 'gate_toll',
              failNodeId: 'gate_toll',
            },
            effectsOnSuccess: { enemyHpDelta: -5 },
            effectsOnFailure: { playerHpLossPercent: 8, enemyHpDelta: 1 },
          },
          {
            text:
              'Recusar jogos: aguentar o desalinhamento sem gracejo — peito aberto, sem proposta, até o espelho se fartar de te copiar parado.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { playerHpLossPercent: 8, enemyHpDelta: -4 },
          },
          {
            text:
              'Negociar com o ar — palavras ditas ao corredor, não ao bronze — para ver se o mundo “real” te reconhece primeiro.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 8,
              successNodeId: 'gate_release',
              failNodeId: 'gate_release',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { playerHpLossPercent: 7, enemyHpDelta: 2 },
          },
        ],
      },

      c_l_ok_a: {
        line:
          'A trivialidade desarma o mito. O reflexo tenta elevar a fala a monumento e falha — não há pedestal para “hoje comi”.',
        choices: [
          {
            text: 'Terminar num murmúrio quase inaudível — vitória por anti-clímax.',
            resolution: { kind: 'fixed', nextNodeId: 'd_trivial_merge' },
          },
          {
            text:
              'Empurrar mais trivialidade até o espelho vomitar poesia e perder o timing.',
            resolution: { kind: 'fixed', nextNodeId: 'd_trivial_merge' },
          },
        ],
      },
      d_trivial_merge: {
        line:
          'No mesmo patamar de mesquinhez sagrada, o corredor sorri por você: trivialidade venceu o pedestal. Falta só decidir se sai num sussurro ou numa avalanche controlada.',
        choices: [
          {
            text: 'Sair no sussurro — anti-clímax como espada.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -5 },
          },
          {
            text:
              'Sair na avalanche — trivialidade até o espelho perder o timing.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -6 },
          },
          {
            text:
              'Desviar para o hub do silêncio útil — ainda há espaço para outra fechadura sem cena.',
            resolution: { kind: 'fixed', nextNodeId: 'h_armistice' },
            effects: { enemyHpDelta: -2 },
          },
        ],
      },
      c_l_ok_b_ok: {
        line:
          'A palma encontra madeira fria antes do mito. O mundo “real” responde com gratidão seca: ainda há bordas que não são espelho.',
        choices: [
          {
            text: 'Ficar com essa descoberta como talismã sem romance.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -5 },
          },
          {
            text:
              'Bater mais uma vez — marca ritmo, não cena.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -4 },
          },
        ],
      },
      c_l_ok_b_fail: {
        line:
          'A mão encontra o batente e o metal devolve o choque como riso. O corpo lembra: aqui, “real” também morde.',
        choices: [
          {
            text: 'Aceitar a mordida e seguir com a palma dormente.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 8, enemyHpDelta: -3 },
          },
          {
            text:
              'Trocar de mão, de ângulo, de ombro — teimosia física feia e eficaz.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 5, enemyHpDelta: -2 },
          },
        ],
      },
      c_l_ok_c: {
        line:
          'Confiança no eixo é provocação certa. O reflexo tenta copiar a rotação dos ombros e chega atrasado — parece marioneta.',
        choices: [
          {
            text: 'Rir por dentro sem oferecer som ao metal.',
            resolution: { kind: 'fixed', nextNodeId: 'h_calm_echo' },
          },
          {
            text:
              'Acelerar o passo só o suficiente para quebrar a sincronia.',
            resolution: { kind: 'fixed', nextNodeId: 'h_calm_echo' },
          },
        ],
      },

      c_l_fail_a_ok: {
        line:
          'O fato simples corta como faca de cozinha: feio, eficiente. O espelho não consegue enfeitar sem mentir mais alto — e hesita.',
        choices: [
          {
            text: 'Fechar com esse fato como fecho de porta.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -5 },
          },
          {
            text:
              'Repetir o fato até o eco morrer de tédio.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -6 },
          },
        ],
      },
      c_l_fail_a_bad: {
        line:
          'Até o fato simples lhe foge à boca. O bronze agradece: adora quando a língua trava no básico.',
        choices: [
          {
            text: 'Cale e deixe o silêncio ser o fato.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { playerHpLossPercent: 11, enemyHpDelta: -4 },
          },
          {
            text:
              'Insistires balbuciando — pagar o ridículo e arrancar mesquinhez ao espelho.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { playerHpLossPercent: 15, enemyHpDelta: -6 },
          },
        ],
      },
      c_l_fail_b_ok: {
        line:
          'A segunda moeda cai do lado certo por milímetro. O reflexo engole o desapontamento; você engoles oxigénio.',
        choices: [
          {
            text: 'Não tentar uma terceira — sabedoria de quem sobreviveu a casinos.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Guardar a sensação de “por pouco” como aviso, não como heroísmo.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -3 },
          },
        ],
      },
      c_l_fail_b_bad: {
        line:
          'A segunda moeda ruge a rir. O corredor inclina-se para o bronze; você sentes o piso a sugerir joelhos.',
        choices: [
          {
            text: 'Recusar joelhos; pagar em pele e sangue imaginário.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 16, enemyHpDelta: -5 },
          },
          {
            text:
              'Aceitar um joelho só no chão real — pedra fria — e roubar ao mito a postura de rendição completa.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 12, enemyHpDelta: -4 },
          },
        ],
      },
      c_l_fail_c: {
        line:
          'Tremer sem discurso é oferta estranha ao espelho: ele não sabe se goza ou se inveja. O metal fica sem frase pronta para a vergonha honesta.',
        choices: [
          {
            text: 'Deixar o tremor ficar com você até passar.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { playerHpLossPercent: 10, enemyHpDelta: -5 },
          },
          {
            text:
              'Agarrar o tremor como prova viva — “isto não é cena”.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 11, enemyHpDelta: -6 },
          },
        ],
      },

      c_bl_a: {
        line:
          'O bronze ainda resiste, mas já não como muralha: como pele depois de febre. O outro no bronze testa se vai voltar à agressão por hábito.',
        choices: [
          {
            text:
              'Esperar mais um compasso; deixar a paciência fazer o trabalho sujo da coragem.',
            resolution: {
              kind: 'skill',
              attr: 'mind',
              tn: 8,
              successNodeId: 'c_bl_a_ok',
              failNodeId: 'c_bl_a_fail',
            },
            effectsOnSuccess: { enemyHpDelta: -4 },
            effectsOnFailure: { playerHpLossPercent: 5, enemyHpDelta: 2 },
          },
          {
            text:
              'Impacientar-se: exigir resposta imediata à porta que ainda arrefece.',
            resolution: { kind: 'fixed', nextNodeId: 'c_bl_a_rush' },
            effects: { enemyHpDelta: 2 },
          },
          {
            text:
              'Oferecer desculpas sem palavras — só postura aberta, palmas visíveis, sem pose de herói.',
            resolution: { kind: 'fixed', nextNodeId: 'c_bl_a_body' },
            effects: { enemyHpDelta: -2 },
          },
        ],
      },
      c_bl_a_ok: {
        line:
          'A paciência não é virtude bonita aqui: é táctica. O reflexo fica sem estímulo e baixa o volume por puro tédio hostil.',
        choices: [
          {
            text: 'Sair da conversa antes que ela renasca.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -5 },
          },
          {
            text:
              'Marcar o silêncio como vitória sem monumento.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
            effects: { enemyHpDelta: -4 },
          },
        ],
      },
      c_bl_a_fail: {
        line:
          'A paciente fingida vira passividade venenosa. O espelho enche o vazio com vozes que soam como você — mas com melhor vocabulário.',
        choices: [
          {
            text: 'Quebrar a passividade com um gesto brusco e verdadeiro.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 9, enemyHpDelta: -3 },
          },
          {
            text:
              'Aceitar a voz e negociar com ela — caro, perigoso, seu.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 14, enemyHpDelta: -5 },
          },
        ],
      },
      c_bl_a_rush: {
        line:
          'A pressa alimenta o bronze outra vez. O reflexo adora prazos — transforma-os em culpa com data marcada.',
        choices: [
          {
            text: 'Retirar a pressa de súbito — parar no meio do passo.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 7, enemyHpDelta: -2 },
          },
          {
            text:
              'Manter a pressa e pagar o colapso — vitória em cinzas.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 17, enemyHpDelta: -6 },
          },
        ],
      },
      c_bl_a_body: {
        line:
          'Palmas visíveis não são rendição: são geografia. O espelho tenta ler sinais de fraqueza e encontra só anatomia.',
        choices: [
          {
            text: 'Fechar com calma corporal, sem slogan.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { enemyHpDelta: -4 },
          },
          {
            text:
              'Baixar as mãos devagar — ritmo de quem encerra conversa, não de quem implora.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { enemyHpDelta: -5 },
          },
        ],
      },

      c_bl_b: {
        line:
          'Fogo com fogo espessa o verde do bronze. O reflexo inventa versões suas — piores, mais limpas, mais cruéis — e quase te convence.',
        choices: [
          {
            text:
              'Engolir o orgulho e procurar a beira do silêncio antes que ele te procure com dentes.',
            resolution: { kind: 'fixed', nextNodeId: 'h_burn_merge' },
          },
          {
            text:
              'Manter o ritmo da provocação até o fim — choque limpo, sem cena.',
            resolution: { kind: 'fixed', nextNodeId: 'h_burn_merge' },
          },
        ],
      },
      c_bl_c_ok: {
        line:
          'O avanço curto ocupa terreno sem discurso. O reflexo recua um milímetro — milímetro humano, não mito.',
        choices: [
          {
            text: 'Consolidar o terreno com mais um passo curto.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { enemyHpDelta: -6 },
          },
          {
            text:
              'Parar a tempo — vitória por contenção, não por conquista.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { enemyHpDelta: -5 },
          },
        ],
      },
      c_bl_c_bad: {
        line:
          'O corpo avança e o espelho devolve o avanço como escárnio sincronizado. Por um instante, são dois a tropeçar no mesmo lugar.',
        choices: [
          {
            text: 'Aceitar o embate e sair com dentes cerrados.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 13, enemyHpDelta: -4 },
          },
          {
            text:
              'Transformar o tropeço em rolagem feia — literal ou moral — e fugir do espelho por um segundo de assimetria.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
            effects: { playerHpLossPercent: 10, enemyHpDelta: -3 },
          },
        ],
      },


      linger_steady: {
        line:
          'O olhar “morto” ficou seu o suficiente para o corredor o reconhecer. Falta só fechar sem pose — uma linha humana, não um monumento — antes de o bronze voltar pedindo espetáculo.',
        choices: [
          {
            text:
              'Assentir por dentro e seguir: nada de frase final para o espelho roubar.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
          },
          {
            text:
              'Permitir a você um som ridículo e real — rangido, expiração — para o metal não ficar com a banda sonora.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
          },
          {
            text:
              'Medir o próximo passo como quem mede temperatura: devagar, sem desafio de palco.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
          },
        ],
      },
      linger_irony: {
        line:
          'O absurdo já fez o trabalho; agora o corredor pede uma saída sem segunda peça. O reflexo ainda tenta copiar seu timing — e chega atrasado.',
        choices: [
          {
            text:
              'Calar no meio do riso — deixar o metal sem eco para vestir.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
          },
          {
            text:
              'Trocar duas palavras feias com o chão, não com o bronze — mundano de propósito.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
          },
          {
            text:
              'Virar o ombro meio segundo: tempo suficiente para o mito perder fôlego.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
          },
        ],
      },
      linger_shoulder: {
        line:
          'A fresta abriu por teimosia honesta. O espelho ainda quer transformar empurrão em discurso — e você ainda respira, o que já é conversa suficiente.',
        choices: [
          {
            text:
              'Passar sem discurso de vitória — só ocupação de espaço que o reflexo não consegue copiar de relance.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
          },
          {
            text:
              'Deixar o corpo lembrar ao corredor que pedra vem antes de lenda.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
          },
          {
            text:
              'Recusar celebrar: fechar a fresta com silêncio de oficina, não de palco.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
          },
        ],
      },
      linger_fatigue: {
        line:
          'O cansaço ficou com você como testemunha chata e leal. O bronze insiste em ler isso como derrota; o corredor, porém, só quer saber como sai sem emprestar-lhe narrativa.',
        choices: [
          {
            text:
              'Levar o cansaço como resposta — sem explicar, sem pedir desculpa ao espelho.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
          },
          {
            text:
              'Respirar alto o suficiente para o som ser seu, não réplica.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
          },
          {
            text:
              'Seguir como quem fecha porta: mão na madeira, olhos no limiar, nada de pose.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_release' },
          },
        ],
      },
      linger_winter: {
        line:
          'Na borda, o bronze aperta ainda por hábito — não por necessidade. O corredor deixa rangido na pedra como lembrete: sair também é língua, não só perna.',
        choices: [
          {
            text:
              'Levar o corte moral como peso aceite — sem pedir aplauso ao espelho.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
          },
          {
            text:
              'Fechar a garganta em faca muda — silêncio que não empresta guião ao metal.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
          },
          {
            text:
              'Empurrar até o fim e aceitar o custo — colisão contada em carne, não em pose.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
          },
        ],
      },
      linger_burn: {
        line:
          'O calor verbal deixa cinza no peito. O reflexo ainda tenta brilhar — mas o corredor já escolheu seu lado com rangido e frio na pedra.',
        choices: [
          {
            text:
              'Ancorar no corpo o suficiente para o fogo não virar monólogo.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
          },
          {
            text:
              'Sair da pira com queimadura assumida — caro, seu, sem segunda peça.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
          },
          {
            text:
              'Recusar o epílogo heroico: fechar em oficina, não em lenda.',
            resolution: { kind: 'fixed', nextNodeId: 'gate_toll' },
          },
        ],
      },
      gate_release: {
        line:
          'O limiar cede sem fanfarra: armistício feio, verdade pequena ou silêncio que não pede aplausos. O bronze ainda mexe os lábios — tarde. Falta só escolhe como atravessa sem lhe dar o último verso.',
        choices: [
          {
            text:
              'Atravessar como água parada — frio no peito, passseu, réplica atrasada.',
            resolution: { kind: 'fixed', nextNodeId: 'v_win_release' },
          },
          {
            text:
              'Levar com você um fato de cozinha, ridículo o bastante para não caber no mito.',
            resolution: { kind: 'fixed', nextNodeId: 'v_win_release' },
          },
          {
            text:
              'Sair no anti-clímax — sem pedestal, sem segunda peça para o metal roubar.',
            resolution: { kind: 'fixed', nextNodeId: 'v_win_release' },
          },
        ],
      },
      gate_toll: {
        line:
          'A vitória definitiva cheira a metal quente e pele: corpo, empurrão ou preço pago até à vergonha. O reflexo cala porque finalmente não precisa lhe dever performance — só precisa atravessar sem lhe dar o epílogo.',
        choices: [
          {
            text:
              'Pagar o custo em silêncio e seguir inteiro o suficiente — sem negociar com o reflexo.',
            resolution: { kind: 'fixed', nextNodeId: 'v_win_toll' },
          },
          {
            text:
              'Levar o hematoma moral como mapa, não como prisão — e ocupar o corredor na mesma.',
            resolution: { kind: 'fixed', nextNodeId: 'v_win_toll' },
          },
          {
            text:
              'Fechar em choque honesto: ombro, chão, fogo engolido — limite onde antes só havia cópia.',
            resolution: { kind: 'fixed', nextNodeId: 'v_win_toll' },
          },
        ],
      },
      v_win_release: {
        line:
          'O corredor deixa de exigir réplica: vitória de detalhe, de silêncio útil ou de mundo liso demais para o espelho mentir alto. O bronze fica com eco atrasado; você segues com a palavra sua — feia, inteira, sua.',
        terminal: 'victory',
      },
      v_win_toll: {
        line:
          'Vitória paga em corpo e nervo: empurrão, limite físico ou sangue de palavra. Ainda assim o espelho ficou sem seu último verso — escreveu você, com custo que não negas e fronteira que ele aprende a respeitar.',
        terminal: 'victory',
      },
    },
  },
};
