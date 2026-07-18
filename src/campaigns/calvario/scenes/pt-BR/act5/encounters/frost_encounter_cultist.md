---
id: act5/encounters/frost_encounter_cultist
title: Estranho no gelo
chapter: 5
ambientTheme: act5
choices:
  - text: "Responder ao cultista perdido no desfiladeiro"
    effects:
      - op: startCombat
        encounterId: cultist_patrol
        onVictory: shared/explore_nav_act5
        onDefeat: shared/game_over
        onFlee: shared/explore_nav_act5
onEnter: []
---
Alguém **canta** baixo — não oração, um ritmo que não combina com o vento. Os olhos dele já venderam o céu a outro sino.

Não é duelo de ideias. É ferro no frio.
