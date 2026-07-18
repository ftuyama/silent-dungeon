---
id: act5/frost_tomas/encounters/fight_adv
title: Vantagem na Clareira
chapter: 5
ambientTheme: act5
choices:
  - text: "Bater antes que a lâmina acorde"
    effects:
      - op: startCombat
        encounterId: frost_tomas_rescue
        onVictory: act5/frost_tomas/rescued
        onDefeat: shared/game_over
        onFlee: act5/frost_hub
onEnter: []
---
Você chega à **clareira** em sombra — **whelp** farejando vento errado; **cultista** com faca no pescoço de **Tomás**. Tomás fecha os olhos por contagem, não por fé.
