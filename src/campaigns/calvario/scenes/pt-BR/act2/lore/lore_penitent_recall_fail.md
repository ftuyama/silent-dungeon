---
id: act2/lore/lore_penitent_recall_fail
title: Eco truncado
chapter: 2
ambientTheme: act2
choices:
  - text: "Voltar ao cruzeiro"
    next: act2/hub_catacomb
onEnter:
  - { op: setFlag, key: act2_lore_penitent_recall_done, value: true }
  - { op: addDiary, text: "Tentei recordar o penitente; só me veio o frio da pedra." }
---
A voz **desfaz-se** antes de formar frase. Você fica com o peso sem o nome — como quem reza e esquece a última palavra.
