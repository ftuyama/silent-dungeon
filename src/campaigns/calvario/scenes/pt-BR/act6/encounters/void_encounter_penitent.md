---
id: act6/encounters/void_encounter_penitent
title: Penitência sem confessor
chapter: 6
ambientTheme: void
choices:
  - text: "Medir lâminas com o penitente de elos"
    effects:
      - op: startCombat
        encounterId: act6_wild_chain_solo
        onVictory: shared/explore_nav_act6
        onDefeat: shared/game_over
        onFlee: shared/explore_nav_act6
onEnter: []
---
Metal range onde não deveria haver ferreiro — só vontade temperada a frio. A armadura não protege o corpo; silencia a hesitação.
