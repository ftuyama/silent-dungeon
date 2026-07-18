---
id: act2/camp/camp_mira_topic_shadows
title: O que fica no escuro
chapter: 2
ambientTheme: camp
choices:
  - text: "Deixar o assunto morrer na brasa"
    next: act2/camp/camp_mira_fireside
    effects:
      - { op: adjustCompanionFriendship, companionId: rogue_mira, delta: 2, onceFlag: ff_cf_act2_camp_mira_topic_shadows }
onEnter: []
---
> *"Roubo o que me devolve o nome. O resto deixo **no chão** — alguém vai achar que é tesouro. Você deixa **promessas** no escuro; eu **sei** o peso quando você finge que é leve."*

{{companionLine}}
