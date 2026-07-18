---
id: act1/dungeon_door
title: Batentes
chapter: 1
ambientTheme: explore
artKey: dungeon_door
highlight: true
artHighlightFrames:
  - dungeon_mouth_hl0
  - dungeon_mouth_hl1
  - dungeon_mouth_hl2
  - dungeon_mouth_hl3
  - dungeon_mouth_hl4
highlightHoldMs: 4000
choices:
  - text: "Entrar na catacumba"
    next: act2/catacomb_entry
    preview: "−1 suprimento; capítulo 2."
    effects:
      - { op: setChapter, chapter: 2 }
      - { op: addResource, resource: supply, delta: -1 }
  - text: "Inclinar-se para o brilho do bronze nos batentes — ver-te"
    next: act1/mirror_door
    preview: "Espelho nos batentes; combate possível."
  - text: "Voltar ao último corredor (narrativa)"
    next: act1/dungeon_mouth
    preview: "Braseiro, sino e a boca de pedra."
onEnter:
  - { op: addMark, mark: act1_door_runes }
---
Runas apagadas foram riscadas de novo por mãos recentes. Entre elas, um **sino** rudimentar — o Terceiro Sino, dizem.

A madeira está úmida por dentro.
