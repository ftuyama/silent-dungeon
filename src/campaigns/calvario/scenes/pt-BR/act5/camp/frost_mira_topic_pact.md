---
id: act5/camp/frost_mira_topic_pact
title: Pacto com o frio
chapter: 5
ambientTheme: camp
choices:
  - text: "Não insistir — o vento já fala alto"
    next: act5/camp/frost_mira_fireside
    effects:
      - { op: adjustCompanionFriendship, companionId: rogue_mira, delta: 2, onceFlag: ff_cf_act5_frost_mira_topic_pact }
onEnter: []
---
> *"O frio não devolve nada — só **endurece** o que ficou com você. Se isto for pacto, que seja **curto**."*

{{companionLine}}
