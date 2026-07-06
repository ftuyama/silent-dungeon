---
description: Modo agente — gera artHighlightFrames a partir do arte base (opcionalmente imagem→Braille), algoritmo fixo, validação em loop até passar.
---

# Quadros `artHighlightFrames` — automação total (agente)

Este comando é para o **agente** executar ponta a ponta, sem passos manuais do utilizador além do pedido inicial (e opcionalmente indicar caminho de imagem no disco para regenerar o base). Regras de produto e motor: ver [ascii-highlight-frames.md](ascii-highlight-frames.md).

**Visão:** o agente **não** deve pedir anexos ao utilizador. Gera PNGs com `highlight:preview-session` ou `braille:preview`, lê-os com **Read** (imagem) e só então avalia contorno / conclui.

## Inputs (obrigatório indicar no chat)

1. **Campanha:** por defeito `calvario` (ajustar caminhos e flags `--campaign` se outra).
2. **`artKey`:** explícito **ou** inferido do frontmatter de `@cena.md` (campo `artKey` do corpo da cena).
3. **`frameCount`:** inteiro entre **3** e **6** (número de ficheiros `*_hl0` … `*_hlN`; mínimo 3 para animação estável com respiro).
4. **`highlightHoldMs`:** opcional (400–8000); se omitido, usar **2400** ou o valor já presente na cena.
5. **Cena `.md`:** caminho do ficheiro a atualizar (ex. `src/campaigns/calvario/scenes/act1/foo.md`), se aplicável.
6. **Imagem (opcional):** ficheiro no disco (caminho absoluto ou relativo à raiz do repo) — só para **regenerar o arte base** antes dos quadros; ver secção «Imagem opcional».

### Visão obrigatória (agente, sem anexos)

1. **Gatilhos** (correr preview + Read se qualquer um se aplicar): `highlight`, `artHighlightFrames`, ficheiros `*_hl*.txt`, pedidos de **contorno** / **arco** / **porta** / **boca** / **silhueta** / **alinh** / animação da arte, ou após escrever quadros no passo C.
2. Na raiz do repo:

   ```bash
   npm run highlight:preview-session -- --base "src/campaigns/calvario/ascii/scenes/<subdir>/<artKey>.txt"
   ```

   Gera `tmp/ascii-preview/*.png` (grelha por defeito) para o **base** e todos os `<artKey>_hl*.txt` na mesma pasta.
3. Na saída do terminal, usar a linha **`AGENT_READ_PATHS:`** (caminhos relativos separados por `|`).
4. Invocar **Read** em **cada** PNG antes de considerar o contorno validado ou de encerrar a tarefa.

Para um único `.txt`:

```bash
npm run braille:preview -- src/.../<artKey>.txt --grid
```

(também imprime `AGENT_READ_PATHS:…`.)

### Melhorar a qualidade (utilitários)
- **Hotspots objectivos:** antes de editar quadros, correr na raiz do repo (ajusta caminhos):

  ```bash
  npm run highlight:hotspots -- path/para/ref.png --base src/campaigns/calvario/ascii/scenes/act1/<artKey>.txt --top 24
  ```

  Só aplicável se existir ficheiro de imagem no repo ou caminho fornecido pelo utilizador; o agente pode correr o comando e usar a lista `row col` para priorizar células.

- **Preview PNG + grelha:** ver secção «Visão obrigatória»; saída em `tmp/ascii-preview/` (gitignored).

- **Lint local:** modo **strict** (defeito) = dimensões + no máximo 6 alterações entre pares. Modo **dims** = só dimensões + `hl0` = base; imprime diffs como *info* (animação **macro**, ex. porta/arco — muitas células por frame é aceitável desde que o contorno case):

  ```bash
  npm run lint:highlight-frames -- --mode strict --glob "…/<artKey>_hl*.txt" --base "…/<artKey>.txt"
  npm run lint:highlight-frames -- --mode dims --glob "…/<artKey>_hl*.txt" --base "…/<artKey>.txt"
  ```

- **Skill de fluxo:** [.cursor/skills/ascii-highlight-workflow/SKILL.md](../skills/ascii-highlight-workflow/SKILL.md) — quando usar scripts vs imagem vs MCP.

## Constantes do algoritmo (não negociar)

- **`K_max`:** no máximo **6** células Braille alteradas entre o quadro `hl(N-1)` e `hlN` (para `N ≥ 1`). Uma «célula» = uma posição `(linha, coluna)` na grelha monoespaçada; só pode mudar o carácter nessa posição. Preferir **2–4** alterações quando bastar.
- **`L`, `C`:** após ler o base normalizado (passo A), **todos** os quadros têm exatamente `L` linhas e cada linha tem exatamente `C` code points (padding com U+0020 à direita).

## Proibições explícitas

- Não reformatar, quebrar linhas ou alterar `L` ou `C` entre quadros.
- Não reescrever um quadro inteiro «de memória»; sempre **cópia do anterior** + ≤ `K_max` substituições pontuais.
- Não mudar o conteúdo narrativo de texto legível na arte (se existir); só variações decorativas / luz.

### Excepção explícita — animação «macro» (contorno)

Se o utilizador pedir **abertura**, **arco**, **silhueta da porta**, etc., o `K_max` de 6 células **não** aplica: priorizar contorno correcto (`highlight:preview-session` + **Read** dos PNG). O agente deve:

1. Correr `lint:highlight-frames` com `--mode dims` (e `--base`) até passar.
2. Só usar modo `strict` + `K_max` quando o briefing for **respiração** / vibração mínima.

---

## Fluxo obrigatório do agente

### A — Resolver caminhos e ler base

1. Determinar `artKey` e o ficheiro base `src/campaigns/calvario/ascii/scenes/<subdir>/<artKey>.txt` (procurar sob `ascii/scenes/` se houver subpastas, ex. `act1/`).
2. Se o ficheiro base **não existir** e não houver imagem para o criar: **parar** e reportar bloqueio.
3. Ler o conteúdo UTF-8 do base. Calcular:
   - `L` = número de linhas (após `split` por newline; se o ficheiro não terminar em newline, a última linha conta na mesma).
   - `C` = máximo das larguras em **code points** por linha (JavaScript: spread string length).
4. Construir **texto base normalizado:** cada uma das `L` linhas padded a `C` com espaços à direita; **sem** trim final das linhas intermediárias que o utilizador possa querer preservar — apenas pad à direita até `C`.

### B — Imagem opcional (só antes de gerar `*_hlN`)

Se o utilizador forneceu imagem (path ou anexo tratável como ficheiro temporário gravável pelo agente):

1. Correr na raiz do repo:

```bash
npx tsx scripts/braille-from-image.ts "<caminho_imagem>" -w <C_ou_valor_próximo> -o "src/campaigns/calvario/ascii/scenes/<caminho_rel>/<artKey>.txt" --dither atkinson
```

2. Usar `-w` tal que o resultado se aproxime da largura desejada: o CLI gera largura em **células Braille** = `asciiWidth`; cada linha do `.txt` tem `asciiWidth` caracteres. Escolher `asciiWidth = C` alvo se já existia base; se arte nova, o utilizador pode ter indicado `C` — senão usar default do script (**160**) e **re-medir** `L` e `C` no output, depois usar esse texto como base normalizado (re-pad todas as linhas ao mesmo `C` = max width do output).
3. **Não** apagar o backup: se substituir um base existente, o agente pode guardar cópia só se o utilizador pedir; caso contrário sobrescrever conforme pedido é aceitável.

Se **não** houver imagem: o texto base normalizado vem só do passo A.

### C — Gerar quadros `*_hlN.txt`

Convenção de chaves: `<artKey>_hl0`, …, `<artKey>_hl<frameCount-1>`.

1. **`hl0`:** conteúdo **idêntico** ao texto base normalizado (garante alinhamento com o corpo `artKey` no diário).
2. Para `n = 1 … frameCount-1`:
   - Começar com o conteúdo completo de `hl(n-1)`.
   - Aplicar no máximo `K_max` substituições de **um** carácter cada, em posições distintas `(row, col)`, escolhidas para sugerir luz/brasa/respiração sem destruir silhueta.
   - Garantir que cada linha continua com comprimento `C` (substituir carácter, não inserir).
3. Escrever ficheiros em paralelo à localização do base (mesma pasta), nomes: `<artKey>_hl0.txt`, …

### V — Pré-visualização e Read (obrigatório após C)

1. Correr `npm run highlight:preview-session -- --base "<caminho absoluto ou relativo ao repo do arte base .txt>"`.
2. Ler **cada** ficheiro listado após `AGENT_READ_PATHS:` usando a ferramenta **Read** sobre o PNG (visão).
3. Se o contorno ou a sequência visual falharem o critério do utilizador, voltar ao passo **C** e repetir **V** antes de declarar sucesso.

### D — Frontmatter na cena

Atualizar (ou criar patch) o `.md` da cena com pelo menos:

```yaml
highlight: true
artKey: <artKey>
artHighlightFrames: [<artKey>_hl0, <artKey>_hl1, ...]
highlightHoldMs: <valor acordado>
```

Manter `artKey` do corpo coerente com o ficheiro base usado.

### E — Validação em loop (obrigatório)

1. Na raiz do repo, correr **em sequência**:

```bash
npm run check:ascii-art -- --campaign calvario
npm run validate:scenes -- --campaign calvario
```

2. Se **ambos** exit code 0: **terminar com sucesso** (resumir ficheiros tocados).
3. Se qualquer falhar: analisar o output; corrigir **apenas** o mínimo (ficheiros `.txt` ou YAML da cena). Se alteraste `.txt` de arte/highlight, repetir **V**; **voltar ao passo E.1**.
4. Máximo **5** ciclos E.1–E.3. Se após 5 ciclos ainda falhar: **parar** e reportar o último output de erro completo (bloqueio).

---

## Critério de paragem

- **Sucesso:** `check:ascii-art` e `validate:scenes` passam no mesmo ciclo.
- **Bloqueio:** após 5 ciclos de correção, ou base em falta sem imagem, ou erro fora do âmbito dos ficheiros de arte/cena.

## Nota sobre qualidade

Este modo maximiza **conformidade** (dimensões, diffs pequenos, scripts verdes). Poesia visual extra depende do modelo; dentro do algoritmo, preferir poucas mudanças bem colocadas a muitas.
