---
id: act4/throne/throne_observe
title: O trono
chapter: 4
ambientTheme: explore
artKey: morvayn_throne
highlight: true
artHighlightSfx: mysterious
choices:
  - text: "Tentar ler um nome completo (teste de Mente)"
    next: act4/throne/throne_observe_mind
  - text: "Interceptar o gotejar das correntes (sorte)"
    next: act4/throne/throne_observe_luck
  - text: "Voltar ao momento da decisão"
    next: act4/throne/throne_gate
onEnter:
  - { op: setFlag, key: throne_acted_observe, value: true }
---
Cada osso do trono tem **um nome** raspado — não consegue ler todos. Um deles é seu **primeiro medo** em letras pequenas.

As correntes **pingam** **memória** demais densa. Se ficar demais tempo a olhar, o trono **aprende** o formato do seu medo.
