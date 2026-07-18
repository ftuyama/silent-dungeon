---
id: act2/faction/culto_bell_alcove
title: Alcove do Terceiro Sino
chapter: 2
ambientTheme: act2
choices:
  - text: "Ajoelhar e deixar o sino nomear o próximo passo"
    next: act2/hub_catacomb
    preview: "Fé e corrupção · topologia do Culto (uma vez)."
    effects:
      - { op: setFlag, key: act2_culto_bell_alcove_done, value: true }
      - { op: addResource, resource: faith, delta: 1 }
      - { op: addResource, resource: corruption, delta: 1 }
      - { op: addXp, amount: 15 }
      - { op: addDiary, text: "No alcove do sino, o silêncio pagou em fé e em sombra — o culto abre portas a quem já confessou." }
  - text: "Virar as costas ao alcove"
    next: act2/hub_catacomb
    preview: "Recusa sem combate — o caminho some."
    effects:
      - { op: setFlag, key: act2_culto_bell_alcove_done, value: true }
      - { op: addDiary, text: "Não ajoelhei. O Terceiro Sino vibrou uma vez — e calou-se." }
onEnter: []
---
Uma **alcove** onde o badalo não existe, mas o ar **vibra**. O enviado do culto falou desta dobra; o cruzeiro comum **mente** sobre ela.
