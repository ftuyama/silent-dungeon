---
id: act6/epilogue
title: Epílogo do Espelho Quebrado
chapter: 6
ambientTheme: void
artKey: act6_epilogue_crossing
highlight: true
choices:
  - text: "[↑] Levantar os olhos — o céu já não pede desculpa"
    next: act7/opening_terminal_glow
    effects:
      - { op: setChapter, chapter: 7 }
  - text: "Fechar o diário por agora"
    next: endings/epilogue_depths
onEnter:
  - { op: registerEnding, endingId: epilogue_mirror }
  - { op: addResource, resource: faith, delta: 1 }
---
Você leva a nave fraturada nos olhos — um **caco** de espelho que ainda corta a palma.

Ruas viram hipótese. O **pulso verde** no horizonte não mudou; mudou o jeito de contá-lo. Um passo de cada vez.
