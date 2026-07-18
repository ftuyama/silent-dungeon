---
id: act8/camp/use_consumable
title: Poções à mão
chapter: 8
ambientTheme: camp
artKey: magma_camp
choices:
  - text: "Beber poção rubra (você)"
    uiSection: "Consumíveis"
    uiSectionIcon: consumable
    next: act8/camp/magma_camp
    condition: { hasItem: potion_hp }
    effects:
      - { op: useConsumable, itemId: potion_hp, targetIndex: 0 }
  - text: "Dar poção rubra ao companheiro"
    uiSection: "Consumíveis"
    uiSectionIcon: consumable
    next: act8/camp/magma_camp
    condition: { all: [{ hasItem: potion_hp }, { companionCount: { gte: 1 } }] }
    effects:
      - { op: useConsumable, itemId: potion_hp, targetIndex: 1 }
  - text: "Beber tônico azul (mana)"
    uiSection: "Consumíveis"
    uiSectionIcon: consumable
    next: act8/camp/magma_camp
    condition:
      all:
        - { hasItem: potion_mana }
        - { any: [{ class: mage }, { class: cleric }] }
    effects:
      - { op: useConsumable, itemId: potion_mana, targetIndex: 0 }
  - text: "Beber infusão serena (stress)"
    uiSection: "Consumíveis"
    uiSectionIcon: consumable
    next: act8/camp/magma_camp
    condition: { hasItem: potion_stress }
    effects:
      - { op: useConsumable, itemId: potion_stress, targetIndex: 0 }
  - text: "Voltar ao acampamento"
    uiSection: "Voltar"
    uiSectionIcon: leave
    next: act8/camp/magma_camp
onEnter: []
---
O calor ameaça o vidro. Cada gole é escolha entre o fogo lá fora e o que ainda resta no inventário.
