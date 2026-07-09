---
id: act2/camp/camp_companion_chat
chapter: 2
ambientTheme: act2
title: Palavra ao lado do fogo
choices:
  - text: "Ouvir Mira sem a pedra julgar"
    uiSection: "Ao pé do fogo"
    next: act2/camp/camp_mira_fireside
    condition: { companionInParty: rogue_mira }
  - text: "Sentar junto ao escudo de Tomás"
    uiSection: "Ao pé do fogo"
    next: act2/camp/camp_tomas_fireside
    condition: { companionInParty: squire_tomas }
  - text: "Mira cruza com você um olhar de quem reconhece muralha no ombro"
    uiSection: "Você e eles"
    next: act2/camp/camp_mira_fireside
    condition: { all: [ { companionInParty: rogue_mira }, { class: knight } ] }
  - text: "Mira mede seu silêncio de arcanista — não julga, anota"
    uiSection: "Você e eles"
    next: act2/camp/camp_mira_fireside
    condition: { all: [ { companionInParty: rogue_mira }, { class: mage } ] }
  - text: "Mira: «A Vigília fala alto; você ouve baixo demais para ser só dogma»"
    uiSection: "Você e eles"
    next: act2/camp/camp_mira_fireside
    condition: { all: [ { companionInParty: rogue_mira }, { class: cleric } ] }
  - text: "Tomás: «Honra pesada empurra gente para buracos — está inteiro?»"
    uiSection: "Você e eles"
    next: act2/camp/camp_tomas_fireside
    condition: { all: [ { companionInParty: squire_tomas }, { class: knight } ] }
  - text: "Tomás hesita: «Torre e masmorra — qual das duas te come primeiro?»"
    uiSection: "Você e eles"
    next: act2/camp/camp_tomas_fireside
    condition: { all: [ { companionInParty: squire_tomas }, { class: mage } ] }
  - text: "Tomás baixa a voz: «Fé de vigia é coisa séria; não a uses como muro»"
    uiSection: "Você e eles"
    next: act2/camp/camp_tomas_fireside
    condition: { all: [ { companionInParty: squire_tomas }, { class: cleric } ] }
  - text: "O trilho gravado ressoa no fogo — arquétipo e facção alinhados"
    uiSection: "Você e eles"
    next: act2/camp/camp_companion_chat
    condition: { legacyUpgrade: legacy_combo_path_faction }
    preview: "Legado: trilho e facção em harmonia."
    effects:
      - { op: addDiary, text: "Ao pé do fogo, o eco do seu arquétipo encaixa na muralha de reputação — o grupo ouve você com outro peso." }
  - text: "Voltar ao acampamento"
    uiSection: "Voltar"
    next: act2/camp/vigilia_camp
onEnter: []
---
{{companionLine}}

*Alguém murmura o número — **dia {{day}}** — como quem confessa idade.* O fogo não pede **permissão**, mas pede testemunhas.
