---
id: act8/encounters/wild_ember_hound
title: Cão de brasas
chapter: 8
ambientTheme: act8
choices:
  - text: "Enfrentar o cão de brasas"
    effects:
      - op: startCombat
        encounterId: act8_wild_ember_hound
        onVictory: shared/explore_nav_act8
        onDefeat: shared/game_over
        onFlee: shared/explore_nav_act8
onEnter: []
---
Um cão de **brasas** late sem som — só chispas. Os olhos são carvão vivo.
