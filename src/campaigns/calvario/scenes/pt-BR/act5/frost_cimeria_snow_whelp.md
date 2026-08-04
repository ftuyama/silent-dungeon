---
id: act5/frost_cimeria_snow_whelp
title: Cria na encosta
chapter: 5
ambientTheme: act5
artKey: frost_cimeria_snow
choices:
  - text: "Enfrentar a cria curiosa"
    effects:
      - op: startCombat
        encounterId: frost_whelp_solo
        onVictory: act5/frost_cimeria_snow_whelp_win
        onDefeat: shared/game_over
        onFlee: act5/frost_cimeria_snow
onEnter: []
---
Algo **balança** na neve fresca — não vento, não pedra. Uma **cria** de gelo ergue o focinho; o hálito congela antes de chegar a você.
