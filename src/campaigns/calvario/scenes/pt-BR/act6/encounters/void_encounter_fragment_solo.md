---
id: act6/encounters/void_encounter_fragment_solo
title: Decisão que ficou
chapter: 6
ambientTheme: void
choices:
  - text: "Enfrentar a lasca errante entre as colunas"
    effects:
      - op: startCombat
        encounterId: act6_wild_fragment_solo
        onVictory: shared/explore_nav_act6
        onDefeat: shared/game_over
        onFlee: shared/explore_nav_act6
onEnter: []
---
Do chão sobe uma silhueta sem rosto estável. Não veio de fora — escapou de você há anos e aprendeu a andar sozinha.

Não pede perdão. Pede continuidade.
