---
id: act7/wasteland_router
title: Descampo que sorteia
chapter: 7
ambientTheme: ash_sky
artKey: wasteland_router
randomBranch:
  id: act7_wasteland_rb
  branches:
    - { weight: 1, next: act7/event_ash_sermon }
    - { weight: 1, next: act7/fight_hollow_intro }
    - { weight: 1, next: act7/event_silent_bell }
    - { weight: 0.85, next: act7/event_cinder_tithe }
    - { weight: 0.5, next: act7/event_last_train, condition: { resource: { gold: { gte: 3 } } } }
    - { weight: 1, next: act7/before_final_horizon }
choices: []
onEnter: []
---
O vento traz um cheiro que não é terra nem cidade. Algo se move na cinza: às vezes voz; outras, forma; outras, só fome com passos.

Quando você para de controlar o mapa, o descampo escolhe o próximo pecado — pequeno, mas gravado.
