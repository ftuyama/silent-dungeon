---
id: act6/memory_after
title: Lastro de Memória
chapter: 6
ambientTheme: void
artKey: memory_after_well
choices:
  - text: "Subir de volta à nave fraturada"
    next: act6/litany_after_memory
onEnter:
  - { op: setFlag, key: act6_memory_done, value: true }
  - { op: addDiary, text: "As minhas memórias não são arquivo. São campo de batalha." }
---
O coro se desfaz em gotas de tinta escura que sobem em vez de cair. Cada gota traz um rosto que você amou e não salvou.

O poço cala quando você diz o próprio nome sem título.
