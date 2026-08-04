---
id: act6/camp/void_tomas_topic_faith
title: Fé no vazio
chapter: 6
ambientTheme: void
artKey: fractured_nave
choices:
  - text: "Deixar a oração ficar incompleta — e voltar"
    next: act6/camp/void_tomas_fireside
    effects:
      - { op: adjustCompanionFriendship, companionId: squire_tomas, delta: 2, onceFlag: ff_cf_act6_void_tomas_topic_faith }
onEnter: []
---
> *"A fé não muda de som — muda de **eco**. Se Deus calar, eu continuo a levantar o **escudo**."
