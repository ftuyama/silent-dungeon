---
id: act4/throne/throne_arcane_ok
title: Padrão contido
chapter: 4
ambientTheme: act4
choices:
  - text: "Guardar o mapa mental e voltar à ante-sala"
    next: act4/throne/throne_gate
    effects:
      - { op: grantTemporaryBuff, attr: mind, delta: 1, remainingScenes: 3 }
      - { op: addDiary, text: "Vi o ritmo do trono — pouco para domá-lo, o bastante para não me perder logo." }
onEnter:
  - { op: addXp, amount: 12 }
---
Por um instante o símbolo **encaixa**. Não é poder solto — é gramática. O trono deixa de ser só medo e vira frase que você pode recusar em voz alta.
