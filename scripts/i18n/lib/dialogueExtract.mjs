/**
 * Regex extract of pt-BR dialogue enemy strings from calvario/data/dialogueEnemies/*.ts
 * (avoids TS import chain that pulls in Vite-only import.meta.glob sprites).
 */
import fs from 'fs';
import path from 'path';

function unescapeString(s) {
  return s.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"');
}

function extractStringAfterKey(block, key) {
  const re = new RegExp(`${key}:\\s*\\n?\\s*['"\`]([\\s\\S]*?)['"\`]\\s*,`, 'm');
  const m = block.match(re);
  return m?.[1] ? unescapeString(m[1]) : null;
}

function extractNodesFromBlock(block) {
  const nodes = {};
  const nodeBlockRe = /(\w+):\s*\{([\s\S]*?)\n\s*\},?\n(?=\s*\w+:|$)/g;
  let m;
  while ((m = nodeBlockRe.exec(block)) !== null) {
    const nodeId = m[1];
    const nodeInner = m[2];
    if (!nodeInner.includes('line:')) continue;
    const line = extractStringAfterKey(nodeInner, 'line');
    const entry = { line: line ?? '' };
    const choices = [];
    const choiceRe = /text:\s*\n?\s*['"]([^'"]+)['"]/g;
    let cm;
    while ((cm = choiceRe.exec(nodeInner)) !== null) {
      choices.push({ text: unescapeString(cm[1]) });
    }
    if (choices.length) entry.choices = choices;
    nodes[nodeId] = entry;
  }
  return nodes;
}

function extractInlineEnemyDef(block) {
  const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
  const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
  if (!idMatch) return null;
  const graphMatch = block.match(/graph:\s*\{([\s\S]*)\n\s*\},?\s*\n?\s*\}/);
  const graphBlock = graphMatch?.[1] ?? block;
  const nodesMatch = graphBlock.match(/nodes:\s*\{([\s\S]*)\n\s*\}/);
  const nodes = extractNodesFromBlock(nodesMatch?.[1] ?? graphBlock);
  return { id: idMatch[1], overlay: { name: nameMatch?.[1] ?? idMatch[1], nodes } };
}

function extractKaelGraphTemplate(raw) {
  const fnMatch = raw.match(/const kaelGraph[\s\S]*?=>\s*\(\{([\s\S]*)\}\);/);
  if (!fnMatch) return null;
  const body = fnMatch[1];
  const nodesMatch = body.match(/nodes:\s*\{([\s\S]*)\n\s*\}/);
  if (!nodesMatch) return null;
  const template = extractNodesFromBlock(nodesMatch[1]);
  if (template.root) {
    template.root = { ...template.root, line: '' };
  }
  return template;
}

function extractKaelExports(raw, template) {
  const results = [];
  const callRe =
    /export const (\w+)[\s\S]*?=\s*kaelGraph\(\s*\n?\s*['"]([^'"]+)['"]\s*,\s*\n?\s*['"]([^'"]+)['"]\s*,\s*\n?\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = callRe.exec(raw)) !== null) {
    const [, , id, name, rootLine] = m;
    const nodes = JSON.parse(JSON.stringify(template));
    if (nodes.root) nodes.root.line = unescapeString(rootLine);
    results.push({ id, overlay: { name: unescapeString(name), nodes } });
  }
  return results;
}

function extractFromFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const results = [];

  if (raw.includes('const kaelGraph')) {
    const template = extractKaelGraphTemplate(raw);
    if (template) results.push(...extractKaelExports(raw, template));
    return results;
  }

  const exportRe = /export const \w+(?::\s*DialogueEnemyDef)?\s*=\s*\{/g;
  const starts = [...raw.matchAll(exportRe)].map((m) => m.index);
  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i];
    const end = starts[i + 1] ?? raw.length;
    const block = raw.slice(start, end);
    const extracted = extractInlineEnemyDef(block);
    if (extracted) results.push(extracted);
  }

  if (results.length === 0) {
    const single = extractInlineEnemyDef(raw);
    if (single) results.push(single);
  }

  return results;
}

/** @returns {Record<string, { name: string; nodes: Record<string, { line: string; choices?: { text: string }[] }> }>} */
export function buildDialoguePtOverlays(repoRoot) {
  const dialogueDir = path.join(repoRoot, 'src/campaigns/calvario/data/dialogueEnemies');
  const indexRaw = fs.readFileSync(path.join(dialogueDir, 'index.ts'), 'utf8');
  const importRe = /from\s+['"]\.\/([^'"]+)['"]/g;
  const files = new Set();
  let im;
  while ((im = importRe.exec(indexRaw)) !== null) {
    const base = im[1].replace(/\.ts$/, '');
    files.add(`${base}.ts`);
  }

  /** @type {Record<string, { name: string; nodes: Record<string, unknown> }>} */
  const all = {};
  for (const file of files) {
    const fp = path.join(dialogueDir, file);
    if (!fs.existsSync(fp)) continue;
    for (const extracted of extractFromFile(fp)) {
      all[extracted.id] = extracted.overlay;
    }
  }
  return all;
}
