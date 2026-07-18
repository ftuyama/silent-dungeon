---
id: endings/epilogue_true_depths
title: Profundezas verdadeiras
chapter: 8
ambientTheme: explore
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
A pedra **para** de descer. Fechaste o eixo no **fundo** — não no céu de cinza, não na fuga. Aqui o silêncio **pesa** como vitória quente.

A vitória **gravou** Ecos no legado. Investe-os na loja ou **recomeça** quando o abismo chamar outra vez.
