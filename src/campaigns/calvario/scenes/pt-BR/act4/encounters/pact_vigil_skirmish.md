---
id: act4/encounters/pact_vigil_skirmish
title: Escaramuça da Vigília
chapter: 4
ambientTheme: act4
choices:
  - text: "Responder ao aço da Vigília"
    effects:
      - op: startCombat
        encounterId: vigil_hunter_fight
        onVictory: act4/pact/pact_coda
        onDefeat: shared/game_over
        onFlee: act4/pact/pact_after_mind
onEnter:
  - { op: addRep, faction: vigilia, delta: -1 }
  - { op: addDiary, text: "Um caçador da Vigília reconheceu meu passo, não meu rosto. Para quem jura pela luz, o pacto cheira a traição." }
---
Do lado da **sombra** de um chafariz, um arqueiro da **Vigília** corta seu caminho. Não traz sermão — traz **certeza**.
