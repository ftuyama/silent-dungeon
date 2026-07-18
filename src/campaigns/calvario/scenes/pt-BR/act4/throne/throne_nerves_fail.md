---
id: act4/throne/throne_nerves_fail
title: Tropeção
chapter: 4
ambientTheme: act4
choices:
  - text: "Aceitar o susto e voltar à ante-sala"
    next: act4/throne/throne_gate
    effects:
      - { op: addResource, resource: supply, delta: -1 }
      - { op: addDiary, text: "Tropecei onde não havia nada. O trono gosta de fingir buracos." }
onEnter: []
---
A sola **escorrega** em memória espessa. Você não cai — mas paga o susto com fôlego e suor.
