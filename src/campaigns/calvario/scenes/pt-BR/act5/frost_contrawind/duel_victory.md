---
id: act5/frost_contrawind/duel_victory
title: O Grimório Concedido
chapter: 5
ambientTheme: act5
artKey: frost_contrawind_edras
choices:
  - text: "Abrir o grimório de Edras"
    next: act5/frost_contrawind/merchant
    preview: "Três lições, doze moedas por página aprendida."
  - text: "Voltar ao desfiladeiro com o grimório prometido"
    next: act5/frost_hub
onEnter:
  - { op: setFlag, key: contrawind_merchant_unlocked, value: true }
  - { op: addMark, mark: contrawind_duelist }
  - { op: addDiary, text: "Edras cedeu o grimório depois de me medir pelo aço. Não sou aluno do Contravento; sou a exceção que ele aceitou cobrar em ouro." }
---
O escudo de gelo racha, Edras baixa o cajado e abre o grimório nas três fórmulas, pois a suspeita ainda existe mas já não basta para negar a concessão.
