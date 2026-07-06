---
id: act7/path_ember_devour
title: Lenha viva
chapter: 7
ambientTheme: ash_sky
artKey: ember_pyres
choices:
  - text: "Arrefecer o peito na cinza e seguir — fogo também é caminho"
    next: act7/wasteland_antechamber
onEnter:
  - { op: addMark, mark: act7_ember_witness }
  - { op: addResource, resource: corruption, delta: 2 }
  - { op: addResource, resource: supply, delta: -1 }
  - { op: addDiary, text: "Não cosi o céu — alimentei o que já ardia. O calor não perdoa, mas cobre o frio como cobertor sujo." }
---
Abres a garganta e o calor **responde** sem pedir nome — **acordo** com o que já queimava em você antes do fim do mundo ser moda.

O fogo **come** suprimento e **deixa** corrupção como brasão: não é santo; és **chaminé** ambulante.
