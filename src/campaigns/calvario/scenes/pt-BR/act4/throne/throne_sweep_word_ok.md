---
id: act4/throne/throne_sweep_word_ok
title: Eco subtraído
chapter: 4
ambientTheme: act4
artKey: throne_sweep
choices:
  - text: "Continuar a varredura no salão"
    next: act4/throne/throne_sweep
  - text: "À segunda fase — trono!"
    next: act4/encounters/fight_morvayn_2
onEnter:
  - { op: addXp, amount: 10 }
  - { op: addResource, resource: gold, delta: 2 }
  - { op: addDiary, text: "A sílaba caiu limpa — o vácuo aceitou o pagamento." }
---
Por um instante o salão **esquece** você. É o bastante: não ser matéria do trono.
