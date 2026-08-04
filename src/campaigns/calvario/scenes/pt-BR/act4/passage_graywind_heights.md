---
id: act4/passage_graywind_heights
title: Passagem
chapter: 4
ambientTheme: act4_peace
artKey: passage_graywind_heights
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
  - text: "Subir ao mundo — ver como ficou o vilarejo e as Cimeiras"
    uiSection: "Subir"
    uiSectionIcon: ascend
    next: act5/frost_opening
    effects:
      - { op: setChapter, chapter: 5 }
    preview: "Capítulo 5. Superfície e frio; conferir se algo mudou."
  - text: "Descer mais fundo — garganta de magma no fundo do eixo"
    uiSection: "Descer"
    uiSectionIcon: descend
    next: act8/opening_magma_throat
    effects:
      - { op: setChapter, chapter: 8 }
    preview: "Capítulo 8. Calor hostil; ir até a raiz."
onEnter:
  - { op: registerEnding, endingId: passage_graywind_heights }
  - { op: addXp, amount: 16 }
---
{{throneOutcomeLine}} {{factionThroneEcho}}
