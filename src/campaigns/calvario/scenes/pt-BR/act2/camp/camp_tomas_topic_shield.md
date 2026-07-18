---
id: act2/camp/camp_tomas_topic_shield
title: O peso do escudo
chapter: 2
ambientTheme: camp
choices:
  - text: "Aceitar o silêncio dele como resposta"
    next: act2/camp/camp_tomas_fireside
    effects:
      - { op: adjustCompanionFriendship, companionId: squire_tomas, delta: 2, onceFlag: ff_cf_act2_camp_tomas_topic_shield }
onEnter: []
---
> *"Pesa o que **não** consegui parar. Você também carrega coisa demais — não se acostume a chamar isso de **honra**."*

{{companionLine}}
