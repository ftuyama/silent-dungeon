---
id: act2/catacomb_observe
title: Teto
chapter: 2
ambientTheme: act2
luckCheck:
  id: catacomb_ceiling_luck
  tn: 9
  successNext: act2/hub_observe
  failNext: act2/rats_choice
  label: "Ler o teto sem perder o pé no cruzeiro"
choices: []
onEnter:
  - { op: setFlag, key: act2_catacomb_ceiling_done, value: true }
---
**Goteiras** desenham fios no ar. Entre as pedras, **raízes** finas buscam um sol que não chega.
