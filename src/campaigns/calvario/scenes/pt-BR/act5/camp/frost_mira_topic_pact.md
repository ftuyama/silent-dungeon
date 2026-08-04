---
id: act5/camp/frost_mira_topic_pact
title: Pacto com o frio
chapter: 5
ambientTheme: camp
choices:
  - text: "Deixar o vento fechar o assunto"
    next: act5/camp/frost_mira_fireside
    effects:
      - { op: adjustCompanionFriendship, companionId: rogue_mira, delta: 2, onceFlag: ff_cf_act5_frost_mira_topic_pact }
onEnter: []
---
> *"O frio não devolve nada. Só **endurece** o que ficou com você.
