# Act 7 — Decidir o destino do céu

> README para agentes de IA. Resumo do enredo e referências de design — **não** é texto jogável.

## Missão principal

**Decidir o destino do céu** — descampo procedural, bifurcação apocalíptica, destino terminal (finais **incompletos** se não fechar act8).

## Sinopse

Sair da nave não continua o mundo — **cobra**. O céu cheira a papel queimado; nuvens ameaçam sem chover (`opening_terminal_glow`). Em `apocalypse_fork`, não há terceira via neutra: **coser o firmamento** (`path_stitch_sky` — prova de Mente; `act7_sky_stitch_true` ou `_torn`) ou **alimentar o fogo interior** (`path_ember_devour` — corrupção, `act7_ember_witness`).

Entre a abertura e o horizonte final, o **descampo** (`wasteland_router`) sorteia eventos únicos via `randomBranch`: sermão de cinza, linha oca, sino silencioso, dízimo de brasa, último trem, etc. Cada evento grava uma **mark** act7.

Em `before_final_horizon`, o jogador pode:
- **Descer ao magma** (act8) — recusar final incompleto no céu
- Escolher **destino terminal** no céu: pagar fé (`act7_paid_sky_in_faith`), selar-se em brasa (`act7_sealed_in_ember`), ou caminhar nu (`act7_walked_bare`) → `epilogue_apocalypse`

**Importante:** fechar só act7 é final **incompleto** — o eixo desce ao magma; act8 é o fecho verdadeiro das profundezas.

## Tom e pacing

Apocalipse íntimo, não blockbuster. Descampo = pequenos pecados gravados. Ash sky, vento que para para ouvir. Menos mapa, mais router e escolhas irreversíveis.

## Personagens

| Papel | Notas |
|-------|-------|
| Vozes do descampo | Eventos aleatórios, sem rosto fixo |
| Hollow / cinza | `fight_hollow_intro`, `event_ash_sermon` |
| Herói | Testemunha, não salvador garantido |

## Arco narrativo (beats)

1. `opening_terminal_glow` — cap. 7
2. `apocalypse_fork` — escolha coser vs fogo
3. `wasteland_router` — eventos até mark ou `before_final_horizon`
4. `before_final_horizon` — magma vs epílogo céu
5. `epilogue_apocalypse` — final incompleto (se não for act8)

## Eventos do descampo (marks)

| Mark | Evento típico |
|------|----------------|
| `act7_heard_ash_sermon` | Sermão de cinza |
| `act7_broke_hollow_line` | Linha oca |
| `act7_last_train_rider` | Último trem (ouro ≥3) |
| `act7_sky_stitch_true` / `_torn` | Coser céu |
| `act7_ember_witness` | Devorar brasa |
| `act7_paid_sky_in_faith` | Pagar céu com fé |
| `act7_sealed_in_ember` | Selo em brasa |
| `act7_walked_bare` | Passo sem oferta |

## Gates de progressão

- Explorar descampo: qualquer mark de evento OU chegar `before_final_horizon`
- Destino terminal: uma das três marks de `before_final_horizon`
- Act8: `hasStoryPath: throne` + escolha descer (desde act7, act5 ou act4)

## Entrada / saída

- **Entrada:** `act7/opening_terminal_glow` (desde `act6/epilogue`)
- **Saída completa:** via act8 (`magma_lord_slain`)
- **Saída incompleta:** `act7/epilogue_apocalypse`
- **Ponte act8:** `before_final_horizon` → `act8/opening_magma_throat` ou hub

## Cenas-chave

| ID | Função |
|----|--------|
| `act7/apocalypse_fork` | Bifurcação moral |
| `act7/wasteland_router` | Hub procedural |
| `act7/before_final_horizon` | Última escolha céu vs magma |
| `act7/epilogue_apocalypse` | Epílogo curto (incompleto) |

## Notas para novas cenas

- `ambientTheme: ash_sky`
- Eventos wasteland: preferir `addMark` + condição `noMark` no router
- Prosa deve lembrar que magma ainda espera — não vender act7 como ending total
