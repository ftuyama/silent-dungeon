import fs from 'node:fs';
import PDFDocument from 'pdfkit';

/** Paleta alinhada a theme-tokens.css (ato default / vigilia). */
const C = {
  bg: '#0a0c0b',
  bgInset: '#121410',
  fg: '#c9b89a',
  muted: '#9a9688',
  accent: '#6e8f6a',
  accentDim: '#4a6b52',
  emphasis: '#e0d4b8',
  code: '#a8b8a8',
};

const LOCALE = {
  pt: {
    gameTitle: 'A MASMORRA DO SILÊNCIO',
    thanks: 'Obrigado pelo apoio.',
    redeemTitle: 'Como resgatar',
    redeemSteps: [
      '1. Abra o jogo.',
      '2. Menu lateral: "Loja do Apoiador".',
      '3. Cole o código e toque em "Resgatar".',
    ],
    codeLabel: 'CÓDIGO',
    footer: 'O Silêncio ouve.',
    pageNum: '1 / 2',
  },
  en: {
    gameTitle: 'SILENT DUNGEON',
    thanks: 'Thank you for your support.',
    redeemTitle: 'How to redeem',
    redeemSteps: [
      '1. Open the game.',
      '2. Side menu: "Supporter Shop".',
      '3. Paste the code and tap "Redeem".',
    ],
    codeLabel: 'CODE',
    footer: 'The Silence listens.',
    pageNum: '2 / 2',
  },
};

const SHOP_GRANT_COPY = {
  bundle_cosmetic: { pt: { label: 'Pacote Cosmético' }, en: { label: 'Cosmetic Pack' } },
  bundle_convenience: { pt: { label: 'Pacote Conveniência' }, en: { label: 'Convenience Pack' } },
  bundle_gameplay: { pt: { label: 'Pacote Jogabilidade' }, en: { label: 'Gameplay Pack' } },
  bundle_supporter: { pt: { label: 'Pacote Apoiador' }, en: { label: 'Supporter Pack' } },
  bundle_supporter_echo15: {
    pt: { label: 'Pacote Apoiador + 15 Ecos' },
    en: { label: 'Supporter Pack + 15 Echoes' },
  },
  echo_5: { pt: { label: '5 Ecos' }, en: { label: '5 Echoes' } },
  echo_15: { pt: { label: '15 Ecos' }, en: { label: '15 Echoes' } },
  echo_35: { pt: { label: '35 Ecos' }, en: { label: '35 Echoes' } },
};

function drawOrnament(doc, cx, cy, width) {
  const mid = cx + width / 2;
  const arm = Math.min(72, width * 0.22);
  doc.save();
  doc.lineWidth(0.6).strokeColor(C.accentDim);
  doc.moveTo(cx, cy).lineTo(mid - arm, cy).stroke();
  doc.moveTo(mid + arm, cy).lineTo(cx + width, cy).stroke();
  doc.fillColor(C.accent).strokeColor(C.accent);
  const s = 2.5;
  doc.moveTo(mid, cy - s).lineTo(mid + s, cy).lineTo(mid, cy + s).lineTo(mid - s, cy).closePath().fillAndStroke();
  doc.restore();
}

function drawPageFrame(doc, x, y, w, h) {
  doc.save();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg);

  doc.lineWidth(1.5).strokeColor(C.accentDim);
  doc.rect(x, y, w, h).stroke();
  doc.lineWidth(0.5).strokeColor(C.accent);
  doc.rect(x + 6, y + 6, w - 12, h - 12).stroke();

  const innerX = x + 18;
  const innerW = w - 36;
  drawOrnament(doc, innerX, y + 16, innerW);
  drawOrnament(doc, innerX, y + h - 22, innerW);

  doc.restore();
}

function drawSection(doc, x, y, width, title, lines, opts = {}) {
  const { titleColor = C.emphasis, bodyColor = C.fg, titleSize = 11, bodySize = 10, gap = 6 } = opts;
  doc.font('Helvetica-Bold').fontSize(titleSize).fillColor(titleColor).text(title, x, y, { width });
  let cy = doc.y + gap;
  doc.font('Helvetica').fontSize(bodySize).fillColor(bodyColor);
  for (const line of lines) {
    doc.text(line, x, cy, { width, lineGap: 2 });
    cy = doc.y + 2;
  }
  return doc.y + 10;
}

function drawCodeBox(doc, x, y, width, code) {
  const pad = 12;
  const boxH = 58;
  doc.save();
  doc.fillColor(C.bgInset).strokeColor(C.accentDim).lineWidth(0.75);
  doc.roundedRect(x, y, width, boxH, 4).fillAndStroke();
  doc.font('Courier').fontSize(8).fillColor(C.code);
  doc.text(code, x + pad, y + pad, {
    width: width - pad * 2,
    align: 'center',
    lineGap: 2,
  });
  doc.restore();
  return y + boxH + 10;
}

/**
 * @param {import('pdfkit').PDFDocument} doc
 * @param {'pt' | 'en'} localeKey
 * @param {{ label: string }} grant
 * @param {string} code
 * @param {{ margin: number; frameW: number; frameH: number }} layout
 */
function drawLocalePage(doc, localeKey, grant, code, layout) {
  const loc = LOCALE[localeKey];
  const { margin, frameW, frameH } = layout;
  drawPageFrame(doc, margin, margin, frameW, frameH);

  const cx = margin + 28;
  const contentW = frameW - 56;
  let y = margin + 72;

  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.accent);
  doc.text(loc.gameTitle, cx, y, { width: contentW, align: 'center', characterSpacing: 1.5 });
  y = doc.y + 16;

  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.emphasis);
  doc.text(grant.label, cx, y, { width: contentW, align: 'center' });
  y = doc.y + 12;

  doc.font('Helvetica').fontSize(11).fillColor(C.fg);
  doc.text(loc.thanks, cx, y, { width: contentW, align: 'center' });
  y = doc.y + 28;

  y = drawSection(doc, cx, y, contentW, loc.redeemTitle, loc.redeemSteps, { titleSize: 12 });

  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.accent).text(loc.codeLabel, cx, y, {
    width: contentW,
    align: 'center',
  });
  y = doc.y + 8;
  drawCodeBox(doc, cx + 8, y, contentW - 16, code);

  const footerY = margin + frameH - 34;
  doc.font('Helvetica-Oblique').fontSize(8).fillColor(C.accentDim);
  doc.text(loc.footer, cx, footerY, { width: contentW, align: 'center' });
  doc.font('Helvetica').fontSize(7).fillColor(C.muted);
  doc.text('ko-fi.com/lelouchiee/shop', cx, footerY + 12, { width: contentW, align: 'center' });
  doc.font('Helvetica').fontSize(7).fillColor(C.accentDim);
  doc.text(loc.pageNum, cx + contentW - 4, margin + 22, { width: 40, align: 'right' });
}

/**
 * @param {{ grant: string; code: string; outPath: string }} opts
 */
export function writeKofiShopPdf({ grant, code, outPath }) {
  const copy = SHOP_GRANT_COPY[grant] ?? {
    pt: { label: grant },
    en: { label: grant },
  };

  return new Promise((resolve, reject) => {
    const margin = 42;
    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    const layout = {
      margin,
      frameW: doc.page.width - margin * 2,
      frameH: doc.page.height - margin * 2,
    };

    drawLocalePage(doc, 'pt', copy.pt, code, layout);
    doc.addPage();
    drawLocalePage(doc, 'en', copy.en, code, layout);

    doc.end();
    stream.on('finish', () => resolve(outPath));
    stream.on('error', reject);
  });
}

export { SHOP_GRANT_COPY };
