---
id: shared/game_over
title: Fim de Jornada
chapter: 4
ambientTheme: explore
artKey: game_over
highlight: true
choices:
  - text: "Loja de Ecos"
    effects:
      - { op: openEchoShop }
  - text: "Recomeçar"
    effects:
      - { op: resetRun }
onEnter:
  - { op: clearAsciiMap }
  - { op: settleRun, outcome: defeat }
---
Algo em você cede sem estrondo. A **Masmorra do Silêncio** abre e fecha como ferida; seu nome vira sussurro na umidade.

O silêncio anotou o que você alcançou. Os **Ecos** guardam esse peso entre runs — você pode investí-los ou recomeçar.
