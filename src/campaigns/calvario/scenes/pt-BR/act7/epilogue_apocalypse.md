---
id: act7/epilogue_apocalypse
title: Epílogo — cinzas incompletas
chapter: 7
ambientTheme: ash_sky
artKey: last_horizon_epilogue
highlight: true
choices:
  - text: "Fechar o diário — fuga para o céu"
    next: endings/epilogue_depths
onEnter:
  - { op: registerEnding, endingId: epilogue_apocalypse }
  - { op: addDiary, text: "O apocalipse não terminou — só ficou mais honesto: cinza com nome, vento com conta, e eu a fingir que o céu era o fundo. O eixo ainda descia." }
---
O mundo continua sem você. Seu eco se reparte entre estrada, marca e silêncio. Isto não é vitória completa — é fuga para o céu.
