---
id: act4/throne/throne_arcane_fail
title: Letra que morde
chapter: 4
ambientTheme: act4
choices:
  - text: "Soltar o olhar e voltar à ante-sala"
    next: act4/throne/throne_gate
    effects:
      - { op: addResource, resource: corruption, delta: 1 }
      - { op: addDiary, text: "A runa mordeu o pensamento — ficou um buraco onde devia haver ordem." }
onEnter: []
---
A linha **parte** você ao meio: convite demais, não falta de inteligência. O trono ri sem som; o eco fica como azia sagrada.
