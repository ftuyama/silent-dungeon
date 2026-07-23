---
id: act6/camp/void_companion_chat
chapter: 6
ambientTheme: void
artKey: fractured_nave
title: Palavra ao pé da chama falsa
choices:
  - text: "Ouvir Mira — voz contra o eco"
    uiSection: "Ao pé do fogo"
    next: act6/camp/void_mira_fireside
    condition: { companionInParty: rogue_mira }
  - text: "Ouvir Tomás — escudo contra o vazio"
    uiSection: "Ao pé do fogo"
    next: act6/camp/void_tomas_fireside
    condition: { companionInParty: squire_tomas }
  - text: "Ficar entre os dois — três respirações, uma chama"
    uiSection: "Ao pé do fogo"
    next: act6/camp/void_duo_fireside
    condition:
      all:
        - { companionInParty: rogue_mira }
        - { companionInParty: squire_tomas }
  - text: "Mira: «Cavaleiro caído ou não — aqui o chão não distingue juramento»"
    uiSection: "Você e eles"
    next: act6/camp/void_mira_fireside
    condition: { all: [ { companionInParty: rogue_mira }, { class: knight } ] }
  - text: "Mira: «Trevas honestas, disse uma vez. O vazio cobra juros»"
    uiSection: "Você e eles"
    next: act6/camp/void_mira_fireside
    condition: { all: [ { companionInParty: rogue_mira }, { class: mage } ] }
  - text: "Mira: «Penitência é peso; não largue agora ou fica leve demais»"
    uiSection: "Você e eles"
    next: act6/camp/void_mira_fireside
    condition: { all: [ { companionInParty: rogue_mira }, { class: cleric } ] }
  - text: "Mira: «Atirador sem bandeira — aqui até a sombra quer saber de quem é»"
    uiSection: "Você e eles"
    next: act6/camp/void_mira_fireside
    condition: { all: [ { companionInParty: rogue_mira }, { class: archer } ] }
  - text: "Tomás: «O escudo lembra-me seu ferro — ambos mentem que aguentam tudo»"
    uiSection: "Você e eles"
    next: act6/camp/void_tomas_fireside
    condition: { all: [ { companionInParty: squire_tomas }, { class: knight } ] }
  - text: "Tomás: «Se o vazio ler seu caderno, o que fica por escrever?»"
    uiSection: "Você e eles"
    next: act6/camp/void_tomas_fireside
    condition: { all: [ { companionInParty: squire_tomas }, { class: mage } ] }
  - text: "Tomás: «Fé em lugar sem eco — é coragem ou hábito?»"
    uiSection: "Você e eles"
    next: act6/camp/void_tomas_fireside
    condition: { all: [ { companionInParty: squire_tomas }, { class: cleric } ] }
  - text: "Tomás: «Flecha no escuro — confias no olho ou no silêncio antes do disparo?»"
    uiSection: "Você e eles"
    next: act6/camp/void_tomas_fireside
    condition: { all: [ { companionInParty: squire_tomas }, { class: archer } ] }
  - text: "Voltar à fogueira"
    uiSection: "Voltar"
    uiSectionIcon: camp
    next: act6/camp/void_camp
onEnter: []
---
{{companionLine}}

Se você estiver só, o silêncio dobra a voz que já carrega. Até o eco parece cansado.
