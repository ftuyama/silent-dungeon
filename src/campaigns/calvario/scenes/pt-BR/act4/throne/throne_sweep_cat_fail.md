---
id: act4/throne/throne_sweep_cat_fail
title: Contagem que foge
chapter: 4
ambientTheme: act4
artKey: throne_sweep
choices:
  - text: "Continuar a varredura no salão"
    next: act4/throne/throne_sweep
  - text: "À segunda fase — trono!"
    next: act4/encounters/fight_morvayn_2
onEnter:
  - { op: addResource, resource: corruption, delta: 1 }
  - { op: addDiary, text: "Perdi a conta; o trono acrescentou uma linha ao meu medo." }
---
O osso **multiplica** quando você não olha. Não é truque — é lição cruel.
