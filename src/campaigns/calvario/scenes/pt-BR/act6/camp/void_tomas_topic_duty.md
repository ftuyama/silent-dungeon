---
id: act6/camp/void_tomas_topic_duty
title: Dever sem chão
chapter: 6
ambientTheme: void
artKey: fractured_nave
choices:
  - text: "Voltar junto ao grupo"
    next: act6/camp/void_tomas_fireside
    effects:
      - { op: addMark, mark: tomas_void_duty }
      - { op: adjustCompanionFriendship, companionId: squire_tomas, delta: 3, onceFlag: ff_cf_act6_void_tomas_topic_duty }
onEnter: []
---
> *"Dever não precisa de solo — precisa de alguém a quem não mentir. Se cairmos, caímos **juntos**."*

{{companionLine}}
