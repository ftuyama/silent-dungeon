---
id: act3/descent
title: Descida ao silêncio profundo
chapter: 3
ambientTheme: act3
choices:
  - text: "Descer até ao poço"
    preview: "Lá em baixo, a água sussurra promessas que ninguém confirma."
    next: act3/well_lies
  - text: "Forçar o atalho do mapa rasgado"
    preview: "Traços de tinta e medo — um caminho que os mapas honestos apagam."
    next: act3/cult_passage
    condition:
      all:
        - { hasItem: rumor_map }
        - { level: { gte: 7 } }
    showWhenLocked: true
    lockedHint: "Precisas do mapa-rumor no inventário e de nível 7 para forçar esse atalho."
  - text: "Ir ao encontro do que a corrupção promete"
    preview: "Algo puxa por baixo da pele; fingir surdez custa cada vez mais caro."
    next: act3/corruption_event
    condition: { level: { gte: 7 } }
    showWhenLocked: true
    lockedHint: "Com nível 7 a corrupção deixa de ser só rumor — torna-se encontro."
  - text: "Anotar isto no diário"
    preview: "Fixar o cheiro antes que o silêncio o devore."
    next: act3/diary_trigger
  - text: "Ouvir o que Mira diz do cheiro e do silêncio"
    preview: "Uma voz que já assinou com o subsolo."
    next: act3/mira_descent_whisper
    condition: { companionInParty: rogue_mira }
onEnter: []
---
A escada **afunda** e o **pulso verde** bate com seu coração — cada lance rouba **ruído** até restar só pedra úmida. **Não há fogo** que valha abrigo aqui.

Com o **Mapa Rasgado**, abre-se um atalho que o mapa comum não mostra.
