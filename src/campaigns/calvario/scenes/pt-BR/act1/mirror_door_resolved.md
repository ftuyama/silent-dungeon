---
id: act1/mirror_door_resolved
title: Bronze nos batentes
chapter: 1
ambientTheme: explore
choices:
  - text: "Desviar o olhar e voltar aos batentes"
    next: act1/dungeon_door
    preview: "Reflexo domado; runas à espera."
onEnter:
  - { op: setFlag, key: act1_mirror_dialogue_done, value: true }
  - { op: addDiary, text: "No bronze dos batentes, o reflexo cedeu — mas ainda me reconhece de lado." }
---
O **bronze** fica opaco outra vez. Por um instante ainda sente o olhar **defasado** — como se guardasse o seu nome para mais tarde.
