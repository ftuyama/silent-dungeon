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
Algo em você **cede** sem estrondo — vazio que não deixa eco. A **Masmorra do Silêncio** **abre** e **fecha** como ferida; seu nome vira sussurro na humidade.

O **silêncio** anotou o que alcançaste. Os **Ecos** preservam esse peso entre runs — podes **investi-los** ou **recomeçar** quando quiseres.
