---
name: braille-ascii-from-image
description: >-
  Gera arte ASCII Braille de cena (artKey), sprite de inimigo ou sprite de item
  a partir de imagens IA com bible visual e braille-from-image.ts. Use quando
  houver PLACEHOLDER, artKey pendente, item a reutilizar sprite alheio, check:ascii-art
  a falhar, ou pedido de gerar ASCII / sprites actN / itens.
---

# Braille ASCII a partir de imagem (IA + CLI)

Fecha pendências de `artKey` / sprites PLACEHOLDER com **consistência temática**, não fotos aleatórias.

| Abordagem | Quando |
|-----------|--------|
| **Esta skill** | Gerar + converter arte de cena ou sprite |
| [braille-pending-ascii](../../commands/braille-pending-ascii.md) | Alternativa: Wikimedia (licença) em vez de IA |
| [ascii-highlight-workflow](../ascii-highlight-workflow/SKILL.md) | Depois: frames `*_hl*.txt` / overlay |

## 1. Inventário

```bash
npm run check:ascii-art -- --campaign calvario
```

Por cada pendência: `sceneId`, `artKey`, path do `.md`. Lê título + 1–2 frases do corpo (pt-BR) para o prompt.

Sprites inimigo: `ascii/sprites/enemies/<id>.txt` só `PLACEHOLDER` (o check de cenas **não** os lista).

**Itens:** o check de cenas **não** cobre itens. Inventário manual — em `data/items.ts`, cada `id` deve ter `ascii/sprites/items/<id>.txt` + export em `sprites/items/index.ts`. Itens que apontam `sprite: itemSprites.<outro>` estão **em falta** (reuso) até terem ficheiro próprio.

Não inventar `artKey` / ids novos — só preencher o que o check / utilizador / reuso indicar.

## 2. Bible visual (todas as imagens)

Reutilizar o mesmo bloco em cada prompt:

- Dark fantasy medieval subterrânea; tom do **ato** (ex. magma/basalto, gelo, cinza, void)
- Luz baixa, contraste alto (bom para dither Atkinson), atmosfera opressiva
- Sem cidade, skyline, arquitetura civil moderna, interiores domésticos
- Foco em ambiente / silhueta; poucos ou nenhum personagem (excepto boss / mercador se a cena exigir)

**Cenas:** `aspect_ratio` **16:9**, paisagem.  
**Sprites inimigo:** `aspect_ratio` **3:4**, sujeito centrado em fundo **preto puro**, sem cenário.  
**Sprites item (menores):** `aspect_ratio` **1:1**, **um único objecto** centrado em fundo **preto puro**, sem cenário, sem UI, silhueta clara (ícone de inventário).

## 3. Gerar imagens

1. `GenerateImage` com bible + detalhe da cena/inimigo (nome + 1 frase).
2. Copiar PNGs para `tmp/<batch>-refs/`, `tmp/<batch>-sprites/` ou `tmp/<batch>-items/`.
3. Não versionar `tmp/`.

## 4. Converter

Defaults = painel Conversão (`devToolsBrailleAscii.ts`): dither `atkinson`, threshold `115`, invert on.

**Cena** (largura **160**):

```bash
npx tsx scripts/braille-from-image.ts tmp/<batch>-refs/<artKey>.png \
  -o src/campaigns/calvario/ascii/scenes/<actN>/<artKey>.txt
```

**Sprite inimigo** (largura tipica **40–65**):

```bash
npx tsx scripts/braille-from-image.ts tmp/<batch>-sprites/<id>.png \
  -w 50 \
  -o src/campaigns/calvario/ascii/sprites/enemies/<id>.txt
```

**Sprite item (menor)** — peer `morvayn_heart_shard` (~30 cols) / armas (~40–50):

```bash
npx tsx scripts/braille-from-image.ts tmp/<batch>-items/<id>.png \
  -w 32 \
  -o src/campaigns/calvario/ascii/sprites/items/<id>.txt
```

| Tipo | `-w` sugerido |
|------|----------------|
| Relíquia / mapa / anel / poção-ícone | **28–34** |
| Arma / armadura item | **40–50** |
| Criatura pequena | 40–45 |
| Golem / médio | 48–55 |
| Boss | 55–65 |
| Cena | 160 |

Depois de criar o `.txt` de item: export em [`sprites/items/index.ts`](../../../src/campaigns/calvario/ascii/sprites/items/index.ts) e `sprite: itemSprites.<id>` em [`data/items.ts`](../../../src/campaigns/calvario/data/items.ts).

Basename do `.txt` = `artKey` / id. Pasta de cena = acto (`act8/`, …).

## 5. Verificar

```bash
npm run braille:preview -- src/campaigns/calvario/ascii/scenes/<actN>/<artKey>.txt --grid
```

Localizar `AGENT_READ_PATHS:` e **Read** cada PNG. Silhueta deve ser reconhecível (não ruído puro).

```bash
npm run check:ascii-art -- --campaign calvario   # → OK
```

Não criar `artHighlightFrames` neste fluxo (trabalho separado).

## 6. Persistência

Os `.txt` finais em `ascii/scenes/` e `ascii/sprites/` **devem ser commitados**. `tmp/` não. Se os ficheiros voltarem a `PLACEHOLDER`, re-converter a partir das PNGs em `tmp/` se ainda existirem.

## Critério de sucesso

- Nenhum alvo com conteúdo só `PLACEHOLDER`
- `check:ascii-art` OK (cenas)
- Itens: cada id (exceto upgrades intencionais) com `.txt` próprio + export + `sprite: itemSprites.<id>`
- Preview legível nos pontos críticos (hub / boss / abertura do acto / ícone de item)
