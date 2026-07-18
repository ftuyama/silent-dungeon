---
id: act5/frost_merchant
chapter: 5
ambientTheme: merchant
artKey: merchant
title: Tenda do comerciante de geada
choices:
  - text: "Comprar Poção Rubra (5 ouro) (x2)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act5/frost_merchant
    condition:
      all:
        - { resource: { gold: { gte: 5 } } }
        - { noFlag: act5_merch_hp_1 }
    effects:
      - { op: addResource, resource: gold, delta: -5 }
      - { op: grantItem, itemId: potion_hp }
      - { op: setFlag, key: act5_merch_hp_1, value: true }
  - text: "Comprar Poção Rubra (5 ouro) (x1)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act5/frost_merchant
    condition:
      all:
        - { resource: { gold: { gte: 5 } } }
        - { flag: act5_merch_hp_1 }
        - { noFlag: act5_merch_hp_2 }
    effects:
      - { op: addResource, resource: gold, delta: -5 }
      - { op: grantItem, itemId: potion_hp }
      - { op: setFlag, key: act5_merch_hp_2, value: true }
  - text: "Comprar Tônico Azul (10 ouro) (x1)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act5/frost_merchant
    condition:
      all:
        - { resource: { gold: { gte: 10 } } }
        - { noFlag: act5_merch_mana_1 }
    effects:
      - { op: addResource, resource: gold, delta: -10 }
      - { op: grantItem, itemId: potion_mana }
      - { op: setFlag, key: act5_merch_mana_1, value: true }
  - text: "Comprar Hidromel (4 ouro) (x1)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act5/frost_merchant
    condition:
      all:
        - { resource: { gold: { gte: 4 } } }
        - { noFlag: act5_merch_stress_1 }
    effects:
      - { op: addResource, resource: gold, delta: -4 }
      - { op: grantItem, itemId: potion_stress }
      - { op: setFlag, key: act5_merch_stress_1, value: true }
  - text: "Comprar Suprimento (5 ouro) (x2)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act5/frost_merchant
    condition:
      all:
        - { resource: { gold: { gte: 5 } } }
        - { noFlag: act5_merch_supply_1 }
    effects:
      - { op: addResource, resource: gold, delta: -5 }
      - { op: addResource, resource: supply, delta: 1 }
      - { op: setFlag, key: act5_merch_supply_1, value: true }
  - text: "Comprar Suprimento (5 ouro) (x1)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act5/frost_merchant
    condition:
      all:
        - { resource: { gold: { gte: 5 } } }
        - { flag: act5_merch_supply_1 }
        - { noFlag: act5_merch_supply_2 }
    effects:
      - { op: addResource, resource: gold, delta: -5 }
      - { op: addResource, resource: supply, delta: 1 }
      - { op: setFlag, key: act5_merch_supply_2, value: true }
  - text: "Comprar Suprimento (10 ouro) (x1)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act5/frost_merchant
    visibleWhen: { noFlag: act5_merch_supply_3 }
    condition:
      all:
        - { resource: { gold: { gte: 10 } } }
        - { level: { gte: 22 } }
        - { flag: act5_merch_supply_1 }
        - { flag: act5_merch_supply_2 }
    showWhenLocked: true
    lockedHint: "Requer 10 ouro, nível 22+, e estoques anteriores já comprados."
    effects:
      - { op: addResource, resource: gold, delta: -10 }
      - { op: addResource, resource: supply, delta: 1 }
      - { op: setFlag, key: act5_merch_supply_3, value: true }
  - text: "Comprar Último Suprimento (15 ouro) (x1)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act5/frost_merchant
    visibleWhen: { noFlag: act5_merch_supply_4 }
    condition:
      all:
        - { resource: { gold: { gte: 15 } } }
        - { level: { gte: 26 } }
        - { flag: act5_merch_supply_1 }
        - { flag: act5_merch_supply_2 }
        - { flag: act5_merch_supply_3 }
    showWhenLocked: true
    lockedHint: "Requer 15 ouro, nível 26+, e os três suprimentos anteriores."
    effects:
      - { op: addResource, resource: gold, delta: -15 }
      - { op: addResource, resource: supply, delta: 1 }
      - { op: setFlag, key: act5_merch_supply_4, value: true }
  - text: "Comprar Agulha de Geada (−9 ouro)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act5/frost_merchant
    visibleWhen:
      all:
        - { noItem: frost_needle }
        - { noFlag: act5_merch_frost_needle }
    condition: { resource: { gold: { gte: 9 } } }
    showWhenLocked: true
    lockedHint: "Requer 9 ouro."
    preview: "Arma · dano e agilidade"
    effects:
      - { op: addResource, resource: gold, delta: -9 }
      - { op: grantItem, itemId: frost_needle }
      - { op: setFlag, key: act5_merch_frost_needle, value: true }
  - text: "Comprar Manto de Geada (−8 ouro)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act5/frost_merchant
    visibleWhen:
      all:
        - { noItem: rime_cloak }
        - { noFlag: act5_merch_rime_cloak }
    condition: { resource: { gold: { gte: 8 } } }
    showWhenLocked: true
    lockedHint: "Requer 8 ouro."
    preview: "Armadura · leve, com mente"
    effects:
      - { op: addResource, resource: gold, delta: -8 }
      - { op: grantItem, itemId: rime_cloak }
      - { op: setFlag, key: act5_merch_rime_cloak, value: true }
  - text: "Kit de campo da Vigília (−7 ouro)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act5/frost_merchant
    condition:
      all:
        - { rep: { faction: vigilia, gte: 5 } }
        - { resource: { gold: { gte: 7 } } }
        - { resource: { supply: { lte: 7 } } }
        - { noFlag: act5_merch_vigilia_field_kit }
    effects:
      - { op: addResource, resource: gold, delta: -7 }
      - { op: addResource, resource: supply, delta: 3 }
      - { op: setFlag, key: act5_merch_vigilia_field_kit, value: true }
    preview: "Suprimento · selo da Vigília (uma vez nesta banca)"
  - text: "Afastar-me da tenda"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act5/frost_hub
onEnter: []
---
Dentro da tenda, frascos **tremem** como línguas. O mercador não mostra rosto — só **preços** que não congelam.

> Estoque **limitado**. O vento cobra juros a quem **hesita** — e juros de verdade cobra quem finge que não precisa de nada.
