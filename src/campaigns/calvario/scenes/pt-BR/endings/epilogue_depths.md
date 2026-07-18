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
A pedra desce. Você não fechou a masmorra — mudou de estrato. Aqui o silêncio pesa como teto mais baixo; o ar chega velho aos pulmões.

A vitória gravou mais **Ecos** no legado. Invista-os na loja ou recomece quando o abismo chamar.
