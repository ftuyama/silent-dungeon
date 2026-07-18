---
id: act5/camp/frost_camp
title: Brasas sob a tempestade
chapter: 5
ambientTheme: camp
artKey: frost_camp
campCombatHint: true
choices:
  - text: "Descansar junto ao fogareiro (−1 suprimento)"
    uiSection: "Recuperar"
    uiSectionIcon: rest
    next: act5/frost_hub
    condition: { resource: { supply: { gte: 1 } } }
    showWhenLocked: true
    lockedHint: "Você precisa de pelo menos 1 suprimento para pagar o descanso."
    effects:
      - { op: campRest }
      - { op: advanceDay }
  - text: "Usar consumível"
    uiSection: "Recuperar"
    uiSectionIcon: rest
    next: act5/camp/use_consumable
    condition:
      any:
        - { hasItem: potion_hp }
        - { hasItem: potion_mana }
        - { hasItem: potion_stress }
    preview: "Escolher qual poção usar."
  - text: "Trocar duas palavras com o grupo"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act5/camp/frost_companion_chat
    condition: { companionCount: { gte: 1 } }
  - text: "Manusear equipamento no acampamento"
    uiSection: "Acampamento"
    uiSectionIcon: camp
    next: act5/camp/manage_equip
  - text: "Compartilhar uma prece com devotos do Terceiro Sino"
    uiSection: "Acampamento"
    uiSectionIcon: camp
    condition:
      all:
        - { rep: { faction: culto, gte: 2 } }
        - { noFlag: frost_camp_cult_prayer_done }
    next: act5/camp/frost_camp
    effects:
      - { op: setFlag, key: frost_camp_cult_prayer_done, value: true }
      - { op: addResource, resource: faith, delta: 1 }
      - { op: addResource, resource: corruption, delta: 1 }
      - { op: addDiary, text: "As brasas desenharam um sino invisível — ninguém tocou, mas todos ouviram." }
    preview: "+1 fé, +1 corrupção (uma vez)"
  - text: "Pedir escolta de pensamento à Vigília (contra o Culto)"
    uiSection: "Acampamento"
    uiSectionIcon: camp
    condition:
      all:
        - { rep: { faction: vigilia, gte: 2 } }
        - { rep: { faction: culto, gte: 0 } }
        - { noFlag: frost_camp_vigilia_escort_done }
    next: act5/camp/frost_camp
    effects:
      - { op: setFlag, key: frost_camp_vigilia_escort_done, value: true }
      - { op: addRep, faction: culto, delta: -1, directGain: true }
      - { op: addRep, faction: vigilia, delta: 1 }
      - { op: addDiary, text: "Um capeador desenhou uma linha na neve entre mim e o rumor do sino." }
    preview: "Culto cai; Vigília sobe (lento) (uma vez)"
  - text: "Consagrar neve derretida como água benta (clérigo)"
    uiSection: "Acampamento"
    uiSectionIcon: camp
    condition:
      all:
        - { class: cleric }
        - { resource: { supply: { gte: 1 } } }
        - { noFlag: frost_camp_cleric_rite_done }
    next: act5/camp/frost_camp
    effects:
      - { op: setFlag, key: frost_camp_cleric_rite_done, value: true }
      - { op: addResource, resource: supply, delta: -1 }
      - { op: addResource, resource: faith, delta: 2 }
      - { op: addDiary, text: "Derreti neve na lata do báculo até doer a mão — Deus ouve melhor quando a carne paga o calor." }
    preview: "−1 suprimento · +2 fé (uma vez)"
  - text: "Enterrar duas moedas no gelo para o Terceiro Sino"
    uiSection: "Acampamento"
    uiSectionIcon: camp
    condition:
      all:
        - { rep: { faction: culto, gte: 1 } }
        - { resource: { gold: { gte: 2 } } }
        - { noFlag: frost_camp_cult_ice_gift_done }
    next: act5/camp/frost_camp
    effects:
      - { op: setFlag, key: frost_camp_cult_ice_gift_done, value: true }
      - { op: addResource, resource: gold, delta: -2 }
      - { op: addRep, faction: culto, delta: 1 }
      - { op: addResource, resource: corruption, delta: 1 }
      - { op: addDiary, text: "O gelo engoliu o ouro sem som — o rumor do sino ficou mais perto, ou foi o ouvido que cedeu." }
    preview: "−2 ouro · culto +1 · +1 corrupção (uma vez)"
  - text: "Continuar"
    uiSection: "Partir"
    uiSectionIcon: leave
    next: act5/frost_hub
    effects:
      - { op: advanceDay }
onEnter:
  - { op: addRep, faction: culto, delta: 1 }
---
Peregrinos **compartilham** calor em pedaços; o fogo consome. Ninguém sobe inteiro.

*Sem calendário na tempestade: **dia {{day}}**.* Se o vento permitir, ainda dá para falar.
