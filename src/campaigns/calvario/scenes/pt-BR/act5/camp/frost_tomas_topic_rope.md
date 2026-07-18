---
id: act5/camp/frost_tomas_topic_rope
title: A marca da corda
chapter: 5
ambientTheme: camp
choices:
  - text: "Deixar o assunto fechar com o vento"
    next: act5/camp/frost_tomas_fireside
    effects:
      - { op: adjustCompanionFriendship, companionId: squire_tomas, delta: 2, onceFlag: ff_cf_act5_frost_tomas_topic_rope }
onEnter: []
---
> *"A corda lembra quando eu não quero. Se subirmos juntos, não preciso que me salve — preciso que não invente **vitória** antes da hora."*

{{companionLine}}
