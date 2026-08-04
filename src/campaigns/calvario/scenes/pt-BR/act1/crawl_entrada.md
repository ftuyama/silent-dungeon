---
id: act1/crawl_entrada
title: Primeiro degrau
chapter: 1
ambientTheme: explore
artKey: crawl
choices:
  - text: "Aceitar o chamado e seguir"
    next: act1/class_gate
    condition:
      all:
        - { noFlag: act1_class_chosen }
        - { noFlag: act1_crawl_diary_done }
    preview: "Escolha de classe e primeiro passo firme."
    effects:
      - { op: setFlag, key: act1_crawl_diary_done, value: true }
      - { op: addDiary, text: "Entrei na Masmorra do Silêncio." }
  - text: "Seguir até a boca da masmorra"
    next: act1/dungeon_mouth
    condition: { flag: act1_class_chosen }
    preview: "Juramento feito; o ar lá fora ainda ouve."
  - text: "Um caco de espelho brilha na argamassa — ver o próprio rosto"
    next: act1/mirror_descent
    condition:
      all:
        - { noFlag: act1_class_chosen }
        - { noMark: act1_mirror_shard }
    preview: "Rota do espelho; marca no diário antes da classe."
  - text: "Tocar na parede: está fria ou úmida?"
    next: act1/crawl_touch
    condition:
      all:
        - { noFlag: act1_wall_touched }
        - { noFlag: act1_class_chosen }
    preview: "Detalhe tátil; stress leve e uma marca."
onEnter: []
---
Pedra fria sob a palma. A umidade grudou há séculos e nunca secou de todo.
