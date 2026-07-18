---
id: act2/faction/circulo_envoy_blades
title: Cinza viva — ferro
chapter: 2
ambientTheme: act2
choices:
  - text: "Rasgar o desenho antes que feche"
    effects:
      - op: startCombat
        encounterId: faction_circle_initiate
        onVictory: act2/hub_catacomb
        onFlee: act2/hub_catacomb
        onDefeat: shared/game_over
    preview: "Combate · adepto osso"
onEnter: []
---
A conversa acabou. A **cinza** morde a pele. O **Círculo** cobra na lâmina o que a voz não conseguiu.
