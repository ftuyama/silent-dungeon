---
id: act2/flee_skeleton
chapter: 2
ambientTheme: act2
title: Fuga — ossos a perseguir
choices:
  - text: "Voltar ao cruzeiro"
    next: act2/hub_catacomb
onEnter:
  - { op: addResource, resource: gold, delta: -1 }
  - { op: addDiary, text: "Corri de um morto que caminhava demais depressa." }
---
O esqueleto **não cansa**. Você cansa.
