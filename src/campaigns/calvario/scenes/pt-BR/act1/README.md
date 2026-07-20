# Act 1 — Descer na masmorra

> README para agentes de IA. Resumo do enredo e referências de design — **não** é texto jogável.

## Missão principal

**Descer na masmorra** — escolher juramento (classe), alcançar a boca da pedra e entrar na catacumba (cap. 2).

## Sinopse

A campanha abre na **superfície**: a cidade finge rotina enquanto um **pulso verde** sobe da garganta subterrânea. O herói desce degraus úmidos, passa pelo **espelho d'água** (`class_gate`) e escolhe entre Cavaleiro, Mago, Clérigo ou Arqueiro — cada um com juramento e bônus distintos. Depois atravessa corredores espelhados, sussurros da superfície e runas na entrada até a **boca da masmorra** (`dungeon_mouth`), onde braseiro e sino cego oferecem riscos opcionais antes de cruzar para o capítulo 2.

O **Silêncio** é tema desde o primeiro beat: não é mood genérico, é o que a masmorra impõe e o que a superfície evita nomear.

## Tom e pacing

Prologo curto, sensorial, segunda pessoa. 1–2 frases por beat; pouco combate até a boca. Escolhas são **ações** (descer, examinar, respirar), não poemas. Sem facções ainda — só presságio de ordens e culto nas runas.

## Personagens

| Papel | Cenas |
|-------|-------|
| Herói (`{{playerName}}`) | Todo o ato |
| Eco da superfície | `surface_whisper`, `title_examine` |
| Morvayn (nome apenas) | Rumor no ar, ainda ausente |

## Arco narrativo (beats)

1. `title` — abertura; descer ou examinar símbolos
2. `class_gate` — escolha de classe (obrigatória)
3. `crawl_entrada` / espelhos — descida física
4. `dungeon_mouth` — hub de transição; riscos opcionais (braseiro, sino)
5. `catacomb_entry` — fim do ato; capítulo 2

## Gates de progressão

- Classe: `party[0].class` definida em `pick_*`
- Boca: visitar `act1/dungeon_mouth`
- Saída: `act2/catacomb_entry` → `setChapter: 2`, −1 suprimento

## Entrada / saída

- **Entrada:** `index.json` → `entryScene` (tipicamente `act1/title`)
- **Saída:** `act2/catacomb_entry`

## Cenas-chave

| ID | Função |
|----|--------|
| `act1/title` | Abertura, overlay ASCII |
| `act1/class_gate` | Escolha de classe |
| `act1/dungeon_mouth` | Transição; riscos `risk_brazier`, `risk_bell` |
| `act2/catacomb_entry` | Primeiro cruzeiro (cap. 2) |

## Notas para novas cenas

- IDs e paths em **inglês**; prosa em **pt-BR**
- `chapter: 1` em todo frontmatter deste ato
- Não introduzir mecânicas fora do schema
- Novo `artKey` = beat distinto; variantes `_ok`/`_fail` podem compartilhar
