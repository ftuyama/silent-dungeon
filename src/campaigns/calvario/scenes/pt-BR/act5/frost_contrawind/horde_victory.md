---
id: act5/frost_contrawind/horde_victory
title: Depois da Quarta Queda
chapter: 5
ambientTheme: act5
artKey: frost_contrawind_horde
choices:
  - text: "Entrar no círculo e falar com o mago"
    next: act5/frost_contrawind/parley
    preview: "Edras baixou o cajado, mas não a guarda."
  - text: "Voltar ao desfiladeiro antes da conversa"
    next: act5/frost_hub
onEnter:
  - { op: setFlag, key: contrawind_horde_defeated, value: true }
  - { op: addDiary, text: "Quebrei o cerco de quatro cultistas na capela soterrada. O homem dentro do círculo disse chamar-se Edras — e ainda não decidiu se me deve gratidão ou suspeita." }
---
O último cultista cai de joelhos e o **vento** leva sua oração pela boca. O círculo continua inteiro; dentro dele, o mago apaga um símbolo com a ponta do cajado.
