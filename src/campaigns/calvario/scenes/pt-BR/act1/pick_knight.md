---
id: act1/pick_knight
title: Juramento do Cavaleiro
chapter: 1
ambientTheme: explore
artKey: pick_knight
highlight: true
artHighlightSfx: class_knight
choices:
  - text: "Avançar para a boca da masmorra"
    next: act1/dungeon_mouth
    preview: "Classe Cavaleiro; +reputação Vigília."
    effects:
      - { op: initClass, class: knight }
      - { op: addRep, faction: vigilia, delta: 1, directGain: true }
onEnter: []
---
O metal obedece. A **Ordem da Vigília** aprova nas dobras da couraça.
