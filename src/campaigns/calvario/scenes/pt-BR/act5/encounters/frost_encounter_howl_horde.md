---
id: act5/encounters/frost_encounter_howl_horde
title: Uivo da tempestade
chapter: 5
ambientTheme: act5
choices:
  - text: "Segurar a linha contra a horda"
    effects:
      - op: startCombat
        encounterId: frost_howl_horde
        onVictory: shared/explore_nav_act5
        onDefeat: shared/game_over
        onFlee: shared/explore_nav_act5
onEnter: []
---
Quando o vento **vira**, você vê quatro formas: três crias e um **saqueador da geada** abrindo caminho como machado vivo. O uivo vem do metal e do osso juntos.
