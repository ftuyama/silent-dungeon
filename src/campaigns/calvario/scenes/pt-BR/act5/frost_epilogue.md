---
id: act5/frost_epilogue
title: Epílogo de Geada
chapter: 5
ambientTheme: act5
artKey: frost_epilogue
choices:
  - text: "Seguir o eco sob o gelo — atravessar o Umbral do Vazio"
    next: act6/opening_void_threshold
    effects:
      - { op: setChapter, chapter: 6 }
onEnter:
  - { op: registerEnding, endingId: frost_epilogue }
  - { op: grantItem, itemId: frost_wyrm_scale }
  - { op: addMark, mark: vetrnax_slain }
  - { op: addDiary, text: "Vetrnax caiu. O gelo partiu-se como vidro — e por baixo, por um instante, ouvi o Terceiro Sino a aprender um nome novo." }
---
**Vetrnax** vira cascata; o vento deixa de morder. Na mão, uma **escama** que queima a frio — troféu que gosta de virar culpa.
