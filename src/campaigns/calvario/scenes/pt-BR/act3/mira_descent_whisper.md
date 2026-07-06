---
id: act3/mira_descent_whisper
title: Sussurro na descida
chapter: 3
ambientTheme: act3
choices:
  - text: "Seguir a descida"
    next: act3/descent
    preview: "O eco não fica mais leve — só mais conhecido."
onEnter:
  - { op: adjustCompanionFriendship, companionId: rogue_mira, delta: 2, onceFlag: ff_act3_mira_depths_whisper }
---
**Mira** inclina a cabeça sem olhar para você: "Aqui o silêncio não é paz — é **trégua** entre quem manda no teto e quem manda no chão. Se ouvir seu nome no escuro, não seja o primeiro a responder."
