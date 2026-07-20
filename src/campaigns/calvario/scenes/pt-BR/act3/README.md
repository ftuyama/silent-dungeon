# Act 3 — Abrir caminho ao Trono

> README para agentes de IA. Resumo do enredo e referências de design — **não** é texto jogável.

## Missão principal

**Abrir caminho ao Trono** — explorar profundezas, derrotar guardião de pedra, missões secundárias, nível 11+, seguir ao Trono de Ossos (cap. 4).

## Sinopse

A masmorra **aperta**. A descida (`descent`) leva a galerias afogadas, poço mentiroso, passagem cultista (com `rumor_map`) e encontro com **cristal de corrupção** — tocar, recuar ou ignorar gera consequências (`act3_corruption_ignored` → patrulha cultista). O **núcleo** (`hub_depths`) não tem acampamento: só fôlego e gotejar.

O **guardião de pedra** (`stone_corridor`) bloqueia o trono até ser derrotado (`stone_guard_defeated`). Missões: canos sussurrantes, negociação cultista, mensageiro interrompido, santuário esquecido (abertura depende da classe). **Morvayn** não aparece, mas o ar já carrega o cheiro dele. Com nível 11, guardião morto e meta no mapa → `act4/throne/throne_gate`.

## Tom e pacing

Mais claustrofóbico que o cruzeiro; menos humor, mais umidade e runas. Corrupção como tentação física. Hub enxuto — exploração pune stress. Preparação para boss act4.

## Personagens

| Papel | Cenas |
|-------|-------|
| Guardião de pedra | `stone_corridor`, combate golem |
| Cultistas / mensageiro | `cult_negotiate`, `messenger_cold_trail` |
| Mira | `mira_descent_whisper` (se recrutada) |
| Morvayn | Ausente; presságio constante |

## Arco narrativo (beats)

1. `act3/descent` — transição do cap. 2
2. Eventos opcionais: `corruption_event`, `well_lies`, `cult_passage`
3. `act3/hub_depths` — hub
4. `stone_corridor` → `stone_guard_defeated`
5. Missões: `pipes_whisper`, `messenger_*`, `forgotten_shrine`
6. `act4/throne/throne_gate` — cap. 4

## Hub e exploração

- **Hub:** `act3/hub_depths`
- **Mapa:** `act3_depths` (graph `act3_depths`)
- **Meta:** `act3_explore_goal_reached`
- **Sem acampamento** neste ato

## Gates de progressão

| Requisito | Destino / efeito |
|-----------|------------------|
| Nível 11 + guardião + meta | `act4/throne/throne_gate` |
| Nível 8+ | Canos (`pipes_whisper`) |
| Nível 9+ | Mensageiro |
| Nível 10+ | Negociação cultista |
| Ignorar corrupção | `cult_patrol_scene` |

## Entrada / saída

- **Entrada:** `act3/descent` (desde cruzeiro)
- **Saída:** `act4/throne/throne_gate`
- **Regresso:** hub volta a `act2/hub_catacomb` (cap. 2)

## Cenas-chave

| ID | Função |
|----|--------|
| `act3/hub_depths` | Hub |
| `act3/stone_corridor` | Boss gate act3 |
| `act3/corruption_event` | Escolha de corrupção |
| `act3/secret/forgotten_shrine` | Fé / classe |

## Notas para novas cenas

- Consequências de flags act3 devem persistir em act4+ (diário, rep, corrupção)
- `ambientTheme: act3`
- Evitar reintroduzir acampamento sem justificativa narrativa
