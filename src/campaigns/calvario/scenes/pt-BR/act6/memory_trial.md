---
id: act6/memory_trial
title: Prova da Memória
chapter: 6
ambientTheme: void
artKey: void_well
luckCheck:
  id: act6_memory_anchor
  tn: 10
  successNext: act6/encounters/memory_trial_safe
  failNext: act6/encounters/memory_trial_bleed
choices:
  - text: "Manter um nome na lingua antes de mergulhar"
    next: act6/encounters/memory_trial_safe
    preview: "Sem âncora a tempo, o poço bebe sem pedir."
  - text: "Cair no poço sem amarras"
    next: act6/encounters/memory_trial_bleed
onEnter: []
---
No poço, você vê cenas da própria vida em camadas. Quando tenta tocar uma lembrança, outra acorda por baixo.

> *"**Recordar** é escolher o que matar."*
