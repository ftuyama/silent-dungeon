---
id: act8/magma_merchant
chapter: 8
ambientTheme: merchant
artKey: magma_merchant
title: Banca de brasas
choices:
  - text: "Comprar Poção Rubra (6 ouro) (x2)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act8/magma_merchant
    visibleWhen: { noFlag: act8_merch_hp_1 }
    condition: { resource: { gold: { gte: 6 } } }
    showWhenLocked: true
    lockedHint: "Requer 6 ouro."
    preview: "Consumível · cura"
    effects:
      - { op: addResource, resource: gold, delta: -6 }
      - { op: grantItem, itemId: potion_hp }
      - { op: setFlag, key: act8_merch_hp_1, value: true }
  - text: "Comprar Poção Rubra (6 ouro) (x1)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act8/magma_merchant
    visibleWhen: { noFlag: act8_merch_hp_2 }
    condition:
      all:
        - { resource: { gold: { gte: 6 } } }
        - { flag: act8_merch_hp_1 }
    showWhenLocked: true
    lockedHint: "Requer 6 ouro e a primeira compra feita."
    preview: "Consumível · cura"
    effects:
      - { op: addResource, resource: gold, delta: -6 }
      - { op: grantItem, itemId: potion_hp }
      - { op: setFlag, key: act8_merch_hp_2, value: true }
  - text: "Comprar Tônico Azul (8 ouro) (x1)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act8/magma_merchant
    visibleWhen: { noFlag: act8_merch_mana_1 }
    condition: { resource: { gold: { gte: 8 } } }
    showWhenLocked: true
    lockedHint: "Requer 8 ouro."
    preview: "Consumível · mana"
    effects:
      - { op: addResource, resource: gold, delta: -8 }
      - { op: grantItem, itemId: potion_mana }
      - { op: setFlag, key: act8_merch_mana_1, value: true }
  - text: "Comprar Hidromel (7 ouro) (x1)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act8/magma_merchant
    visibleWhen: { noFlag: act8_merch_stress_1 }
    condition: { resource: { gold: { gte: 7 } } }
    showWhenLocked: true
    lockedHint: "Requer 7 ouro."
    preview: "Consumível · reduz stress"
    effects:
      - { op: addResource, resource: gold, delta: -7 }
      - { op: grantItem, itemId: potion_stress }
      - { op: setFlag, key: act8_merch_stress_1, value: true }
  - text: "Comprar Suprimento (6 ouro) (x2)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act8/magma_merchant
    visibleWhen: { noFlag: act8_merch_supply_1 }
    condition: { resource: { gold: { gte: 6 } } }
    showWhenLocked: true
    lockedHint: "Requer 6 ouro."
    preview: "Recurso · descanso"
    effects:
      - { op: addResource, resource: gold, delta: -6 }
      - { op: addResource, resource: supply, delta: 1 }
      - { op: setFlag, key: act8_merch_supply_1, value: true }
  - text: "Comprar Suprimento (6 ouro) (x1)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act8/magma_merchant
    visibleWhen: { noFlag: act8_merch_supply_2 }
    condition:
      all:
        - { resource: { gold: { gte: 6 } } }
        - { flag: act8_merch_supply_1 }
    showWhenLocked: true
    lockedHint: "Requer 6 ouro e a primeira compra feita."
    preview: "Recurso · descanso"
    effects:
      - { op: addResource, resource: gold, delta: -6 }
      - { op: addResource, resource: supply, delta: 1 }
      - { op: setFlag, key: act8_merch_supply_2, value: true }
  - text: "Comprar Anel de Brasa (−10 ouro)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act8/magma_merchant
    visibleWhen:
      all:
        - { noItem: ember_ring }
        - { noFlag: act8_merch_ember_ring }
    condition: { resource: { gold: { gte: 10 } } }
    showWhenLocked: true
    lockedHint: "Requer 10 ouro."
    preview: "Relíquia · sorte"
    effects:
      - { op: addResource, resource: gold, delta: -10 }
      - { op: grantItem, itemId: ember_ring }
      - { op: setFlag, key: act8_merch_ember_ring, value: true }
  - text: "Voltar ao Crisol"
    uiSection: "Sair"
    uiSectionIcon: leave
    next: act8/hub_magma_crucible
    preview: "Levar o que restou do ouro — e o cheiro de brasa."
onEnter: []
---
Um mercador de **pele gretada** abre uma banca sobre pedra ainda quente. Não sorri. Cobra em **ouro** o que o calor cobraria em carne.
