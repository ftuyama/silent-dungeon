---
id: act6/dimensional_smith/forge
title: Oficina Dimensional
chapter: 6
ambientTheme: merchant
artKey: dimensional_smith
choices:
  - text: "Temperar Adaga de Ferro (10 ouro)"
    uiSection: "Melhoria de ferro"
    next: act6/dimensional_smith/forge
    showWhenLocked: true
    lockedHint: "Requer Adaga de Ferro e 10 ouro."
    visibleWhen: { noItem: iron_dagger_tempered }
    condition:
      all:
        - { hasItem: iron_dagger }
        - { resource: { gold: { gte: 10 } } }
    effects:
      - { op: addResource, resource: gold, delta: -10 }
      - { op: grantItem, itemId: iron_dagger_tempered }
  - text: "Reforjar Espada Enferrujada (12 ouro)"
    uiSection: "Melhoria de ferro"
    next: act6/dimensional_smith/forge
    showWhenLocked: true
    lockedHint: "Requer Espada Enferrujada e 12 ouro."
    visibleWhen: { noItem: rusty_sword_reforged }
    condition:
      all:
        - { hasItem: rusty_sword }
        - { resource: { gold: { gte: 12 } } }
    effects:
      - { op: addResource, resource: gold, delta: -12 }
      - { op: grantItem, itemId: rusty_sword_reforged }
  - text: "Forjar Armadura de Guarda Dimensional (Ferro de Fratura + Escória do Vazio)"
    uiSection: "Forja do vazio"
    next: act6/dimensional_smith/forge
    showWhenLocked: true
    lockedHint: "Requer 1 Ferro de Fratura e 1 Escória do Vazio."
    visibleWhen: { noItem: dimensional_ward_plate }
    condition:
      all:
        - { hasItem: act6_fracture_iron }
        - { hasItem: act6_void_slag }
    effects:
      - { op: removeItem, itemId: act6_fracture_iron }
      - { op: removeItem, itemId: act6_void_slag }
      - { op: grantItem, itemId: dimensional_ward_plate }
      - { op: addDiary, text: "A armadura da guarda dimensional saiu da forja como se lembrasse meu nome." }
  - text: "Sair da oficina"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act6/hub_fractured_nave
onEnter: []
---
O teto da oficina respira torto — sem fogo visível. O ferreiro não sorri; só mede sua respiração entre golpes.

*"**Ferro** vive. **Ouro** cala. Quer milagre? Traz sobra de encontro."*
