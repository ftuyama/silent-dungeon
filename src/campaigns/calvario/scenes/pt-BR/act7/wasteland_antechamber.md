---
id: act7/wasteland_antechamber
title: Antecâmara da cinza
chapter: 7
type: hub
ambientTheme: ash_sky
artKey: wasteland_dust
highlight: true
artHighlightSfx: mysterious
choices:
  - text: "Deixar o vento decidir o próximo sacrifício"
    uiSection: "Cinzas"
    next: act7/wasteland_router
    preview: "Evento do descampo — sermão, lâmina ou sino."
  - text: "Descer às profundezas de magma — o fundo verdadeiro"
    uiSection: "Eixo"
    next: act8/hub_magma_crucible
    condition:
      all:
        - { hasStoryPath: throne }
        - { flag: act8_hub_reached }
    effects:
      - { op: setChapter, chapter: 8 }
    preview: "Abandonar o final incompleto e voltar ao Crisol."
  - text: "Descer às profundezas de magma — primeira garganta"
    uiSection: "Eixo"
    next: act8/opening_magma_throat
    condition:
      all:
        - { hasStoryPath: throne }
        - { noFlag: act8_hub_reached }
    preview: "O eixo ainda desce; o céu de cinza não é o fundo."
  - text: "Voltar às Cimeiras do Vento Cinzento"
    uiSection: "Eixo"
    next: act5/frost_hub
    condition:
      all:
        - { hasStoryPath: throne }
        - { flag: act5_hub_reached }
    effects:
      - { op: setChapter, chapter: 5 }
    preview: "Regressar ao gelo — o eixo liga superfície e profundezas."
onEnter:
  - { op: addXp, amount: 20 }
  - { op: setFlag, key: act7_hub_reached, value: true }
---
A estrada **não** volta atrás — só **ramifica** em males menores. Antes do último horizonte, o descampo impõe **um** evento que não pede desculpa: sermão, lâmina ou **sino** sem badalo.

Isto **não** é o fundo do eixo — é fuga para o céu. O verdadeiro fecho ainda **arde** abaixo.
