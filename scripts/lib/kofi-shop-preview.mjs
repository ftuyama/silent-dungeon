import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { SHOP_GRANT_COPY } from './kofi-shop-pdf.mjs';

const SIZE = 600;

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

const C = {
  bg: '#0a0c0b',
  bgInset: '#121410',
  fg: '#c9b89a',
  muted: '#9a9688',
  emphasis: '#e0d4b8',
};

/** Cor de destaque por familia de produto. */
const ACCENT = {
  bundle_cosmetic: '#a89060',
  bundle_convenience: '#7a8a98',
  bundle_gameplay: '#9a6868',
  bundle_supporter: '#6e8f6a',
  bundle_supporter_echo15: '#6e8f6a',
  echo_5: '#5a8f7b',
  echo_15: '#5a8f7b',
  echo_35: '#5a8f7b',
};

const KICKER = {
  bundle_cosmetic: 'COSMETICO',
  bundle_convenience: 'CONVENIENCIA',
  bundle_gameplay: 'JOGABILIDADE',
  bundle_supporter: 'APOIADOR',
  bundle_supporter_echo15: 'APOIADOR + ECOS',
  echo_5: 'ECOS',
  echo_15: 'ECOS',
  echo_35: 'ECOS',
};

function esc(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapLabel(label, maxChars = 22) {
  const words = label.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function echoHero(grant) {
  const m = grant.match(/^echo_(\d+)$/);
  return m ? m[1] : null;
}

function buildPreviewSvg(grant, label) {
  const accent = ACCENT[grant] ?? C.fg;
  const kicker = KICKER[grant] ?? 'LOJA';
  const hero = echoHero(grant);
  const lines = wrapLabel(label);

  const titleLines = lines
    .map((line, i) => {
      const y = 268 + i * 42;
      const size = i === 0 && lines.length === 1 ? 34 : 28;
      return `<text x="300" y="${y}" text-anchor="middle" fill="${C.emphasis}" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" font-weight="700">${esc(line)}</text>`;
    })
    .join('\n');

  const heroBlock = hero
    ? `<text x="300" y="250" text-anchor="middle" fill="${accent}" font-family="Georgia, serif" font-size="88" font-weight="700">${hero}</text>
       <text x="300" y="310" text-anchor="middle" fill="${C.fg}" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="6">ECOS</text>`
    : titleLines;

  const subtitleBlock =
    hero
      ? `<text x="300" y="360" text-anchor="middle" fill="${C.muted}" font-family="Helvetica, Arial, sans-serif" font-size="14">Saldo permanente entre runs</text>`
      : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0e100f"/>
      <stop offset="100%" stop-color="#080908"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="45%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)"/>
  <rect x="24" y="24" width="552" height="552" fill="none" stroke="${accent}" stroke-width="2" opacity="0.55"/>
  <rect x="32" y="32" width="536" height="536" fill="none" stroke="${accent}" stroke-width="1" opacity="0.35"/>
  <line x1="120" y1="52" x2="270" y2="52" stroke="${accent}" stroke-width="1" opacity="0.5"/>
  <polygon points="300,46 305,52 300,58 295,52" fill="${accent}" opacity="0.8"/>
  <line x1="330" y1="52" x2="480" y2="52" stroke="${accent}" stroke-width="1" opacity="0.5"/>
  <text x="300" y="108" text-anchor="middle" fill="${accent}" font-family="Helvetica, Arial, sans-serif" font-size="11" letter-spacing="3.5" font-weight="700">A MASMORRA DO SILENCIO</text>
  <rect x="210" y="128" width="180" height="26" rx="4" fill="${C.bgInset}" stroke="${accent}" stroke-width="1" opacity="0.9"/>
  <text x="300" y="146" text-anchor="middle" fill="${accent}" font-family="Helvetica, Arial, sans-serif" font-size="10" letter-spacing="2">${kicker}</text>
  ${heroBlock}
  ${subtitleBlock}
  <text x="300" y="520" text-anchor="middle" fill="${C.muted}" font-family="Helvetica, Arial, sans-serif" font-size="12">Codigo de resgate no jogo</text>
  <line x1="120" y1="548" x2="270" y2="548" stroke="${accent}" stroke-width="1" opacity="0.5"/>
  <polygon points="300,542 305,548 300,554 295,548" fill="${accent}" opacity="0.8"/>
  <line x1="330" y1="548" x2="480" y2="548" stroke="${accent}" stroke-width="1" opacity="0.5"/>
</svg>`;
}

/**
 * @param {{ outDir?: string; grants?: string[] }} [opts]
 */
export async function writeKofiShopPreviews(opts = {}) {
  const outDir = opts.outDir ?? 'shop/kofi/previews';
  const grants = opts.grants ?? SHOP_GRANTS;
  fs.mkdirSync(outDir, { recursive: true });

  for (const grant of grants) {
    const copy = SHOP_GRANT_COPY[grant] ?? { pt: { label: grant } };
    const label = copy.pt.label;
    const svg = buildPreviewSvg(grant, label);
    const outPath = path.join(outDir, `${grant}.png`);
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outPath);
  }

  return outDir;
}
