---
id: act5/frost_summit/pick_sacrifice
title: Quem paga o preço
chapter: 5
ambientTheme: ancient_macabre
artKey: frost_summit_ritual_pick_sacrifice
choices:
  - text: "Oferecer Mira ao altar — sem teatro, sem volta"
    condition: { companionInParty: rogue_mira }
    commitSfx: horrific_sacrifice
    preview: "Sem carregar o gesto a tempo, recuas ao umbral."
    effects:
      - { op: dismissCompanion, companionId: rogue_mira }
    next: act5/frost_summit/ritual_blood
  - text: "Oferecer Tomás ao altar — juramento quebrado em sangue"
    condition: { companionInParty: squire_tomas }
    commitSfx: horrific_sacrifice
    preview: "Sem carregar o gesto a tempo, recuas ao umbral."
    effects:
      - { op: dismissCompanion, companionId: squire_tomas }
    next: act5/frost_summit/ritual_blood
  - text: "Não consigo — voltar ao umbral"
    commitSfx: horrific_sacrifice
    next: act5/frost_summit/temple_gate
    preview: "Oferecer seu próprio corpo (Perdes metade do PV máximo para sempre)"
    effects:
      - { op: multiplyLeadHp, factor: 0.5 }
onEnter:
  - { op: addDiary, text: "O altar não pede nome. Pede presença. E eu escolhi quem ia ficar ausente." }
---
O **altar** não brilha; absorve. Para abrir o que dorme sob os "**deuses antigos**", alguém deixa de ser gente — e alguém paga em carne próxima.
