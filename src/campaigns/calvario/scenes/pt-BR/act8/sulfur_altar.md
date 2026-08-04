---
id: act8/sulfur_altar
title: Altar de Enxofre
chapter: 8
ambientTheme: act8
artKey: sulfur_altar
choices:
  - text: "Oferecer fé ao altar (−1 fé)"
    next: act8/sulfur_altar_after
    condition: { resource: { faith: { gte: 1 } } }
    showWhenLocked: true
    lockedHint: "O altar cobra fé — precisas de pelo menos 1."
    effects:
      - { op: addResource, resource: faith, delta: -1 }
      - { op: addResource, resource: corruption, delta: -1 }
    preview: "−1 fé · o altar limpa um fio de corrupção"
  - text: "Desafiar o guardião espectral"
    next: act8/encounters/sulfur_wraith_fight
    preview: "Combate; o altar abre na violência."
  - text: "Voltar ao Crisol"
    next: act8/hub_magma_crucible
onEnter: []
---
O altar cheira a ovo podre e a juramento. Amarelo doentio cobre a pedra.
