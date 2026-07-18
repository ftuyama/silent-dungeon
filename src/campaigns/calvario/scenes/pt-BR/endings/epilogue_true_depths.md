---
id: endings/epilogue_true_depths
title: Profundezas verdadeiras
chapter: 8
ambientTheme: explore
artKey: epilogue_true_depths
choices:
  - text: "Loja de Ecos"
    effects:
      - { op: openEchoShop }
  - text: "Recomeçar"
    effects:
      - { op: resetRun }
onEnter:
  - { op: registerEnding, endingId: epilogue_true_depths }
  - { op: settleRun, outcome: victory }
---
A pedra para de descer. Você fechou o eixo no **fundo** — não no céu de cinza. Aqui o silêncio pesa como vitória quente.

A vitória gravou **Ecos** no legado. Invista-os na loja ou recomece quando o abismo chamar.
