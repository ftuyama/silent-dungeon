#!/usr/bin/env node
/**
 * Fail on PT-PT markers in player-facing Portuguese (pt-BR).
 * Usage: node scripts/check-pt-br.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

const SCAN_ROOTS = [
  'src/i18n/locales/pt-BR.json',
  'src/campaigns/calvario/scenes/pt-BR',
  'src/campaigns/calvario/data/dialogueEnemies',
  'src/campaigns/calvario/locales/pt-BR',
  'src/campaigns/calvario/classCompanion.ts',
  'src/campaigns/calvario/classHero.ts',
  'src/campaigns/calvario/data/journeyMarks.ts',
  'src/campaigns/calvario/data/passives.ts',
  'src/campaigns/calvario/data/enemies.ts',
  'src/campaigns/calvario/data/encounters.json',
  'src/campaigns/calvario/data/companions.json',
  'src/campaigns/calvario/index.json',
  'src/engine/data/gameData.ts',
  'src/engine/core/template.ts',
  'src/ui/storyMapPanel.ts',
  'LEIAME.md',
];

/** @type {{ pattern: RegExp; label: string }[]} */
const BANNED = [
  { pattern: /telemóvel/i, label: 'telemóvel → celular' },
  { pattern: /húmid/i, label: 'húmido → úmido' },
  { pattern: /\becrã\b/i, label: 'ecrã → tela' },
  { pattern: /bónus/i, label: 'bónus → bônus' },
  { pattern: /crónica/i, label: 'crónica → crônica' },
  { pattern: /\bfacto\b/i, label: 'facto → fato' },
  { pattern: /miúd/i, label: 'miúda → pequena' },
  { pattern: /\bcomboio\b/i, label: 'comboio → trem' },
  { pattern: /\bcarris\b/i, label: 'carris → trilhos' },
  { pattern: /\bdseu\b|\baseus\b/i, label: 'typo dseu/aseus' },
  { pattern: /\b(teu|tua|teus|tuas)\b/i, label: 'tu/teu → você/seu' },
  { pattern: /\btu\b/i, label: 'tu → você' },
  { pattern: /\bpor ti\b/i, label: 'por ti → por você' },
  { pattern: /\bpara ti\b/i, label: 'para ti → para você' },
  { pattern: /\bem ti\b/i, label: 'em ti → em você' },
  { pattern: /\bcontra ti\b/i, label: 'contra ti → contra você' },
  { pattern: /\bsem ti\b/i, label: 'sem ti → sem você' },
  { pattern: /\bcontigo\b/i, label: 'contigo → com você' },
  { pattern: /em lado nenhum/i, label: 'em lado nenhum → em lugar nenhum' },
  { pattern: /\btecto\b/i, label: 'tecto → teto' },
  { pattern: /direcç/i, label: 'direcção → direção' },
  { pattern: /\bacç/i, label: 'acção → ação' },
  { pattern: /\bsecç/i, label: 'secção → seção' },
  { pattern: /\breflect/i, label: 'reflecte → reflete' },
  { pattern: /incómod/i, label: 'incómodo → incômodo' },
  { pattern: /óptim/i, label: 'óptimo → ótimo' },
  { pattern: /\bsítio/i, label: 'sítio → lugar' },
  { pattern: /\brect[oa]\b/i, label: 'recta/recto → reta/reto' },
  { pattern: /\bperm[ií]ção\b/i, label: 'permición → permissão' },
  { pattern: /\bautocarro/i, label: 'autocarro → ônibus' },
  { pattern: /\bficheiro/i, label: 'ficheiro → arquivo' },
  { pattern: /\bcontacto\b/i, label: 'contacto → contato' },
  { pattern: /\bconnosco\b/i, label: 'connosco → conosco' },
  { pattern: /\bvoss[oa]s?\b/i, label: 'vosso → seu' },
  { pattern: /\b(de ti|a ti|sobre ti)\b/i, label: 'ti → você' },
  { pattern: /trocámo-/i, label: 'trocámo-nos → trocamos' },
  { pattern: /\b(deu|dei|disse|ficou|ensinou)-lhe\b/i, label: '-lhe → a ele/a ela' },
  { pattern: /\bsi próprio\b/i, label: 'si próprio → si mesmo' },
  { pattern: /\bPrecisas\b/, label: 'Precisas → Você precisa' },
  { pattern: /\bRegressar\b/, label: 'Regressar → Voltar / Retornar' },
  { pattern: /\bPartilhar\b/, label: 'Partilhar → Compartilhar' },
  { pattern: /\baté ao\b/i, label: 'até ao → até o' },
  { pattern: /\bprocurares\b/i, label: 'procurares → procurar' },
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(md|json|ts|txt)$/.test(name)) acc.push(p);
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

/** @type {{ file: string; line: number; label: string; excerpt: string }[]} */
const hits = [];

for (const file of collectFiles()) {
  const rel = relative(ROOT, file);
  const lines = readFileSync(file, 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { pattern, label } of BANNED) {
      if (pattern.test(line)) {
        hits.push({
          file: rel,
          line: i + 1,
          label,
          excerpt: line.trim().slice(0, 120),
        });
        break;
      }
    }
  }
}

if (hits.length === 0) {
  console.log('check:pt-br OK — nenhuma marca PT-PT encontrada.');
  process.exit(0);
}

console.error(`check:pt-br FAILED — ${hits.length} ocorrência(s):\n`);
for (const h of hits) {
  console.error(`  ${h.file}:${h.line} [${h.label}]`);
  console.error(`    ${h.excerpt}\n`);
}
process.exit(1);
