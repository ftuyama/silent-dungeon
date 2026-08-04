---
id: act5/frost_contrawind/merchant
title: Lições do Contravento
chapter: 5
ambientTheme: act5
artKey: frost_contrawind_edras
choices:
  - text: "Aprender Pulso do Colosso (−12 ouro)"
    uiSection: "Lições"
    uiSectionIcon: shop
    next: act5/frost_contrawind/merchant
    visibleWhen:
      all:
        - { noFlag: contrawind_colossus_pulse_purchased }
        - { noKnownSpell: colossus_pulse }
    condition:
      all:
        - { resource: { gold: { gte: 12 } } }
        - { noFlag: contrawind_colossus_pulse_purchased }
        - { noKnownSpell: colossus_pulse }
    showWhenLocked: true
    lockedHint: "Você precisa de 12 ouro."
    preview: "Magia universal · +2 FOR até o fim do combate; não acumula."
    effects:
      - { op: addResource, resource: gold, delta: -12 }
      - { op: learnSpell, spellId: colossus_pulse }
      - { op: setFlag, key: contrawind_colossus_pulse_purchased, value: true }
  - text: "Aprender Lúmen Interior (−12 ouro)"
    uiSection: "Lições"
    uiSectionIcon: shop
    next: act5/frost_contrawind/merchant
    visibleWhen:
      all:
        - { noFlag: contrawind_inner_lumen_purchased }
        - { noKnownSpell: inner_lumen }
    condition:
      all:
        - { resource: { gold: { gte: 12 } } }
        - { noFlag: contrawind_inner_lumen_purchased }
        - { noKnownSpell: inner_lumen }
    showWhenLocked: true
    lockedHint: "Você precisa de 12 ouro."
    preview: "Magia universal · +2 MEN até o fim do combate; não acumula."
    effects:
      - { op: addResource, resource: gold, delta: -12 }
      - { op: learnSpell, spellId: inner_lumen }
      - { op: setFlag, key: contrawind_inner_lumen_purchased, value: true }
  - text: "Aprender Olho do Ápice (−12 ouro)"
    uiSection: "Lições"
    uiSectionIcon: shop
    next: act5/frost_contrawind/merchant
    visibleWhen:
      all:
        - { noFlag: contrawind_apex_eye_purchased }
        - { noKnownSpell: apex_eye }
    condition:
      all:
        - { resource: { gold: { gte: 12 } } }
        - { noFlag: contrawind_apex_eye_purchased }
        - { noKnownSpell: apex_eye }
    showWhenLocked: true
    lockedHint: "Você precisa de 12 ouro."
    preview: "Magia universal · +10% de crítico até o fim do combate; não acumula."
    effects:
      - { op: addResource, resource: gold, delta: -12 }
      - { op: learnSpell, spellId: apex_eye }
      - { op: setFlag, key: contrawind_apex_eye_purchased, value: true }
  - text: "Conversar com Edras sobre o vento que ensina"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act5/frost_contrawind/merchant
    preview: "O estoque termina. As perguntas, não."
  - text: "Fechar o grimório e voltar ao desfiladeiro"
    uiSection: "Sair"
    uiSectionIcon: leave
    next: act5/frost_hub
---
Edras mantém o grimório aberto com uma mão. Na outra, pesa cada moeda como se procurasse uma mentira gravada no metal.

> *“A lição muda uma batalha, não quem você é. Se precisar lançá-la para acreditar no contrário, guarde o ouro.”*

Três fórmulas esperam. Depois delas, Edras ainda tem palavras — **não estoque**.
