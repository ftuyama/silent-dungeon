---
name: ascii-relevance-review
description: Use quando o usuário pedir auditoria, priorização ou revisão editorial da relevância de arte ASCII da campanha calvario.
---

# ASCII relevance review

Run `npm run check:ascii-art:relevance -- --campaign calvario`. Exit code 1 is expected when scenes are flagged. Capture all tiers and scenes, then read real scene context and reassess rather than trusting automatic tiers.

Classify every listed scene:

- S: indispensable campaign/act identity.
- A: highly relevant and strong immersion gain.
- B: relevant but noncritical.
- C: utility/repeatable scene where reuse is acceptable.

Consider narrative centrality, frequency, emotional/visual load, differentiation value, and utility roles such as camp, merchant, equipment management, and encounter wrappers.

Output `# ASCII Art Relevance Review - Calvario`, a 3–6 bullet summary, all scenes under S/A/B/C as `sceneId — explanation`, promotions/demotions with reasons, and the next five recommended dedicated artworks. Do not edit scenes or ASCII files and do not invent mechanics.
