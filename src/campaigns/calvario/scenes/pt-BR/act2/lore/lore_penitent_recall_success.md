---
id: act2/lore/lore_penitent_recall_success
title: Confissão que fica
chapter: 2
ambientTheme: act2
choices:
  - text: "Voltar ao cruzeiro"
    next: act2/hub_catacomb
onEnter:
  - { op: setFlag, key: act2_lore_penitent_recall_done, value: true }
  - { op: addResource, resource: faith, delta: 1 }
  - { op: addXp, amount: 10 }
  - { op: addDiary, text: "Cada pedra aqui confessa melhor do que eu." }
---
A lembrança **assenta**. Não como vitória — como verdade que você aguenta sem mentir para si mesmo.
