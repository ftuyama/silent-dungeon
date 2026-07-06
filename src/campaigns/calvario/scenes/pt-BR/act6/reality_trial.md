---
id: act6/reality_trial
title: Prova da Realidade
chapter: 6
ambientTheme: void
artKey: act6_reality_corridor
skillCheck:
  id: act6_reality_focus
  attr: mind
  tn: 11
  successNext: act6/encounters/reality_trial_focus
  failNext: act6/encounters/reality_trial_shatter
choices:
  - text: "Tentar fixar um unico mundo com a mente"
    next: act6/encounters/reality_trial_focus
    preview: "Sem fixar a tempo, o véu parte."
  - text: "Fechar os olhos e aceitar o colapso"
    next: act6/encounters/reality_trial_shatter
onEnter: []
---
Os espelhos mostram **você** com escolhas mais fáceis — nunca entraste na Masmorra do Silêncio, ou foi amado por todos e esquecido por todos.

O arauto inclina-se: *real é o que **insiste***; o chão liquefaz-se — só ficas de pé se escolheres qual dor chamas de verdade.
