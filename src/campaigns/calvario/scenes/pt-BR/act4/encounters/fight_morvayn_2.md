---
id: act4/encounters/fight_morvayn_2
title: Despertar do Trono
chapter: 4
ambientTheme: act4
choices:
  - text: "Segunda fase — trono!"
    condition: { noMark: soul_scarred_by_seal }
    effects:
      - op: startCombat
        encounterId: boss_morvayn_2
        onVictory: act4/victory_peace
        onDefeat: shared/game_over
        onFlee: act4/morvayn_interlude
  - text: "Segunda fase — trono!"
    condition: { mark: soul_scarred_by_seal }
    effects:
      - op: startCombat
        encounterId: boss_morvayn_2_disadv
        onVictory: act4/victory_peace
        onDefeat: shared/game_over
        onFlee: act4/morvayn_interlude
onEnter: []
---
O trono **desperta**. A forma dele engorda com ossos que não eram seus.
