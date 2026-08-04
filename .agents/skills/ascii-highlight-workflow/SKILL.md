---
name: ascii-highlight-workflow
description: Use ao criar ou revisar artHighlightFrames, animação Braille, contornos, arcos, portas, silhuetas ou alinhamento de overlay highlight.
---

# ASCII highlight workflow

Resolve campaign (default `calvario`), `artKey`, scene, 3–6 frames, and hold duration (existing value or 2400; allowed 400–8000). If the base is absent and no image was supplied, stop.

1. Normalize the base to line count `L` and code-point width `C`.
2. Write `<artKey>_hl0.txt` as the normalized base.
3. For micro animation, derive each frame from its predecessor with at most six one-character substitutions (prefer 2–4). Never insert, change dimensions, or alter readable text.
4. For macro contour motion such as an opening arch/door, the six-cell limit does not apply; visual alignment and identical dimensions take priority.
5. Update frontmatter with `highlight: true`, base `artKey`, all frame keys, and `highlightHoldMs`.

Generate preview with `npm run highlight:preview-session -- --base "<base>"` and read every PNG from `AGENT_READ_PATHS:` before judging. Iterate if the requested contour or sequence is unclear.

Use `npm run lint:highlight-frames -- --mode strict --glob "<frames>" --base "<base>"` for micro animation or `--mode dims` for macro animation. Finish with `npm run check:ascii-art -- --campaign calvario` and `npm run validate:scenes -- --campaign calvario`.
