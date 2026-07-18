---
id: shared/explore_nav_act8
title: Veias de lava
chapter: 8
type: exploration
ambientTheme: act8
choices:
  - id: explore_patrol_random
    text: "Vagar pelas pontes negras (encontro aleatório)"
    uiSection: "No perímetro"
    preview: "Sem mover no mapa — o calor escolhe o próximo passo."
    effects:
      - op: startWildEncounterFromGraph
        graphId: act8_magma
  - id: explore_leave
    text: "Recuar para o Crisol de Magma"
    next: act8/hub_magma_crucible
    uiSection: "No perímetro"
    effects:
      - { op: clearAsciiMap }
    preview: "Sair do perímetro e manter o stress atual."
onEnter: []
---
As veias de lava **pulsa** sob a pedra. Caminhar aqui é escolher qual rachadura vai cobrar primeiro.
