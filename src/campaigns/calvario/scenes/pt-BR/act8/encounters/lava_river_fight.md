---
id: act8/encounters/lava_river_fight
title: Guarda do rio
chapter: 8
ambientTheme: act8
choices:
  - text: "Enfrentar os golems de lava"
    effects:
      - op: startCombat
        encounterId: act8_lava_golem_pair
        onVictory: act8/lava_river_after
        onDefeat: shared/game_over
        onFlee: act8/lava_river
onEnter: []
---
Dois golems de lava **erguem-se** da margem. O calor deles não é ambiente — é **intenção**.
