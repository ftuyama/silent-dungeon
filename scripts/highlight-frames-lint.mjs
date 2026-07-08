/**
 * Valida quadros ASCII de highlight: mesmas dimensões (L×C) e limite de alterações
 * entre quadros consecutivos (por defeito ≤6 code points por par).
 *
 * Uso:
 *   node scripts/highlight-frames-lint.mjs [--mode strict|dims] [--max-per-step 6] [--base caminho/base.txt] <quadro0.txt> <quadro1.txt> ...
 *   node scripts/highlight-frames-lint.mjs --glob "src/campaigns/calvario/ascii/scenes/act1/foo_hl*.txt"
 *
 * `--mode strict` (defeito): exige diffs ≤ `--max-per-step` entre pares consecutivos.
 * `--mode dims`: só valida L×C iguais e (se `--base`) hl0 = base; imprime diffs como referência
 *   — para animações “macro” (ex.: abertura de arco) que violam K pequeno mas precisam de contorno correcto.
 *
 * Exit 0 = tudo OK; 1 = violação ou erro de uso.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

/** @param {string} s */
function lineWidths(s) {
  return s.split(/\r?\n/).map((line) => [...line].length);
}

/**
 * @param {string} raw
 * @returns {{ lines: string[], L: number, C: number, text: string }}
 */
function normalizeGrid(raw) {
  const rawLines = raw.split(/\r?\n/);
  const L = Math.max(1, rawLines.length);
  const C = Math.max(1, ...rawLines.map((ln) => [...ln].length));
  const lines = rawLines.map((ln) => {
    const cp = [...ln];
    while (cp.length < C) cp.push(' ');
    return cp.join('');
  });
  while (lines.length < L) {
    lines.push(' '.repeat(C));
  }
  const text = lines.join('\n');
  return { lines, L, C, text };
}

/**
 * @param {string[]} lines
 * @param {number} L
 * @param {number} C
 */
function padLinesTo(lines, L, C) {
  const out = lines.map((ln) => {
    const cp = [...ln];
    while (cp.length < C) cp.push(' ');
    return cp.join('').slice(0, C);
  });
  while (out.length < L) out.push(' '.repeat(C));
  return out.slice(0, L);
}

/**
 * @param {string} a
 * @param {string} b
 * @param {number} L
 * @param {number} C
 */
function diffCountInGrid(a, b, L, C) {
  const la = padLinesTo(a.split(/\r?\n/), L, C);
  const lb = padLinesTo(b.split(/\r?\n/), L, C);
  let n = 0;
  for (let r = 0; r < L; r++) {
    const sa = [...la[r]];
    const sb = [...lb[r]];
    for (let c = 0; c < C; c++) {
      if (sa[c] !== sb[c]) n++;
    }
  }
  return n;
}

function globFiles(patternArg) {
  const pat = patternArg.replace(/^['"]|['"]$/g, '');
  if (typeof fs.globSync === 'function') {
    const absPat = path.isAbsolute(pat) ? pat : path.join(repoRoot, pat);
    const matches = fs.globSync(absPat, { nodir: true }).filter((p) => p.endsWith('.txt'));
    matches.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    return matches;
  }
  const dir = path.dirname(pat);
  const basePat = path.basename(pat);
  if (!basePat.includes('*')) {
    console.error('--glob precisa de um * no nome do ficheiro');
    process.exit(1);
  }
  const absDir = path.isAbsolute(dir) ? dir : path.join(repoRoot, dir);
  if (!fs.existsSync(absDir)) {
    console.error(`Pasta não encontrada: ${absDir}`);
    process.exit(1);
  }
  const rx = new RegExp(
    `^${basePat
      .replace(/\\/g, '\\\\')
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')}$`,
  );
  const names = fs.readdirSync(absDir).filter((n) => rx.test(n) && n.endsWith('.txt'));
  names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  return names.map((n) => path.join(absDir, n));
}

function discoverDefaultHighlightFrames() {
  const defaultPat = 'src/campaigns/calvario/ascii/scenes/**/*_hl*.txt';
  return globFiles(defaultPat);
}

/**
 * @param {string[]} resolved
 * @returns {string[][]}
 */
function groupHighlightSequences(resolved) {
  /** @type {Map<string, { path: string, idx: number }[]>} */
  const groups = new Map();
  for (const absPath of resolved) {
    const base = path.basename(absPath);
    const m = base.match(/^(.*)_hl(\d+)\.txt$/);
    if (!m) continue;
    const key = path.join(path.dirname(absPath), m[1]);
    const bucket = groups.get(key) ?? [];
    bucket.push({ path: absPath, idx: Number(m[2]) });
    groups.set(key, bucket);
  }

  const out = [];
  for (const items of groups.values()) {
    items.sort((a, b) => a.idx - b.idx || a.path.localeCompare(b.path, undefined, { numeric: true }));
    const paths = items.map((x) => x.path);
    if (paths.length >= 2) out.push(paths);
  }
  out.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }));
  return out;
}

function lintSequence(resolved, mode, maxPerStep, basePath) {
  for (const p of resolved) {
    if (!fs.existsSync(p)) {
      console.error(`Ficheiro não encontrado: ${p}`);
      return true;
    }
  }

  const contents = resolved.map((p) => fs.readFileSync(p, 'utf8'));
  const grids = contents.map(normalizeGrid);

  const L = Math.max(...grids.map((g) => g.L));
  const C = Math.max(...grids.map((g) => g.C));

  const linesNorm = grids.map((g) => padLinesTo(g.lines, L, C));
  const texts = linesNorm.map((lines) => lines.join('\n'));

  let failed = false;

  for (let i = 0; i < grids.length; i++) {
    const g = grids[i];
    if (g.L !== L || g.C !== C) {
      console.warn(
        `[WARN] ${path.relative(repoRoot, resolved[i])}: ficheiro cru L=${g.L}, C=${g.C} — alinhado com padding a L=${L}, C=${C}`,
      );
    }
  }

  if (basePath) {
    const absBase = path.isAbsolute(basePath) ? basePath : path.join(repoRoot, basePath);
    if (!fs.existsSync(absBase)) {
      console.error(`--base não encontrado: ${absBase}`);
      return true;
    }
    const baseNorm = normalizeGrid(fs.readFileSync(absBase, 'utf8'));
    const baseLines = padLinesTo(baseNorm.lines, L, C);
    const baseText = baseLines.join('\n');
    if (texts[0] !== baseText) {
      console.error(
        `[ERRO] O primeiro quadro deve ser idêntico ao base após normalização (${path.relative(repoRoot, absBase)}).`,
      );
      const d0 = diffCountInGrid(texts[0], baseText, L, C);
      console.error(`       Diferenças face ao base: ${d0} células.`);
      failed = true;
    } else {
      console.log(`[OK] Quadro 0 coincide com base (${path.relative(repoRoot, absBase)}).`);
    }
  }

  for (let i = 0; i < texts.length - 1; i++) {
    const d = diffCountInGrid(texts[i], texts[i + 1], L, C);
    const relA = path.relative(repoRoot, resolved[i]);
    const relB = path.relative(repoRoot, resolved[i + 1]);
    if (mode === 'dims') {
      console.log(`[info] ${relA} → ${relB}: ${d} alterações entre quadros`);
      continue;
    }
    const ok = d <= maxPerStep;
    if (!ok) failed = true;
    console.log(`${ok ? '[OK]' : '[ERRO]'} ${relA} → ${relB}: ${d} alterações (máx. ${maxPerStep})`);
  }

  return failed;
}

function parseArgs(argv) {
  const rest = argv.slice(2);
  let maxPerStep = 6;
  let mode = 'strict';
  let basePath = null;
  let globPat = null;
  const files = [];
  while (rest.length) {
    const a = rest.shift();
    if (a === '--mode' && rest[0]) {
      const m = rest.shift();
      if (m === 'strict' || m === 'dims') mode = m;
      else {
        console.error('--mode deve ser strict ou dims');
        process.exit(1);
      }
    } else if (a === '--max-per-step' && rest[0]) maxPerStep = Math.max(0, parseInt(rest.shift(), 10) || 0);
    else if (a === '--base' && rest[0]) basePath = rest.shift();
    else if (a === '--glob' && rest[0]) globPat = rest.shift();
    else if (a) files.push(a);
  }
  return { maxPerStep, mode, basePath, globPat, files };
}

function main() {
  const { maxPerStep, mode, basePath, globPat, files: filesArg } = parseArgs(process.argv);

  let paths = [...filesArg];
  if (globPat) {
    paths = globFiles(globPat);
  }
  if (!globPat && paths.length === 0) {
    paths = discoverDefaultHighlightFrames();
    console.log(`Sem inputs explícitos: a validar automaticamente ${paths.length} quadros *_hl*.txt.\n`);
  }

  if (paths.length < 2) {
    console.error(
      'Uso: node scripts/highlight-frames-lint.mjs [--mode strict|dims] [--max-per-step 6] [--base base.txt] <f0.txt> <f1.txt> ...\n' +
        '  ou: node scripts/highlight-frames-lint.mjs --glob "…/art_hl*.txt"',
    );
    process.exit(1);
  }

  const resolved = paths.map((p) => (path.isAbsolute(p) ? p : path.join(repoRoot, p)));
  let failed = false;
  const sequences = groupHighlightSequences(resolved);

  if (sequences.length > 0) {
    console.log(`Modo: ${mode}. Sequências detectadas: ${sequences.length}\n`);
    if (basePath && sequences.length > 1) {
      console.error('--base só é suportado quando a validação inclui uma única sequência.');
      process.exit(1);
    }
    for (const seq of sequences) {
      const rel = path.relative(repoRoot, path.dirname(seq[0]));
      const prefix = path.basename(seq[0]).replace(/_hl\d+\.txt$/, '');
      console.log(`== ${rel}/${prefix}_hl*.txt (${seq.length} quadros) ==`);
      failed = lintSequence(seq, mode, maxPerStep, basePath) || failed;
      console.log('');
    }
  } else {
    console.log(`Modo: ${mode}. Grelha alvo: sequência explícita (${resolved.length} ficheiros)\n`);
    failed = lintSequence(resolved, mode, maxPerStep, basePath);
  }

  if (failed) {
    console.error('\nhighlight-frames-lint: falhou.');
    process.exit(1);
  }
  console.log('\nhighlight-frames-lint: tudo dentro dos limites.');
}

main();
