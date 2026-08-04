---
id: act5/frost_summit/temple_gate
title: Umbral do templo de pedra negra
chapter: 5
type: hub
ambientTheme: act5
artKey: frost_summit_temple
highlight: true
choices:
  - text: "Descer ao desfiladeiro — o corpo pede menos altitude"
    next: act5/frost_hub
  - text: "Apenas contemplar o silêncio entre os pilares"
    next: act5/frost_summit/temple_quiet
    visibleWhen: { noFlag: frost_summit_quiet_done }
  - text: "Aproximar do coração do templo — onde o silêncio pesa como laje"
    next: act5/frost_summit/ritual_altar
    visibleWhen:
      all:
        - { noFlag: frost_summit_ritual_done }
        - { noMark: title_fallen_god }
        - { noFlag: frost_summit_ritual_cursed }
    condition:
      all:
        - { resource: { corruption: { gte: 7 } } }
        - { companionCount: { gte: 1 } }
    showWhenLocked: true
    lockedHint: "Você precisa de corrupção 7 ou mais e de pelo menos um companheiro no grupo."
    preview: "Ir ao altar no fundo do templo — e perceber o que o ritual exige."
onEnter: []
---
No **cume**, o tempo não passa — acumula. Pilares partidos sustentam um teto que já não protege de nada, só testemunha. O frio tem sabor metálico.
