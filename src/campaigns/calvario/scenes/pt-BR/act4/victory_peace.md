---
id: act4/victory_peace
title: Vitória em Silêncio
chapter: 4
ambientTheme: act4_peace
artKey: victory_peace
choices:
  - text: "Recolher o que resta — ouvir o trono"
    next: act4/passage_graywind_heights
onEnter:
  - { op: addMark, mark: morvayn_slain }
  - { op: setStoryPath, id: throne, value: slain }
---
O **estalo** sob a coroa soa a fecho, não a coroação — porta que cede quando do outro lado já não há quem empurre. O pulso verde derrete no silêncio; o trono, um instante mobília, depois pedra de novo.
