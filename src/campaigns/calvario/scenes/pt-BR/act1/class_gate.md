---
id: act1/class_gate
title: O espelho d'água
chapter: 1
ambientTheme: explore
artKey: class_gate
highlight: true
choices:
  - text: "[#] Forjar o caminho como Cavaleiro"
    uiSection: "Juramento"
    next: act1/pick_knight
    condition: { noFlag: act1_class_chosen }
    preview: "Honra da Vigília; combate corpo a corpo."
  - text: "[*] Desvendar segredos como Mago"
    uiSection: "Juramento"
    next: act1/pick_mage
    condition: { noFlag: act1_class_chosen }
    preview: "Rituais do Círculo; mente afiada."
  - text: "[+] Abrir passagem como Clérigo"
    uiSection: "Juramento"
    next: act1/pick_cleric
    condition: { noFlag: act1_class_chosen }
    preview: "Fé e purificação contra mortos-vivos."
  - text: "[-] Rastrear presas como Arqueiro"
    uiSection: "Juramento"
    next: act1/pick_archer
    condition: { noFlag: act1_class_chosen }
    preview: "Caçador solitário; agilidade e precisão."
  - text: "Olhar fixamente a água negra: o que reflete?"
    uiSection: "Exploração"
    next: act1/class_gate_water
    condition:
      all:
        - { noFlag: class_gate_test_done }
        - { noFlag: act1_class_chosen }
    preview: "Teste de sorte; sucesso revela o espelho de mão."
    effects:
      - { op: setFlag, key: class_gate_test_done, value: true }
  - text: "Ouvir: há outro som além do gotejar?"
    uiSection: "Exploração"
    next: act1/class_gate_listen
    condition:
      all:
        - { noFlag: class_gate_test_done }
        - { noFlag: act1_class_chosen }
    preview: "Teste de Mente; sucesso revela o espelho de mão."
    effects:
      - { op: setFlag, key: class_gate_test_done, value: true }
  - text: "Um espelho de mão na parede — segurá-lo e ver você sem a água"
    uiSection: "Exploração"
    next: act1/mirror_round
    condition: { noFlag: act1_class_chosen }
    preview: "Só olhar; marca e diário."
  - text: "Seguir até a boca da masmorra"
    next: act1/dungeon_mouth
    condition: { flag: act1_class_chosen }
    preview: "O juramento já está feito; o ar lá fora ainda ouve."
onEnter: []
---
Três **juramentos** ecoam na câmara redonda. Um quarto sussurro de caça, sem bandeira. No centro, **água negra** parada — e seu reflexo demora um instante a acompanhar, como se escolhesse entre **espada**, **arco** e **símbolo sagrado**.

O ar cheira a **incenso queimado** e ferro.
