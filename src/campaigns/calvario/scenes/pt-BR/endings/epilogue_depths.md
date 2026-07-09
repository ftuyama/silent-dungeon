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
A pedra **desce**: não fechaste a masmorra — **mudaste** de **estrato**. Aqui o silêncio **pesa** como um tecto mais baixo; o ar é **velho** antes de chegar aos pulmões.

A vitória **gravou** mais **Ecos** no legado. Investe-os na loja ou **recomeça** quando o abismo chamar outra vez.
