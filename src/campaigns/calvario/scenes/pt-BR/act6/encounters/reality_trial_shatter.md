---
id: act6/encounters/reality_trial_shatter
title: Fenda Sem Eixo
chapter: 6
ambientTheme: void
artKey: reality_trial_nave
choices:
  - text: "Lutar mesmo com a fe em queda"
    effects:
      - { op: addResource, resource: faith, delta: -1 }
      - { op: addResource, resource: corruption, delta: 1 }
      - { op: startCombat, encounterId: act6_veil_herald, onVictory: act6/reality_after, onDefeat: shared/game_over, onFlee: act6/hub_fractured_nave }
onEnter:
  - { op: addMark, mark: act6_veil_broken }
  - { op: addDiary, text: "Quando o real partiu, a sombra entrou primeiro." }
---
As paredes trocam de lugar. Seu corpo chega atrasado a cada gesto. Pisar no chão vira um ato de fé.

O Arauto não avança. Ele espera sua queda para chamar isso de prova.
