---
name: calvario-progress-report
description: Use quando o usuário pedir análise de progressão, curva de XP, dificuldade, gates, agência ou comparação de classes na campanha calvario.
---

# Calvario progress report

This workflow is read-only. Run `npm run report:progression -- --json`, adding `--act N` or `--class knight|mage|cleric` when requested. For class comparisons, run each requested class and compare difficulty and entry HP.

Render: `Ato | Título | Nível ent→sai | XP a ganhar | Encontros mandat. (XP) | Encontros random est. | Movim. mapa est. | Tempo (min) | Dificuldade | Escolhas (total / gated %)`.

Add 3–6 evidence-based findings about XP bottlenecks, difficulty spikes (`toughest`), optional-choice density, and whether level gates match the XP curve. List all script warnings. Optional design changes must be labeled `Hipóteses, não implementar agora`.

Output in pt-BR with title `# Relatório de progressão — Calvário (<data>)`, then the table, `## Achados`, optional hypotheses, and `## Warnings`. Do not edit scenes, data, or engine files. A script warning is reportable and does not by itself block the report.
