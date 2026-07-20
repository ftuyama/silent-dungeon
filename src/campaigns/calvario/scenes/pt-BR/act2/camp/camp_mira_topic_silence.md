---
id: act2/camp/camp_mira_topic_silence
title: Silêncio compartilhado
chapter: 2
ambientTheme: camp
choices:
  - text: "Respirar e voltar ao que importa"
    next: act2/camp/camp_mira_fireside
    effects:
      - { op: setFlag, key: act2_camp_mira_silence_done, value: true }
      - { op: addDiary, text: "Ao lado do fogo da Vigília, Mira e eu medimos o mundo em silêncio — e por uma vez o silêncio não pediu nome." }
      - { op: adjustCompanionFriendship, companionId: rogue_mira, delta: 2, onceFlag: ff_cf_act2_camp_mira_topic_silence }
onEnter: []
---
> *"Viu? **Assim** se faz trégua."*

{{companionLine}}
