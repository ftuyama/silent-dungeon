---
id: act2/rats_choice
chapter: 2
ambientTheme: act2
artKey: rats
title: Chiar no escuro
choices:
  - text: "[%] Enfrentar o enxame"
    next: act2/encounters/rats_combat_intro
    preview: "Combate: roedores famintos."
  - text: "Ouvir o som antes de avançar"
    next: act2/rats_listen
    preview: "Intel; buff leve de AGI se lutares a seguir."
    effects:
      - { op: setFlag, key: rats_listened, value: true }
      - { op: addMark, mark: act2_rats_listen }
  - text: "Cheirar o ar: sangue ou mofo?"
    next: act2/rats_smell
    preview: "+1 stress; intel do enxame e buff leve de SOR se lutares a seguir."
    effects:
      - { op: setFlag, key: rats_smelled, value: true }
      - { op: addMark, mark: act2_rats_smell }
      - { op: adjustLeadStress, delta: 1 }
onEnter: []
---
**Chiar** alto demais para ser só vento. Olhos **rubros** no escuro movem-se em grupo — não há um roedor, há **uma decisão** com dentes.

O chão está **úmido**; pegadas humanas antigas misturam-se com patas pequenas.
