---
id: act6/encounters/void_encounter_veil
title: Escrivão entre espelhos mortos
chapter: 6
ambientTheme: void
choices:
  - text: "Responder ao escrivão antes que costure o céu à sua garganta"
    effects:
      - op: startCombat
        encounterId: act6_wild_scribe_solo
        onVictory: shared/explore_nav_act6
        onDefeat: shared/game_over
        onFlee: shared/explore_nav_act6
onEnter: []
---
Uma figura alta atravessa a penumbra. Não há sangue — há certeza escorrendo dos cantos do véu; tinta onde deveria haver pele.
