---
id: act5/frost_contrawind/rejected
title: O Grimório Fechado
chapter: 5
ambientTheme: act5
artKey: frost_contrawind_edras
choices:
  - text: "Deixar Edras e voltar ao desfiladeiro"
    next: act5/frost_hub
onEnter:
  - { op: setFlag, key: contrawind_parley_failed, value: true }
  - { op: addDiary, text: "Edras recusou-se a abrir o grimório. A medida foi feita uma vez; a capela permanece aberta, mas a resposta dele não." }
---
Edras recolhe as três linhas com a sola da bota. O círculo deixa o vento entrar, e as páginas do grimório se fecham antes que você leia uma só fórmula.

> *“Você venceu a horda. Não venceu o que faria com a lição. Não perguntarei de novo.”*

A capela continua no gelo. A conversa, não.
