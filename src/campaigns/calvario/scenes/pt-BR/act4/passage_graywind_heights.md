---
id: act4/passage_graywind_heights
title: Passagem
chapter: 4
ambientTheme: act4_peace
choices:
  - text: "Parar no limiar — armadura cinzenta que não veio do trono"
    condition:
      all:
        - { noFlag: kaelsworn_recruited }
        - { noFlag: kr_won_act4 }
    preview: "Confronto verbal com Kael (rascunho); falha leva ao ferro."
    effects:
      - op: startCombat
        encounterId: kael_rival_act4_dialogue
        onVictory: shared/kaelsworn_post_act4
        onDefeat: shared/kael_act4_blades
        onFlee: act4/passage_graywind_heights
  - text: "Partir rumo às Cimeiras do Vento Cinzento — seguir o rumor do gelo"
    uiSection: "Eixo"
    next: act5/frost_opening
    preview: "Capítulo 5. Superfície e frio — o caminho longo até ao vazio."
  - text: "Descer às profundezas de magma — o fundo do eixo"
    uiSection: "Eixo"
    next: act8/opening_magma_throat
    preview: "Capítulo 8. Calor hostil; sem o amuleto das provas do Vazio, cada cena cobra vida."
onEnter:
  - { op: registerEnding, endingId: passage_graywind_heights }
  - { op: addXp, amount: 16 }
---
{{throneOutcomeLine}}

{{factionThroneEcho}}

O trono não fechou o **eixo** — abriu uma **bifurcação**. Para cima, **Cimeiras** e gelo. Para baixo, a **garganta** de magma onde a terra ainda tem nome.

Escolhe o degrau. O silêncio cobra dos dois lados.
