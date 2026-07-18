---
id: act2/encounters/wild_encounter_lone_swarm_rare
chapter: 2
ambientTheme: act2
title: Ninho rompido
choices:
  - text: "Pisotear o enxame isolado"
    effects:
      - op: startCombat
        encounterId: act2_rare_lone_swarm
        onVictory: shared/explore_nav_act2
        onDefeat: shared/game_over
        onFlee: shared/explore_nav_act2
onEnter: []
---
Debaixo das tábuas soltas, um **enxame** sem toca corre em círculos — ferido, furioso, fedendo a ninho. A fome ainda morde.
