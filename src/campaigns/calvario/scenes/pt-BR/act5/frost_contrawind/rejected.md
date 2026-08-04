---
id: act5/frost_contrawind/rejected
title: O Grimório Fechado
chapter: 5
ambientTheme: act5
artKey: frost_contrawind_edras
choices:
  - text: "Desafiar Edras dentro do círculo (combate difícil)"
    next: act5/frost_contrawind/duel
    visibleWhen: { noFlag: contrawind_merchant_unlocked }
    preview: "O escudo de contravento aguenta magia, aço e a recusa de um homem que não quer matar."
  - text: "Deixar Edras e voltar ao desfiladeiro"
    next: act5/frost_hub
onEnter:
  - { op: setFlag, key: contrawind_parley_failed, value: true }
  - { op: addDiary, text: "Edras recusou-se a abrir o grimório. A medida foi feita uma vez; a capela permanece aberta, mas a resposta dele não." }
---
Edras recolhe as três linhas com a sola da bota. O círculo deixa o vento entrar, e as páginas do grimório se fecham antes que você leia uma só fórmula.
