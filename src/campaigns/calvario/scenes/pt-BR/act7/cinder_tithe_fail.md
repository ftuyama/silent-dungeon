---
id: act7/cinder_tithe_fail
title: Cinza que morde
chapter: 7
ambientTheme: ash_sky
artKey: cinder_heap
choices:
  - text: "Sair do monte com as mãos a arder e a boca fechada"
    next: act7/before_final_horizon
onEnter:
  - { op: addMark, mark: act7_cinder_burned }
  - { op: addResource, resource: supply, delta: -1 }
  - { op: addResource, resource: corruption, delta: 1 }
  - { op: addDiary, text: "A cinza estava viva — ou eu é que estava morto o suficiente para confundir. Perdi tempo e pele no mesmo lugar." }
---
A pilha acende sem chama: calor que rouba suor. Quando você recua, traz **corrupção** na garganta — resíduo de ter tocado o que não era seu.
