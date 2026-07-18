---
id: act8/encounters/sulfur_wraith_fight
title: Espectro de escória
chapter: 8
ambientTheme: act8
choices:
  - text: "Enfrentar o espectro"
    effects:
      - op: startCombat
        encounterId: act8_slag_wraith_solo
        onVictory: act8/sulfur_altar_after
        onDefeat: shared/game_over
        onFlee: act8/sulfur_altar
onEnter: []
---
Um espectro de **escória** ergue-se do altar — calor sem corpo, ódio sem pele.
