# Act 6 — Sobreviver às provas do Vazio

> README para agentes de IA. Resumo do enredo e referências de design — **não** é texto jogável.

## Missão principal

**Sobreviver às provas do Vazio** — três provas sequenciais (Realidade, Memória, Vontade), explorar nave fraturada, Portão do Espelho Interior, depois horizonte terminal (cap. 7).

## Sinopse

Sob as Cimeiras, o gelo **abre** numa porta sem dobradiça. A **Nave Fraturada** (`hub_fractured_nave`) é catedral partida no Vazio: colunas rachadas, eco atrasado com voz alheia, fogueira de cinzas espelhadas. Não há altar — há **provas** que só abrem em ordem:

1. **Realidade** (`reality_trial`) → `act6_reality_done`
2. **Memória** (`memory_trial`) → `act6_memory_done`
3. **Vontade** (`will_trial`) → `act6_will_done`

Cada prova deixa **marcas** permanentes conforme desfecho. Com as três concluídas, meta no mapa e nível 31+, abre o **Portão do Espelho Interior** (`mirror_gate`) — confronto com a sombra (`act6_shadow_faced`).

Rotas opcionais: **Ferreiro Dimensional** (após realidade), **pacto no vazio** (corrupção 4+, nível 31+), encontro final com **Kael** (`void_secret_entry`, `kr_won_act6`). Epílogo (`epilogue`) → **Brilho terminal** (act7).

## Tom e pacing

Metafísico, introspectivo, frio sem ser gelo. Provas são dungeons lineares dentro do hub; exploração do mapa `act6_fractured_nave` paralela. Silêncio “partido” — eco repete com intenção errada.

## Personagens

| Papel | Notas |
|-------|-------|
| Eco / espelho | Antagonista interior |
| **Kael** | Rota secreta do vazio |
| Ferreiro dimensional | Forge pós-realidade |
| Mira / Tomás | Fireside `void_camp` |

## Arco narrativo (beats)

1. `opening_void_threshold` → `nave_summons`
2. `hub_fractured_nave` — hub
3. Prova Realidade → Memória → Vontade (sequencial)
4. Exploração + meta `act6_explore_goal_reached`
5. `mirror_gate` — boss espelho
6. `epilogue` → `act7/opening_terminal_glow`

## Hub e exploração

- **Hub:** `act6/hub_fractured_nave`
- **Mapa:** `act6_fractured_nave`
- **Meta:** `act6_explore_goal_reached`
- **Acampamento:** `act6/camp/void_camp`

## Gates de progressão

| Requisito | Conteúdo |
|-----------|----------|
| Nível 26+ | Primeira prova (Realidade) |
| `act6_reality_done` | Memória |
| `act6_memory_done` | Vontade |
| 3 provas + meta + nível 31+ | `mirror_gate` |
| Corrupção 4+, nível 31+ | `void_secret_entry` (pacto) |

## Entrada / saída

- **Entrada:** `act6/opening_void_threshold` (desde `frost_epilogue`)
- **Saída:** `act7/opening_terminal_glow` (`epilogue`)
- **Eixo alternativo:** act8 acessível depois via act7/act5 (quem não fechou magma)

## Cenas-chave

| ID | Função |
|----|--------|
| `act6/hub_fractured_nave` | Hub |
| `act6/reality_trial` | Prova 1 |
| `act6/memory_trial` | Prova 2 |
| `act6/encounters/will_trial` | Prova 3 |
| `act6/mirror_gate` | Clímax act6 |
| `act6/epilogue` | Transição act7 |

## Notas para novas cenas

- Provas **não** reabrem após `*_done` — respeitar flags
- `ambientTheme: void`
- Marcas act6 alimentam tom em act7 (identidade já questionada)
