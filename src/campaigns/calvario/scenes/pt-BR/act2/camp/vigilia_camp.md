---
id: act2/camp/vigilia_camp
title: Acampamento da Vigília
chapter: 2
ambientTheme: camp
artKey: vigilia_camp
campCombatHint: true
choices:
  - text: "Descansar no acampamento (−1 suprimento)"
    uiSection: "Recuperar"
    uiSectionIcon: rest
    next: act2/hub_catacomb
    visibleWhen:
      any:
        - { noFlag: act3_corruption_ignored }
        - { flag: act3_corruption_ignore_paid }
    condition: { resource: { supply: { gte: 1 } } }
    showWhenLocked: true
    lockedHint: "Você precisa de pelo menos 1 suprimento para pagar o descanso."
    preview: "Recupera; avança o dia."
    effects:
      - { op: campRest }
      - { op: advanceDay }
  - text: "Usar consumível"
    uiSection: "Recuperar"
    uiSectionIcon: rest
    next: act2/camp/use_consumable
    condition:
      any:
        - { hasItem: potion_hp }
        - { hasItem: potion_mana }
        - { hasItem: potion_stress }
    preview: "Escolher qual poção usar."
  - text: "Descansar — o verde ignorado cobra a conta (−1 fé)"
    uiSection: "Recuperar"
    uiSectionIcon: rest
    next: act2/hub_catacomb
    condition:
      all:
        - { resource: { supply: { gte: 1 } } }
        - { flag: act3_corruption_ignored }
        - { noFlag: act3_corruption_ignore_paid }
    preview: "O cristal que você fingiu não ver ainda lateja sob a pele."
    effects:
      - { op: campRest }
      - { op: advanceDay }
      - { op: setFlag, key: act3_corruption_ignore_paid, value: true }
      - { op: addResource, resource: faith, delta: -1 }
      - { op: addDiary, text: "Ao descansar, o pulso verde cobrou o que ignorei — a fé saiu mais fina." }
  - text: "Trocar duas palavras com o grupo"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act2/camp/camp_companion_chat
    condition: { companionCount: { gte: 1 } }
  - text: "Perguntar ao grupo há quantos dias você desceu"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act2/camp/camp_companion_chat
    condition: { all: [{ companionCount: { gte: 1 } }, { day: { gte: 4 } }] }
    preview: "Contagem em voz alta; o eco não mente."
  - text: "Sentar perto do fogo e lembrar por que desceu"
    uiSection: "Conversa"
    uiSectionIcon: talk
    visibleWhen: { noFlag: shared_world_lore_done }
    preview: "O vilarejo, o verde, o voto — uma vez."
    effects:
      - { op: setFlag, key: shared_world_lore_from_camp, value: true }
    next: shared/lore/world_wound_surface
  - text: "O oficial nota a cicatriz de cera no pulso"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act2/camp/vigilia_camp
    condition:
      all:
        - { mark: act2_brazier_scar }
        - { noFlag: act2_brazier_camp_noted }
    preview: "Braseiro rachado · respeito da Vigília (uma vez)."
    effects:
      - { op: setFlag, key: act2_brazier_camp_noted, value: true }
      - { op: addRep, faction: vigilia, delta: 1 }
      - { op: addDiary, text: "O oficial tocou a cicatriz de cera: «Quem puxa selo quente não foge do fogo — a ordem lembra.»" }
  - text: "Os sentinelas lembram o seu par de ecos"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act2/camp/vigilia_camp
    visibleWhen: { noFlag: vigilia_camp_legacy_combo_done }
    condition: { legacyUpgrade: legacy_combo_faction_companion }
    showWhenLocked: true
    lockedHint: "Legado de facção e companheiro ainda fechado."
    preview: "Legado: facção e companheiro em ressonância."
    effects:
      - { op: setFlag, key: vigilia_camp_legacy_combo_done, value: true }
      - { op: addRep, faction: vigilia, delta: 1 }
      - { op: addDiary, text: "Um oficial murmura que já o viu ao lado do par certo — o acampamento abre um fio de confiança." }
  - text: "Manusear equipamento no acampamento"
    uiSection: "Acampamento"
    uiSectionIcon: camp
    next: act2/camp/manage_equip
    preview: "Inventário e equipamento."
  - text: "Denunciar uma marca do Culto ao oficial (−1 culto)"
    uiSection: "Acampamento"
    uiSectionIcon: camp
    visibleWhen:
      all:
        - { noFlag: vigilia_camp_denounce_cult_done }
        - { level: { gte: 4 } }
    condition:
      all:
        - { rep: { faction: vigilia, gte: 1 } }
        - { rep: { faction: culto, gte: 0 } }
    showWhenLocked: true
    lockedHint: "Requer rep Vigília ≥1 e Culto ≥0."
    next: act2/camp/vigilia_camp
    effects:
      - { op: setFlag, key: vigilia_camp_denounce_cult_done, value: true }
      - { op: addRep, faction: culto, delta: -1, directGain: true }
      - { op: addRep, faction: vigilia, delta: 1 }
      - { op: addDiary, text: "Falei alto demais sobre o Terceiro Sino — o oficial anotou como vitória pequena." }
    preview: "Troca de reputação · Vigília lenta, Culto imediato (uma vez)"
  - text: "Continuar"
    uiSection: "Partir"
    uiSectionIcon: leave
    next: act2/hub_catacomb
    preview: "Avança o dia e volta ao cruzeiro."
    effects:
      - { op: advanceDay }
onEnter:
  - { op: addRep, faction: vigilia, delta: 1 }
---
Soldados da **Vigília** dividem pão seco. A honra aqui tem gosto de cinza.

*Sem sol, alguém ainda conta: **dia {{day}}**.*
