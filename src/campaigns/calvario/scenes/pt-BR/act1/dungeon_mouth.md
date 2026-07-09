---
id: act1/dungeon_mouth
title: Boca da masmorra
chapter: 1
ambientTheme: explore
artKey: dungeon_mouth
highlight: true
artHighlightSfx: door_open
artHighlightFrames:
  - dungeon_mouth_hl0
  - dungeon_mouth_hl1
  - dungeon_mouth_hl2
  - dungeon_mouth_hl3
  - dungeon_mouth_hl4
highlightHoldMs: 4000
choices:
  - text: "Braseiro rachado — arrancar o selo (risco/recompensa)"
    next: act1/encounters/risk_brazier
    condition: { noFlag: act2_risk_brazier_done }
    preview: "Pode render recurso raro, mas drena convicção."
  - text: "Sino cego — prometer sangue ao eco (risco/recompensa)"
    next: act1/encounters/risk_bell
    condition: { noFlag: act2_risk_bell_done }
    preview: "Ganho imediato em poder, com custo visível."
  - text: "Entrar na catacumba"
    next: act2/catacomb_entry
    effects:
      - { op: setChapter, chapter: 2 }
      - { op: addResource, resource: supply, delta: -1 }
  - text: "Inspeccionar os batentes da porta"
    next: act1/dungeon_door
  - text: "Um eco duplo pulsa em você — fé e sombra reconhecem-se"
    next: act1/dungeon_mouth
    condition: { legacyUpgrade: legacy_combo_faith_corruption }
    preview: "Legado desbloqueado: dualidade preservada."
    effects:
      - { op: addResource, resource: faith, delta: 1 }
      - { op: addDiary, text: "Na boca da masmorra, fé e corrupção coexistem sem te partir — o eco duplo abriu um fio de calma." }
onEnter:
  - { op: addXp, amount: 6 }
---
A **boca de pedra** range como mandíbula velha. O ar torna-se **denso**, como lã molhada a entrar pelos pulmões — e o **silêncio** da câmara parece **ouvir você** antes de você ouvir a você.

Do interior vem um cheiro: **terra**, **cinza**, e algo doce demais para ser saudável.
