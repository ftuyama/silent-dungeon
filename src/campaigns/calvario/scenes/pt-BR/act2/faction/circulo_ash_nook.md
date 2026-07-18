---
id: act2/faction/circulo_ash_nook
title: Recanto de cinza do Círculo
chapter: 2
ambientTheme: act2
artKey: circulo_ash_nook
choices:
  - text: "Aceitar o empréstimo de forma — ler o que a cinza escreve"
    next: act2/hub_catacomb
    preview: "Buff MEN e XP · topologia do Círculo (uma vez)."
    effects:
      - { op: setFlag, key: act2_circulo_ash_nook_done, value: true }
      - { op: grantTemporaryBuff, attr: mind, delta: 1, remainingScenes: 4 }
      - { op: addXp, amount: 15 }
      - { op: addDiary, text: "A cinza escreveu um símbolo na palma e depois apagou — o Círculo empresta forma a quem já fechou trato." }
  - text: "Raspar a cinza e sair sem ler"
    next: act2/hub_catacomb
    preview: "Sem dívida nova — só o caminho."
    effects:
      - { op: setFlag, key: act2_circulo_ash_nook_done, value: true }
      - { op: addDiary, text: "Raspei a cinza. O Círculo não gosta de quem recusa leitura — mas também não cobra quem não abre o livro." }
onEnter: []
---
Um **recanto** que o mapa do cruzeiro não marca: cinza viva desenha círculos no chão. Só quem já ouviu o enviado encontra a dobra.
