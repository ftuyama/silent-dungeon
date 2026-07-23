#!/usr/bin/env node
/**
 * Gera preview images 600x600 para produtos do Ko-fi Shop.
 *
 * Uso:
 *   node scripts/generate-kofi-shop-previews.mjs
 *   node scripts/generate-kofi-shop-previews.mjs --out-dir shop/kofi/previews
 */
import { writeKofiShopPreviews } from './lib/kofi-shop-preview.mjs';

function parseArgs(argv) {
  let outDir = 'shop/kofi/previews';
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out-dir' && argv[i + 1]) outDir = argv[++i];
    else if (a === '-h' || a === '--help') {
      console.log(`Uso: node scripts/generate-kofi-shop-previews.mjs [--out-dir shop/kofi/previews]`);
      process.exit(0);
    }
  }
  return { outDir };
}

const { outDir } = parseArgs(process.argv);
const written = await writeKofiShopPreviews({ outDir });
for (const grant of [
  'bundle_cosmetic',
  'bundle_convenience',
  'bundle_gameplay',
  'bundle_supporter',
  'bundle_supporter_echo15',
  'echo_5',
  'echo_15',
  'echo_35',
]) {
  console.log(`# ${grant} → ${outDir}/${grant}.png`);
}
console.log(`\nUpload em Ko-fi Shop → Preview images (600x600 recomendado).`);
