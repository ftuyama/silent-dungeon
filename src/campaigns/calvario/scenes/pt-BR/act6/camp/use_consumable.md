---
id: act6/camp/use_consumable
title: Poções à mão
chapter: 6
ambientTheme: camp
artKey: act6_camp_ember
choices:
  - text: "Beber poção rubra (você)"
    uiSection: "Consumíveis"
    uiSectionIcon: consumable
    next: act6/camp/void_camp
    condition: { hasItem: potion_hp }
    effects:
      - { op: useConsumable, itemId: potion_hp, targetIndex: 0 }
  - text: "Dar poção rubra ao companheiro"
    uiSection: "Consumíveis"
    uiSectionIcon: consumable
    next: act6/camp/void_camp
    condition: { all: [{ hasItem: potion_hp }, { companionCount: { gte: 1 } }] }
    effects:
      - { op: useConsumable, itemId: potion_hp, targetIndex: 1 }
  - text: "Beber tônico azul (mana)"
    uiSection: "Consumíveis"
    uiSectionIcon: consumable
    next: act6/camp/void_camp
    condition:
      all:
        - { hasItem: potion_mana }
        - { any: [{ class: mage }, { class: cleric }] }
    effects:
      - { op: useConsumable, itemId: potion_mana, targetIndex: 0 }
  - text: "Beber infusão serena (stress)"
    uiSection: "Consumíveis"
    uiSectionIcon: consumable
    next: act6/camp/void_camp
    condition: { hasItem: potion_stress }
    effects:
      - { op: useConsumable, itemId: potion_stress, targetIndex: 0 }
  - text: "Voltar ao acampamento"
    uiSection: "Voltar"
    uiSectionIcon: leave
    next: act6/camp/void_camp
onEnter: []
---
À luz da fogueira, os frascos brilham. Você escolhe o que beber — vida, mana ou calma.
