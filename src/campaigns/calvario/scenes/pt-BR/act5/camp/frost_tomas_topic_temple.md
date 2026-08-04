---
id: act5/camp/frost_tomas_topic_temple
title: Templo no gelo
chapter: 5
ambientTheme: camp
choices:
  - text: "Voltar ao calor do acampamento"
    next: act5/camp/frost_tomas_fireside
    effects:
      - { op: addDiary, text: "Tomás falou do cume como de uma linha — dever, não glória. O escudo dele ainda faz sombra maior do que ele admite." }
      - { op: adjustCompanionFriendship, companionId: squire_tomas, delta: 2, onceFlag: ff_cf_act5_frost_tomas_topic_temple }
onEnter: []
---
> *"Pedra negra não é moral. É **peso**.
