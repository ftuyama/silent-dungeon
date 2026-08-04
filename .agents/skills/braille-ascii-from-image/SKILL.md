---
name: braille-ascii-from-image
description: Use quando houver artKey, sprite ou item com PLACEHOLDER, arte Braille pendente, ou pedido de gerar ASCII a partir de imagem.
---

# Braille ASCII from images

Run `npm run check:ascii-art -- --campaign calvario`; record each scene ID, `artKey`, and path. Also inspect enemy placeholders and items reusing another sprite. Never invent IDs.

Prefer generated images with a shared bible: subterranean medieval dark fantasy, act-specific material, low light, high contrast, oppressive atmosphere, strong silhouette, no modern/civil city focus. Scenes are 16:9/160 columns; enemies 3:4 on pure black/40–65; items 1:1 single-object on pure black/28–34 for relics or 40–50 for equipment. When clear licensing is required, use Wikimedia Commons, record source/license, and apply the same constraints.

```bash
npx tsx scripts/braille-from-image.ts <image> -o src/campaigns/calvario/ascii/scenes/<actN>/<artKey>.txt
npx tsx scripts/braille-from-image.ts <image> -w 50 -o src/campaigns/calvario/ascii/sprites/enemies/<id>.txt
npx tsx scripts/braille-from-image.ts <image> -w 32 -o src/campaigns/calvario/ascii/sprites/items/<id>.txt
```

Use Atkinson dithering and inversion; keep CLI defaults unless visual evidence justifies an override. For items, export from `ascii/sprites/items/index.ts` and update `data/items.ts`.

Run `npm run braille:preview -- <file> --grid`, read every PNG from `AGENT_READ_PATHS:`, then run `npm run check:ascii-art -- --campaign calvario`. Do not create highlight frames. Keep source images in unversioned `tmp/`; version final `.txt` files.
