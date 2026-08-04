---
id: act5/frost_contrawind/parley
title: A Medida de Edras
chapter: 5
ambientTheme: act5
artKey: frost_contrawind_edras
choices:
  - text: "Aceitar a medida — responder sem esconder a intenção"
    visibleWhen: { noFlag: contrawind_parley_attempted }
    effects:
      - { op: setFlag, key: contrawind_parley_attempted, value: true }
      - op: startCombat
        encounterId: act5_edras_parley_dialogue
        onVictory: act5/frost_contrawind/accepted
        onDefeat: act5/frost_contrawind/rejected
    preview: "Uma única conversa decidirá se Edras abre o grimório."
  - text: "Adiar a resposta e voltar ao desfiladeiro"
    next: act5/frost_hub
---
Edras não agradece. Desenha três linhas entre vocês: **força**, **mente**, **risco**.
