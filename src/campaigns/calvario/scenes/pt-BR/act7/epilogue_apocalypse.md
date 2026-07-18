---
id: act7/epilogue_apocalypse
title: Epílogo — cinzas incompletas
chapter: 7
ambientTheme: ash_sky
artKey: last_horizon
highlight: true
choices:
  - text: "Fechar o diário — fuga para o céu"
    next: endings/epilogue_depths
onEnter:
  - { op: registerEnding, endingId: epilogue_apocalypse }
  - { op: addDiary, text: "O apocalipse não terminou — só ficou mais honesto: cinza com nome, vento com conta, e eu a fingir que o céu era o fundo. O eixo ainda descia." }
---
O mundo **continua** sem você; seu **eco** reparte-se entre **estrada**, **marca** e **silêncio** comprado ou recusado.

Isto **não** é vitória completa — é **fuga** para o céu. O fundo do eixo ficou por baixo, a arder. *(Podes **salvar** no menu ou **recomeçar**.)*
