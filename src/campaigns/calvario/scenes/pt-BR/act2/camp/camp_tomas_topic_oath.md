---
id: act2/camp/camp_tomas_topic_oath
title: Juramento sem mestre
chapter: 2
ambientTheme: camp
choices:
  - text: "Deixar o passado na brasa"
    next: act2/camp/camp_tomas_fireside
    effects:
      - { op: adjustCompanionFriendship, companionId: squire_tomas, delta: 2, onceFlag: ff_cf_act2_camp_tomas_topic_oath }
onEnter: []
---
> *"A ordem não morreu num dia — foi **esquecendo** nomes. Enquanto você levantar antes de eu cair, o **juramento** vale."
