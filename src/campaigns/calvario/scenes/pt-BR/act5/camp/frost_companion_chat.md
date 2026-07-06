---
id: act5/camp/frost_companion_chat
chapter: 5
ambientTheme: act5
title: Palavra ao lado do fogo
choices:
  - text: "Ouvir Mira sem a neve decidir por você"
    uiSection: "Ao pé do fogo"
    next: act5/camp/frost_mira_fireside
    condition: { companionInParty: rogue_mira }
  - text: "Sentar ao lado de Tomás — escudo e tempestade"
    uiSection: "Ao pé do fogo"
    next: act5/camp/frost_tomas_fireside
    condition: { companionInParty: squire_tomas }
  - text: "Ficar entre os dois — duas lâminas, um fogo"
    uiSection: "Ao pé do fogo"
    next: act5/camp/frost_duo_fireside
    condition:
      all:
        - { companionInParty: rogue_mira }
        - { companionInParty: squire_tomas }
  - text: "Mira: «Ainda carregas a muralha nas costas — o frio não perdoa isso»"
    uiSection: "Você e eles"
    next: act5/camp/frost_mira_fireside
    condition: { all: [ { companionInParty: rogue_mira }, { class: knight } ] }
  - text: "Mira: «Os seus símbolos derretem neve? Ou é o contrário?»"
    uiSection: "Você e eles"
    next: act5/camp/frost_mira_fireside
    condition: { all: [ { companionInParty: rogue_mira }, { class: mage } ] }
  - text: "Mira: «Oras, clérigo — até aqui rezas ou apenas respiras?»"
    uiSection: "Você e eles"
    next: act5/camp/frost_mira_fireside
    condition: { all: [ { companionInParty: rogue_mira }, { class: cleric } ] }
  - text: "Mira: «Caçador no gelo — rastreias o fogo ou a fuga?»"
    uiSection: "Você e eles"
    next: act5/camp/frost_mira_fireside
    condition: { all: [ { companionInParty: rogue_mira }, { class: archer } ] }
  - text: "Tomás: «O gelo gosta de quem já traz culpa no ferro»"
    uiSection: "Você e eles"
    next: act5/camp/frost_tomas_fireside
    condition: { all: [ { companionInParty: squire_tomas }, { class: knight } ] }
  - text: "Tomás: «Mana não aquece; mas arde por dentro como fé torta»"
    uiSection: "Você e eles"
    next: act5/camp/frost_tomas_fireside
    condition: { all: [ { companionInParty: squire_tomas }, { class: mage } ] }
  - text: "Tomás: «Se a Vigília te ouvisse agora, aprovaria o silêncio?»"
    uiSection: "Você e eles"
    next: act5/camp/frost_tomas_fireside
    condition: { all: [ { companionInParty: squire_tomas }, { class: cleric } ] }
  - text: "Tomás: «Flecha no vento cortante — erras uma vez e o frio lembra-te»"
    uiSection: "Você e eles"
    next: act5/camp/frost_tomas_fireside
    condition: { all: [ { companionInParty: squire_tomas }, { class: archer } ] }
  - text: "Voltar ao acampamento gelado"
    uiSection: "Voltar"
    next: act5/camp/frost_camp
onEnter: []
---
{{companionLine}}

O vento ocupa o lugar do outro quando calas — e mesmo assim parece réplica de conversa. O céu baixo ajuda: ninguém exige bravura quando o frio parece ter opinião.
