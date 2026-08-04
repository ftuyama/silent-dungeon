---
id: act6/reality_after
title: Cicatriz do Real
chapter: 6
ambientTheme: void
artKey: fractured_nave
choices:
  - text: "Deixar o coro responder e voltar à esplanada"
    next: act6/litany_after_reality
onEnter:
  - { op: setFlag, key: act6_reality_done, value: true }
  - { op: addDiary, text: "A verdade não me libertou. Só me tirou o direito de mentir para mim." }
---
A máscara do arauto racha. Atrás dela não há carne — só vazio com sua respiração.
