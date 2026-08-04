---
id: act6/encounters/mirror_boss_resolve
title: Costura da Sombra
chapter: 6
ambientTheme: void
artKey: act6_mirror_final_resolved
highlight: true
artHighlightSfx: mysterious
choices:
  - text: "Aceitar a fissura e seguir"
    next: act6/epilogue
onEnter:
  - { op: addMark, mark: act6_shadow_faced }
  - { op: addDiary, text: "Não destruí minha sombra. Dei a ela um nome e um limite." }
---
O reflexo se desfaz em fios negros. Eles não atacam — buscam abrigo no contorno do seu corpo. Não há triunfo limpo.
