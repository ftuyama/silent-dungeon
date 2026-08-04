---
id: endings/epilogue_depths
title: Profundezas do eixo
chapter: 7
ambientTheme: explore
choices:
  - text: "Loja de Ecos"
    effects:
      - { op: openEchoShop }
  - text: "Recomeçar"
    effects:
      - { op: resetRun }
onEnter:
  - { op: registerEnding, endingId: epilogue_depths }
  - { op: settleRun, outcome: victory }
---
A pedra desce. Você não fechou a masmorra — mudou de estrato.
