---
id: act6/camp/void_mira_topic_mirror
title: Sombra e espelho
chapter: 6
ambientTheme: void
artKey: fractured_nave
choices:
  - text: "Sair deste reflexo — voltar ao grupo"
    next: act6/camp/void_mira_fireside
    effects:
      - { op: adjustCompanionFriendship, companionId: rogue_mira, delta: 2, onceFlag: ff_cf_act6_void_mira_topic_mirror }
onEnter: []
---
> *"Sombras aqui têm **dentes**. Se me vir hesitar, não chame piedade — chame **tempo**."
