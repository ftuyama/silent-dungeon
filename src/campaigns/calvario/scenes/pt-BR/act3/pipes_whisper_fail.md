---
id: act3/pipes_whisper_fail
title: Tubo que morde
chapter: 3
ambientTheme: act3
choices:
  - text: "Arrancar a mão e recuar"
    next: act3/hub_depths
onEnter:
  - { op: setFlag, key: act3_pipes_done, value: true }
  - { op: addResource, resource: supply, delta: -1 }
  - { op: addDiary, text: "O cano estava quente demais — queimei tempo e suprimento a ouvir lixo." }
---
A condensação escorre como ácido; tosse sobe do cano e a pedra morde a luva. Você perde fôlego e um **pacote** — o subsolo cobra curiosidade.
