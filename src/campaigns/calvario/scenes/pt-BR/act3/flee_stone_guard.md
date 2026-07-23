---
id: act3/flee_stone_guard
chapter: 3
ambientTheme: act3
title: Fuga — runas a tremer
choices:
  - text: "Recuar ao corredor"
    next: act3/stone_corridor
onEnter:
  - { op: addResource, resource: supply, delta: -1 }
  - { op: addDiary, text: "Recuei do golem. As runas de contenção ainda tremem — pedra não esquece quem passou." }
---
O golem **não corre**. Avança junta a junta, e cada passo arranca poeira do salão.

Você recua antes que o corredor vire tumba.
