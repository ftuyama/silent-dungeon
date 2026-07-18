---
id: act2/camp/use_consumable
title: Poções à mão
chapter: 2
ambientTheme: camp
artKey: vigilia_camp
choices:
  - text: "Beber poção rubra (você)"
    uiSection: "Consumíveis"
    uiSectionIcon: consumable
    next: act2/camp/vigilia_camp
    condition: { hasItem: potion_hp }
    effects:
      - { op: useConsumable, itemId: potion_hp, targetIndex: 0 }
  - text: "Dar poção rubra ao companheiro"
    uiSection: "Consumíveis"
    uiSectionIcon: consumable
    next: act2/camp/vigilia_camp
    condition: { all: [{ hasItem: potion_hp }, { companionCount: { gte: 1 } }] }
    effects:
      - { op: useConsumable, itemId: potion_hp, targetIndex: 1 }
  - text: "Beber tônico azul (mana)"
    uiSection: "Consumíveis"
    uiSectionIcon: consumable
    next: act2/camp/vigilia_camp
    condition:
      all:
        - { hasItem: potion_mana }
        - { any: [{ class: mage }, { class: cleric }] }
    effects:
      - { op: useConsumable, itemId: potion_mana, targetIndex: 0 }
  - text: "Beber infusão serena (stress)"
    uiSection: "Consumíveis"
    uiSectionIcon: consumable
    next: act2/camp/vigilia_camp
    condition: { hasItem: potion_stress }
    effects:
      - { op: useConsumable, itemId: potion_stress, targetIndex: 0 }
  - text: "Voltar ao acampamento"
    uiSection: "Voltar"
    uiSectionIcon: leave
    next: act2/camp/vigilia_camp
onEnter: []
---
Frascos batem no bolso. Cada rolha é uma **aposta** curta — vida, mana ou silêncio na cabeça — antes de voltar ao fogo da Vigília.
