---
id: act4/throne/throne_sweep_cat_ok
title: Mapa de osso
chapter: 4
ambientTheme: act4
artKey: throne_sweep
choices:
  - text: "Continuar a varredura no salão"
    next: act4/throne/throne_sweep
  - text: "À segunda fase — trono!"
    next: act4/encounters/fight_morvayn_2
    effects:
      - { op: grantTemporaryBuff, attr: agi, delta: 1, remainingScenes: 2 }
onEnter:
  - { op: addXp, amount: 10 }
  - { op: addDiary, text: "Contei até o salão ficar pequeno. Espaço mente quando você sabe onde pisa." }
---
O número **fecha** um círculo: você deixa de ser visitante e vira medida dentro da sala.
