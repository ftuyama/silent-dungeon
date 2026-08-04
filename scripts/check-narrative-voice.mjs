/**
 * Narrative voice checks for calvario player-facing Portuguese.
 *
 * Hard fail: residual PT-PT forms (also covered by check-pt-br; duplicated here
 * for a single narrative gate) and scene bodies that exceed the sentence limit.
 * Soft warn (exit 0 unless --strict-warns): excess bold, dash stacking,
 * "não é X — é Y" spam, meta references.
 *
 * Usage: node scripts/check-narrative-voice.mjs [--strict-warns]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const STRICT_WARNS = process.argv.includes('--strict-warns');

const SCAN_ROOTS = [
  'src/campaigns/calvario/scenes/pt-BR',
  'src/campaigns/calvario/data/dialogueEnemies',
  'src/campaigns/calvario/locales/pt-BR',
];

/** @type {{ pattern: RegExp; label: string }[]} */
const HARD = [
  { pattern: /\bPrecisas\b/, label: 'Precisas → Você precisa' },
  { pattern: /\bRegressar\b/, label: 'Regressar → Voltar / Retornar' },
  { pattern: /\bPartilhar\b/, label: 'Partilhar → Compartilhar' },
  { pattern: /\baté ao\b/i, label: 'até ao → até o' },
  { pattern: /\bprocurares\b/i, label: 'procurares → procurar' },
];

const META = /\b(o jogo|o sistema)\b.*(regist|registr)|decisões que o (jogo|sistema)/i;
const NAO_E_TEMPLATE = /não é [^—\n]{1,40}—\s*é /gi;

/**
 * @param {string} dir
 * @param {string[]} acc
 */
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(md|json|ts)$/.test(name)) acc.push(p);
  }
  return acc;
}

function collectFiles() {
  const files = [];
  for (const rel of SCAN_ROOTS) {
    const p = join(ROOT, rel);
    try {
      const st = statSync(p);
      if (st.isDirectory()) walk(p, files);
      else files.push(p);
    } catch {
      /* skip */
    }
  }
  return files;
}

/** Extract markdown body after frontmatter (--- ... ---). */
function mdBody(text) {
  if (!text.startsWith('---')) return text;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return text;
  return text.slice(end + 4);
}

/** Return playable scene metadata, excluding Markdown documentation such as READMEs. */
function sceneMetadata(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  const frontmatter = text.slice(3, end);
  if (!/^id:\s*\S+/m.test(frontmatter)) return null;
  return {
    body: text.slice(end + 4),
    highlight: /^highlight:\s*true\s*$/m.test(frontmatter),
  };
}

function sentenceCount(text) {
  return [...new Intl.Segmenter('pt-BR', { granularity: 'sentence' }).segment(text)]
    .filter(({ segment }) => /[\p{L}\p{N}]/u.test(segment)).length;
}

/** @type {{ file: string; line: number; label: string; excerpt: string }[]} */
const hardHits = [];
/** @type {{ file: string; line: number; label: string; excerpt: string }[]} */
const softHits = [];

for (const file of collectFiles()) {
  const rel = relative(ROOT, file);
  const raw = readFileSync(file, 'utf8');
  const lines = raw.split('\n');
  const isMd = file.endsWith('.md');
  const scene = isMd ? sceneMetadata(raw) : null;
  const body = isMd ? mdBody(raw) : raw;
  const bodyLines = isMd ? body.split('\n') : lines;
  const bodyOffset = isMd ? lines.length - bodyLines.length : 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { pattern, label } of HARD) {
      if (pattern.test(line)) {
        hardHits.push({
          file: rel,
          line: i + 1,
          label,
          excerpt: line.trim().slice(0, 120),
        });
        break;
      }
    }
  }

  // Soft checks only on playable Markdown scene bodies (avoid false positives in docs/.ts/.json)
  if (!scene) continue;

  const limit = scene.highlight ? 3 : 2;
  const sentences = sentenceCount(scene.body);
  if (sentences > limit) {
    hardHits.push({
      file: rel,
      line: bodyOffset + 1,
      label: `corpo com ${sentences} frases (limite ${limit})`,
      excerpt: scene.body.trim().replace(/\s+/g, ' ').slice(0, 120),
    });
  }

  // Soft: per-paragraph dash count + bold density in body
  let para = '';
  let paraStart = 0;
  const flushPara = () => {
    if (!para.trim()) return;
    const dashes = (para.match(/—/g) || []).length;
    if (dashes > 2) {
      softHits.push({
        file: rel,
        line: paraStart + bodyOffset,
        label: `>2 travessões no parágrafo (${dashes})`,
        excerpt: para.trim().slice(0, 100),
      });
    }
    const bolds = (para.match(/\*\*[^*]+\*\*/g) || []).length;
    if (bolds > 6) {
      softHits.push({
        file: rel,
        line: paraStart + bodyOffset,
        label: `>6 negritos no parágrafo (${bolds})`,
        excerpt: para.trim().slice(0, 100),
      });
    }
    para = '';
  };

  for (let i = 0; i < bodyLines.length; i++) {
    const line = bodyLines[i];
    if (line.trim() === '') {
      flushPara();
      continue;
    }
    if (!para) paraStart = i + 1;
    para += (para ? ' ' : '') + line;
  }
  flushPara();

  const naoMatches = body.match(NAO_E_TEMPLATE) || [];
  if (naoMatches.length > 2) {
    softHits.push({
      file: rel,
      line: 1,
      label: `template "não é X — é Y" ×${naoMatches.length}`,
      excerpt: naoMatches[0].slice(0, 80),
    });
  }

  if (META.test(body)) {
    const idx = lines.findIndex((l) => META.test(l));
    softHits.push({
      file: rel,
      line: idx >= 0 ? idx + 1 : 1,
      label: 'meta-referência (jogo/sistema)',
      excerpt: (idx >= 0 ? lines[idx] : body).trim().slice(0, 100),
    });
  }
}

if (hardHits.length > 0) {
  console.error(`check:narrative-voice FAILED — ${hardHits.length} hard hit(s):\n`);
  for (const h of hardHits) {
    console.error(`  ${h.file}:${h.line} [${h.label}]`);
    console.error(`    ${h.excerpt}\n`);
  }
  process.exit(1);
}

if (softHits.length > 0) {
  const tag = STRICT_WARNS ? 'FAILED (strict-warns)' : 'WARN';
  console[STRICT_WARNS ? 'error' : 'warn'](
    `check:narrative-voice ${tag} — ${softHits.length} soft hit(s):\n`,
  );
  for (const h of softHits.slice(0, 40)) {
    console[STRICT_WARNS ? 'error' : 'warn'](`  ${h.file}:${h.line} [${h.label}]`);
    console[STRICT_WARNS ? 'error' : 'warn'](`    ${h.excerpt}\n`);
  }
  if (softHits.length > 40) {
    console[STRICT_WARNS ? 'error' : 'warn'](`  … e mais ${softHits.length - 40}\n`);
  }
  if (STRICT_WARNS) process.exit(1);
}

console.log(
  softHits.length === 0
    ? 'check:narrative-voice OK — sem hard hits nem avisos.'
    : `check:narrative-voice OK (hard) — ${softHits.length} aviso(s) soft.`,
);
process.exit(0);
