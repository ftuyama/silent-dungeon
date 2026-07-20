---
id: act2/camp/camp_mira_fireside
title: Brasas — palavra com Mira
chapter: 2
ambientTheme: camp
artKey: vigilia_camp
choices:
  - text: "Perguntar o que ela já não rouba ao escuro"
    next: act2/camp/camp_mira_topic_shadows
    visibleWhen: { noMark: mira_camp_shadows }
    effects:
      - { op: addMark, mark: mira_camp_shadows }
      - { op: adjustCompanionFriendship, companionId: rogue_mira, delta: 2, onceFlag: ff_cf_act2_camp_mira_fireside_shadows }
  - text: "Falar da Vigília como quem fala baixo"
    next: act2/camp/camp_mira_topic_vigilia
  - text: "Compartilhar silêncio — só o estalar da lenha"
    next: act2/camp/camp_mira_topic_silence
    visibleWhen: { noFlag: act2_camp_mira_silence_done }
  - text: "Voltar à roda da fogueira"
    next: act2/camp/camp_companion_chat
    effects:
      - { op: adjustCompanionFriendship, companionId: rogue_mira, delta: -2, onceFlag: ff_cf_act2_camp_mira_fireside_leave }
onEnter: []
---
> *"Fala depressa. O fogo **ouve** melhor que a pedra — e eu ouço melhor que os dois."*

{{companionLine}}
