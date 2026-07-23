#!/usr/bin/env node
/**
 * Gera códigos de resgate para Ko-fi Shop (entrega estática: PDF temático por produto).
 *
 * Uso:
 *   node scripts/generate-kofi-codes.mjs --grant bundle_supporter --count 5
 *   node scripts/generate-kofi-codes.mjs --grant echo_15 --count 10
 *   VITE_SUPPORTER_HMAC_SECRET=... node scripts/generate-kofi-codes.mjs --shop-files
 *   VITE_SUPPORTER_HMAC_SECRET=... node scripts/generate-kofi-codes.mjs --shop-files --format pdf
 *   VITE_SUPPORTER_HMAC_SECRET=... node scripts/generate-kofi-codes.mjs --shop-files --format both
 *
 * Secret: env SUPPORTER_HMAC_SECRET ou VITE_SUPPORTER_HMAC_SECRET (mesmo do build Vite).
 */
import crypto from 'node:crypto';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { writeKofiShopPdf } from './lib/kofi-shop-pdf.mjs';

const FALLBACK_SECRET = 'silent-dungeon-supporter-dev-secret-v1';

/** Slugs alinhados a `SUPPORTER_BUNDLES` em codeGrants.ts — um arquivo por item do Ko-fi Shop. */
const SHOP_GRANTS = [
  'bundle_cosmetic',
  'bundle_convenience',
  'bundle_gameplay',
  'bundle_supporter',
  'bundle_supporter_echo15',
  'echo_5',
  'echo_15',
  'echo_35',
];

const SHOP_GRANT_LABELS = {
  bundle_cosmetic: 'Pacote Cosmético',
  bundle_convenience: 'Pacote Conveniência',
  bundle_gameplay: 'Pacote Jogabilidade',
  bundle_supporter: 'Pacote Apoiador',
  bundle_supporter_echo15: 'Pacote Apoiador + 15 Ecos',
  echo_5: '5 Ecos',
  echo_15: '15 Ecos',
  echo_35: '35 Ecos',
};

function parseArgs(argv) {
  let grant = 'bundle_supporter';
  let count = 1;
  let shopFiles = false;
  let outDir = 'shop/kofi/files';
  /** @type {'pdf' | 'txt' | 'both'} */
  let format = 'pdf';
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--grant' && argv[i + 1]) {
      grant = argv[++i];
    } else if (a === '--count' && argv[i + 1]) {
      count = Math.max(1, Math.floor(Number(argv[++i]) || 1));
    } else if (a === '--shop-files') {
      shopFiles = true;
    } else if (a === '--out-dir' && argv[i + 1]) {
      outDir = argv[++i];
    } else if (a === '--format' && argv[i + 1]) {
      const f = argv[++i];
      if (f === 'pdf' || f === 'txt' || f === 'both') format = f;
    } else if (a === '-h' || a === '--help') {
      console.log(`Uso:
  node scripts/generate-kofi-codes.mjs [--grant <bundle>] [--count N]
  node scripts/generate-kofi-codes.mjs --shop-files [--format pdf|txt|both] [--out-dir shop/kofi/files]

  --shop-files   gera um arquivo por produto (mesmo código para todos os compradores)
  --format       pdf (default), txt ou both
  --out-dir      pasta de saída (default: shop/kofi/files)`);
      process.exit(0);
    }
  }
  return { grant, count, shopFiles, outDir, format };
}

function base64UrlEncode(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function signPayload(payload, secret) {
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(payload), 'utf8'));
  const sig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url').slice(0, 22);
  return `SD-${payloadB64}.${sig}`;
}

function makeCode(grant, secret) {
  const payload = { id: randomUUID(), grants: [grant] };
  return signPayload(payload, secret);
}

function shopFileBody(grant, code) {
  const label = SHOP_GRANT_LABELS[grant] ?? grant;
  return `A Masmorra do Silêncio — ${label}

Obrigado pela compra!

1. Abra o jogo (itch.io ou build local)
2. Menu → Loja do Apoiador
3. Cole o código abaixo e toque em Resgatar

Código:
${code}

---
Silent Dungeon — ${label}

Thank you for your purchase!

1. Open the game (itch.io or local build)
2. Menu → Supporter Shop
3. Paste the code below and tap Redeem

Code:
${code}
`;
}

const { grant, count, shopFiles, outDir, format } = parseArgs(process.argv);
const secret =
  process.env.SUPPORTER_HMAC_SECRET?.trim() ||
  process.env.VITE_SUPPORTER_HMAC_SECRET?.trim() ||
  FALLBACK_SECRET;

if (shopFiles) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const shopGrant of SHOP_GRANTS) {
    const code = makeCode(shopGrant, secret);
    if (format === 'txt' || format === 'both') {
      const txtPath = path.join(outDir, `${shopGrant}.txt`);
      fs.writeFileSync(txtPath, shopFileBody(shopGrant, code), 'utf8');
      console.log(`# ${shopGrant} → ${txtPath}`);
    }
    if (format === 'pdf' || format === 'both') {
      const pdfPath = path.join(outDir, `${shopGrant}.pdf`);
      await writeKofiShopPdf({ grant: shopGrant, code, outPath: pdfPath });
      console.log(`# ${shopGrant} → ${pdfPath}`);
    }
  }
  console.log(`\nAnexe cada PDF ao produto correspondente no Ko-fi Shop (Assets → upload).`);
  process.exit(0);
}

console.log(`# grant=${grant} count=${count}`);
for (let i = 0; i < count; i++) {
  console.log(makeCode(grant, secret));
}
