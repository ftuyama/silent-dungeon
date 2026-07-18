---
id: act8/encounters/wild_lava_golem
title: Golem de lava
chapter: 8
ambientTheme: act8
choices:
  - text: "Enfrentar o golem"
    effects:
      - op: startCombat
        encounterId: act8_wild_lava_golem
        onVictory: shared/explore_nav_act8
        onDefeat: shared/game_over
        onFlee: shared/explore_nav_act8
onEnter: []
---
Um golem de lava bloqueia a ponte. Pedra viva, fogo por sangue.
