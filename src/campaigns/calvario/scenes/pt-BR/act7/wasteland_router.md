---
id: act7/wasteland_router
title: Descampo que sorteia
chapter: 7
ambientTheme: ash_sky
artKey: wasteland_router
randomBranch:
  id: act7_wasteland_rb
  branches:
    - { weight: 1, next: act7/event_ash_sermon, condition: { noMark: act7_heard_ash_sermon } }
    - { weight: 1, next: act7/fight_hollow_intro, condition: { noMark: act7_broke_hollow_line } }
    - {
        weight: 1,
        next: act7/event_silent_bell,
        condition:
          {
            all:
              [
                { noMark: act7_bell_paid_faith },
                { noMark: act7_bell_ate_promise },
              ],
          },
      }
    - {
        weight: 0.85,
        next: act7/event_cinder_tithe,
        condition:
          {
            all: [{ noMark: act7_cinder_favored }, { noMark: act7_cinder_burned }],
          },
      }
    - {
        weight: 0.5,
        next: act7/event_last_train,
        condition:
          {
            all:
              [
                { resource: { gold: { gte: 3 } } },
                { noMark: act7_last_train_rider },
              ],
          },
      }
    - { weight: 1, next: act7/before_final_horizon }
choices: []
onEnter: []
---
O vento traz um cheiro que não é terra nem cidade. Algo se move na cinza: às vezes voz; outras, forma; outras, só fome com passos.

Quando você para de controlar o mapa, o descampo escolhe o próximo pecado — pequeno, mas gravado.
