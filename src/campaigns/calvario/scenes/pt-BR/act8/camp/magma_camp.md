---
id: act8/camp/magma_camp
title: Acampamento na borda
chapter: 8
ambientTheme: camp
artKey: magma_camp
campCombatHint: true
choices:
  - text: "Alimentar o fogo com suprimento (−1 suprimento)"
    uiSection: "Recuperar"
    uiSectionIcon: rest
    next: act8/hub_magma_crucible
    condition: { resource: { supply: { gte: 1 } } }
    showWhenLocked: true
    lockedHint: "Você precisa de pelo menos 1 suprimento para alimentar o fogo."
    effects:
      - { op: campRest }
      - { op: advanceDay }
  - text: "Usar consumível"
    uiSection: "Recuperar"
    uiSectionIcon: rest
    next: act8/camp/use_consumable
    condition:
      any:
        - { hasItem: potion_hp }
        - { hasItem: potion_mana }
        - { hasItem: potion_stress }
    preview: "Escolher qual poção usar."
  - text: "Equipar / gerir carga"
    uiSection: "Preparar"
    next: act8/camp/manage_equip
  - text: "Voltar ao Crisol"
    uiSection: "Sair"
    uiSectionIcon: leave
    next: act8/hub_magma_crucible
onEnter: []
---
O fogo do acampamento compete com o mar de lava. Não aquece de verdade — só lembra que ainda dá para descansar antes da cinza.
