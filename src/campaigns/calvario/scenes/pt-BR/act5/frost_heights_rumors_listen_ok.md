---
id: act5/frost_heights_rumors_listen_ok
title: Nome sem boca
chapter: 5
ambientTheme: act5
artKey: frost_heights_rumors
choices:
  - text: "Guardar o rumor e seguir"
    next: act5/frost_heights_rumors
onEnter:
  - { op: setFlag, key: frost_heights_listen_done, value: true }
  - { op: addResource, resource: faith, delta: 1 }
  - { op: addDiary, text: "Ouvi moradores murmurarem Vetrnax — dragão no cume, hálito que congela antes do grito. Ninguém pronunciou; todos souberam." }
---
Você pega **uma frase** inteira antes do vento cortar: *"… o hálito congela o grito…"* — não é poema. É aviso sobre **Vetrnax**.
