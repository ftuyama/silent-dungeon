---
id: act2/path_archer_marksman
chapter: 2
ambientTheme: act2
title: Arqueiro atirador
onEnter:
  - { op: setPath, path: marksman }
  - { op: learnSpell, spellId: silent_arrow }
  - { op: addDiary, text: "Derrotei o anjo do véu com a flecha; aceitei o nome de Atirador — distância como sentença, não como fuga." }
choices:
  - text: "Voltar ao cruzeiro"
    next: act2/hub_catacomb
---
O **anjo** desfaz-se em cinza que não cai — só se afasta. A flecha não perdoa; você também não.
