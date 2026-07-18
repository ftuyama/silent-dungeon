---
id: act2/faction/vigilia_cache
title: Depósito selado da Vigília
chapter: 2
ambientTheme: camp
artKey: vigilia_cache
choices:
  - text: "Abrir o selo e tomar o que a ordem escondeu"
    next: act2/hub_catacomb
    preview: "Suprimento e ouro · topologia da Vigília (uma vez)."
    effects:
      - { op: setFlag, key: act2_vigilia_cache_looted, value: true }
      - { op: addResource, resource: supply, delta: 2 }
      - { op: addResource, resource: gold, delta: 3 }
      - { op: addXp, amount: 15 }
      - { op: addDiary, text: "O depósito da Vigília cheirava a cera e ordem — levei o que o farol guarda para quem já apertou o pulso." }
  - text: "Deixar o selo intacto e voltar"
    next: act2/hub_catacomb
    preview: "Respeito sem saque — o caminho fica."
    effects:
      - { op: setFlag, key: act2_vigilia_cache_looted, value: true }
      - { op: addRep, faction: vigilia, delta: 1 }
      - { op: addDiary, text: "Não toquei no depósito. O farol anotou a contenção." }
onEnter: []
---
Atrás de uma **grade** marcada com o farol, um nicho guarda mantimentos selados em cera. Só quem já falou com o enviado conhece o caminho.
