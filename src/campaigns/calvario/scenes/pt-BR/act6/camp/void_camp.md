---
id: act6/camp/void_camp
title: Fogueira de cinzas espelhadas
chapter: 6
ambientTheme: camp
artKey: act6_camp_ember
campCombatHint: true
choices:
  - text: "Alimentar a chama com memória (−1 suprimento)"
    uiSection: "Recuperar"
    uiSectionIcon: rest
    next: act6/hub_fractured_nave
    condition: { resource: { supply: { gte: 1 } } }
    showWhenLocked: true
    lockedHint: "Precisas de pelo menos 1 suprimento para alimentar a chama."
    effects:
      - { op: campRest }
      - { op: advanceDay }
  - text: "Usar consumível"
    uiSection: "Recuperar"
    uiSectionIcon: rest
    next: act6/camp/use_consumable
    condition:
      any:
        - { hasItem: potion_hp }
        - { hasItem: potion_mana }
        - { hasItem: potion_stress }
    preview: "Escolher qual poção usar."
  - text: "Trocar duas palavras com o grupo"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act6/camp/void_companion_chat
    condition: { companionCount: { gte: 1 } }
  - text: "Ver o cinzento engolir mais um dia"
    uiSection: "Acampamento"
    uiSectionIcon: camp
    next: act6/camp/void_camp
    preview: "O dia narrativo avança; não recuperas força."
    effects:
      - { op: advanceDay }
  - text: "Manusear equipamento junto à luz instável"
    uiSection: "Acampamento"
    uiSectionIcon: camp
    next: act6/camp/manage_equip
  - text: "Voltar à nave fraturada"
    uiSection: "Partir"
    uiSectionIcon: leave
    next: act6/hub_fractured_nave
    effects:
      - { op: advanceDay }
onEnter: []
---
Não há **lenha** — só **restos** de quem já se queimou a si mesmo. A fogueira **imita** calor; seu corpo aceita a mentira porque **precisa** de um lugar onde fingir que ainda há **amanhã**.

*Mesmo aqui, o número segue: **dia {{day}}** — espelhado em cinza.*
