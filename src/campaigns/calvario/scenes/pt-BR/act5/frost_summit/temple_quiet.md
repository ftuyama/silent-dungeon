---
id: act5/frost_summit/temple_quiet
title: Silêncio de pedra
chapter: 5
ambientTheme: frost_mystery
artKey: frost_summit_temple
choices:
  - text: "Voltar ao umbral"
    next: act5/frost_summit/temple_gate
onEnter:
  - { op: setFlag, key: frost_summit_quiet_done, value: true }
  - { op: addDiary, text: "No templo, o silêncio não consola — pesa." }
---
Entre **pilares**, a neve cai reta e lenta. Não há música; só pedra fria e o som da sua respiração.
