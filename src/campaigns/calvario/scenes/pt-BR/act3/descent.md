---
id: act3/descent
title: Descida ao silêncio profundo
chapter: 3
ambientTheme: act3
artKey: silence_descent
choices:
  - text: "Seguir até o núcleo das profundezas"
    preview: "Galeria afogada e corredor do trono."
    next: act3/hub_depths
  - text: "Investigar o poço mentiroso"
    preview: "Mapa falso — perícia ou emboscada."
    next: act3/well_lies
    visibleWhen:
      all:
        - { noFlag: well_truth }
        - { noFlag: false_map }
  - text: "Forçar o atalho do mapa rasgado"
    preview: "Atalho oculto; exige mapa-rumor e nível 7."
    next: act3/cult_passage
    condition:
      all:
        - { hasItem: rumor_map }
        - { level: { gte: 7 } }
    showWhenLocked: true
    lockedHint: "Mapa-rumor no inventário e nível 7."
  - text: "Encontro com a corrupção"
    preview: "Cristal verde; tocar, recuar ou ignorar."
    next: act3/corruption_event
    visibleWhen: { noFlag: act3_corruption_event_done }
    condition: { level: { gte: 7 } }
    showWhenLocked: true
    lockedHint: "Requer nível 7."
  - text: "Anotar isto no diário"
    preview: "Fixar o cheiro antes que o silêncio o devore."
    next: act3/diary_trigger
    visibleWhen: { noFlag: act3_descent_diary_done }
  - text: "Ouvir o que Mira diz do cheiro e do silêncio"
    preview: "Uma voz que já assinou com o subsolo."
    next: act3/mira_descent_whisper
    visibleWhen: { noFlag: ff_act3_mira_depths_whisper }
    condition: { companionInParty: rogue_mira }
onEnter: []
---
A escada **afunda**. Um pulso verde bate com o seu coração — cada lance rouba ruído até restar só pedra úmida. **Não há fogo** que valha abrigo aqui.

Com o **Mapa Rasgado**, abre-se um atalho que o mapa comum esconde.
