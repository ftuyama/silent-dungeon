---
id: act6/encounters/void_encounter_triple_fragments
title: Enxame de quedas
chapter: 6
ambientTheme: void
choices:
  - text: "Aguentar o enxame de lascas"
    effects:
      - op: startCombat
        encounterId: act6_wild_triple_fragments
        onVictory: shared/explore_nav_act6
        onDefeat: shared/game_over
        onFlee: shared/explore_nav_act6
onEnter: []
---
Três sombras sobem do mesmo vício — não cópias; versões que ganharam corpo em dias diferentes. Juntas, ocupam mais espaço do que uma cabeça aguenta.
