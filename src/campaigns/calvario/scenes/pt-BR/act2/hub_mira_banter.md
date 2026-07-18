---
id: act2/hub_mira_banter
title: Cruzeiro — palavra com Mira
chapter: 2
ambientTheme: act2
choices:
  - text: "Voltar ao cruzeiro"
    next: act2/hub_catacomb
    preview: "Retomas o posto de decisão."
    effects:
      - { op: addMark, mark: mira_cruzeiro_confidencia }
      - { op: adjustCompanionFriendship, companionId: rogue_mira, delta: 3, onceFlag: ff_cf_act2_hub_mira_banter }
onEnter: []
---
**Mira** encosta a espada ao ombro: "Este lugar **cobra** cada passo. Eu já deixei aqui um nome — não vou deixar o seu de graça."

O eco responde. Não diz a quem.
