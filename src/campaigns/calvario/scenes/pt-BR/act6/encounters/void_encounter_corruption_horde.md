---
id: act6/encounters/void_encounter_corruption_horde
title: Ferrugem que dança
chapter: 6
ambientTheme: void
choices:
  - text: "Conter o surto — pregador da mancha e lasca atraídos pela ferida"
    effects:
      - op: startCombat
        encounterId: act6_wild_stain_horde
        onVictory: shared/explore_nav_act6
        onDefeat: shared/game_over
        onFlee: shared/explore_nav_act6
onEnter: []
---
A **corrupção** que você carrega vibra na pedra. Ela chama lascas — e um pregador que já tinha seu nome na língua.

Onde há mancha, há predador.
