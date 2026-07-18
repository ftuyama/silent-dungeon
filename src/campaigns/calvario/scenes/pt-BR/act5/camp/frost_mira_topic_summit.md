---
id: act5/camp/frost_mira_topic_summit
title: O cume adiante
chapter: 5
ambientTheme: camp
choices:
  - text: "Voltar ao calor relativo do grupo"
    next: act5/camp/frost_mira_fireside
    effects:
      - { op: adjustCompanionFriendship, companionId: rogue_mira, delta: 2, onceFlag: ff_cf_act5_frost_mira_topic_summit }
onEnter: []
---
> *"O cume não é vitória — é **exposição**. Quando subirmos, não me peça heroísmo. Peça **clareza**."*

{{companionLine}}
