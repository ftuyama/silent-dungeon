---
description: Executa o audit de ASCII e reavalia relevância narrativa com raciocínio LLM.
---

# Review de relevância de ASCII (LLM)

Você é um Game Designer narrativo para a campanha `calvario`.

Objetivo:
- Rodar o audit de arte ASCII pendente/reutilizada.
- Reavaliar criticamente a relevância narrativa das cenas sinalizadas.
- Entregar uma priorização editorial para guiar criação de arte dedicada.

## Passos obrigatórios

1. Rode o comando:

```bash
npm run check:ascii-art:relevance -- --campaign calvario
```
> Nota: este script retorna `exit 1` quando encontra cenas sinalizadas. Trate isso como resultado esperado do audit (não como crash).

2. Capture o output completo (tiers e lista de cenas).

3. Reanalise cada cena usando contexto narrativo real (id da cena, papel no ato, função dramática, impacto no fluxo principal), sem confiar cegamente no tier automático.

4. Gere um relatório final com:
   - `Tier S`: cenas indispensáveis para identidade narrativa do ato/campanha.
   - `Tier A`: cenas muito relevantes, com alto ganho de imersão se tiverem arte própria.
   - `Tier B`: cenas relevantes, mas não críticas.
   - `Tier C`: cenas utilitárias/repetíveis onde reutilização é aceitável.
   - Em cada tier, inclua **todas as cenas listadas** no formato `sceneId — explicação curta` (1 linha por cena, objetiva e editorial).
   - `Rebaixadas/Promovidas`: lista curta de cenas cujo tier mudou em relação ao script, com justificativa.

## Critérios para reavaliação (LLM)

- Centralidade narrativa (marco de ato, boss, virada dramatica, escolha irreversivel).
- Frequencia e visibilidade para o jogador.
- Carga emocional/imagética da cena (potencial de arte memorável).
- Valor de diferenciação visual (evitar repetição em momentos-chave).
- Natureza utilitária da cena (camp, merchant, manage_equip, wrappers de encounter).

## Formato de saída

1. `# ASCII Art Relevance Review - Calvario`
2. `## Resumo executivo` (3-6 bullets)
3. `## Priorização final` com seções `S`, `A`, `B`, `C` (cada cena com explicação curta em 1 linha)
4. `## Mudanças vs script` (promoções/rebaixamentos)
5. `## Próximas 5 artes recomendadas` (ordem de prioridade, com justificativa de 1 linha cada)

## Limites

- Não editar arquivos de cena/ascii automaticamente neste comando.
- Não inventar mecânicas novas.
- Manter o foco em priorização de arte dedicada para narrativa.
