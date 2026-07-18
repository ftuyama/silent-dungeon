---
description: Gera arte ASCII Braille pendente (cenas, sprites inimigo e itens menores) com IA + braille-from-image.ts.
---

# Gerar ASCII Braille (IA → conversão)

Segue a skill [braille-ascii-from-image](../skills/braille-ascii-from-image/SKILL.md). Não editar a skill neste comando — executar o fluxo.

## Briefing

Usa os argumentos do comando se existirem (ex.: `--campaign calvario`, acto, lista de `artKey`, `scenes` / `sprites` / `both`).  
Default: **calvario**, fechar tudo o que `check:ascii-art` marcar como pendente; sprites PLACEHOLDER / itens com sprite reutilizado se o utilizador pedir.

## Passos (obrigatório)

1. **Inventário** — `npm run check:ascii-art -- --campaign <id>`. Listar `artKey` + cena. Sprites: `PLACEHOLDER` em `ascii/sprites/enemies/`. Itens: em `data/items.ts`, ids cujo `sprite` aponta para **outro** id (reuso) = em falta.
2. **Bible** — bloco visual partilhado + 1 detalhe por arte (cena / inimigo / nome do item).
3. **Gerar** — `GenerateImage` (cenas 16:9; inimigos 3:4; **itens 1:1**, objecto único, fundo preto — **menores**). Guardar em `tmp/<batch>-refs|sprites|items/`.
4. **Converter** — `npx tsx scripts/braille-from-image.ts …`  
   - cenas: `-w 160` → `ascii/scenes/<actN>/<artKey>.txt`  
   - inimigos: `-w 40–65` → `ascii/sprites/enemies/<id>.txt`  
   - itens: `-w 28–34` (relíquia) ou `40–50` (arma/armadura) → `ascii/sprites/items/<id>.txt` + export em `index.ts` + `items.ts`
5. **Preview** — `npm run braille:preview -- … --grid` + **Read** nos `AGENT_READ_PATHS:`.
6. **Check** — `npm run check:ascii-art` → `OK` (cenas); itens: confirmar ficheiro + export + referência.

## Restrições

- Não inventar `artKey` / ids de inimigo.
- Não gerar `artHighlightFrames` aqui.
- Não commitir `tmp/`; os `.txt` Braille sim (avisar o utilizador se pedirem commit).
- Alternativa Wikimedia: comando [braille-pending-ascii](braille-pending-ascii.md).
