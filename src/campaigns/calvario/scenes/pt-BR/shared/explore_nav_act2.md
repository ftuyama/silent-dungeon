---
id: shared/explore_nav_act2
title: Perímetro dos túneis
chapter: 2
type: exploration
ambientTheme: explore
choices:
  - id: explore_patrol_random
    text: "Patrulhar ao acaso (encontro aleatório)"
    uiSection: "No perímetro"
    preview: "Sem mover no mapa — os túneis escolhem por você."
    effects:
      - op: startWildEncounterFromGraph
        graphId: act2_catacomb
  - id: explore_leave
    text: "Retornar ao hub do cruzeiro"
    next: act2/hub_catacomb
    uiSection: "No perímetro"
    effects:
      - { op: clearAsciiMap }
    preview: "Recuar, erguer abrigo e manter o stress atual."
onEnter: []
---
O **silêncio** aqui não é falta de som — é peso da pedra. Cada passo pergunta se você volta ao fogo da Vigília ou fica com o eco.

Com o **mapa rasgado**, você vê onde o corredor mente menos; sem ele, só restam pele e pressa.
