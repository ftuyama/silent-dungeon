---
id: act5/encounters/frost_whelp_pack
title: Ninho das Crias Gélidas
chapter: 5
ambientTheme: act5
choices:
  - text: "Lutar contra as crias de geada"
    effects:
      - op: startCombat
        encounterId: frost_whelps
        onVictory: act5/frost_lair_approach
        onDefeat: shared/game_over
onEnter: []
---
Duas **crias** rodeiam você com fome de calor vivo. Os olhos delas são buracos onde o luar congelou — e onde seu reflexo hesita um segundo a mais.

Sem saída limpa: aço ou queda.
