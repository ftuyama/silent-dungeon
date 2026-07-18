import fs from 'node:fs';
import path from 'node:path';

const VIRTUAL_ASCII_RESOLVED = '\0virtual:ascii-scene-dev-manifest';
const VIRTUAL_ASCII_PUBLIC = 'virtual:ascii-scene-dev-manifest';
const VIRTUAL_SCENE_MD_RESOLVED = '\0virtual:scene-md-dev-manifest';
const VIRTUAL_SCENE_MD_PUBLIC = 'virtual:scene-md-dev-manifest';

/**
 * @param {string} projectRoot Vite `config.root`
 */
function buildAsciiSceneManifest(projectRoot) {
  const campaignsDir = path.join(projectRoot, 'src/campaigns');
  /** @type {Record<string, Array<{ key: string; path: string; mtimeMs: number }>>} */
  const out = {};
  if (!fs.existsSync(campaignsDir)) return out;
  for (const ent of fs.readdirSync(campaignsDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const id = ent.name;
    const scenesDir = path.join(campaignsDir, id, 'ascii', 'scenes');
    const items = [];
    if (fs.existsSync(scenesDir)) {
      walk(scenesDir, scenesDir, items);
    }
    out[id] = items;
  }
  return out;

  /**
   * @param {string} dir
   * @param {string} base
   * @param {Array<{ key: string; path: string; mtimeMs: number }>} acc
   */
  function walk(dir, base, acc) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full, base, acc);
      } else if (e.isFile() && e.name.endsWith('.txt')) {
        const stat = fs.statSync(full);
        const rel = path.relative(base, full).split(path.sep).join('/');
        const key = e.name.replace(/\.txt$/u, '');
        acc.push({ key, path: rel, mtimeMs: stat.mtimeMs });
      }
    }
  }
}

/**
 * @param {string} projectRoot Vite `config.root`
 * @returns {Record<string, Record<string, number>>} campaignId → sceneId → mtimeMs
 */
function buildSceneMdManifest(projectRoot) {
  const campaignsDir = path.join(projectRoot, 'src/campaigns');
  /** @type {Record<string, Record<string, number>>} */
  const out = {};
  if (!fs.existsSync(campaignsDir)) return out;
  for (const ent of fs.readdirSync(campaignsDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const id = ent.name;
    const scenesDir = path.join(campaignsDir, id, 'scenes', 'pt-BR');
    /** @type {Record<string, number>} */
    const byId = {};
    if (fs.existsSync(scenesDir)) {
      walkSceneMd(scenesDir, scenesDir, byId);
    }
    out[id] = byId;
  }
  return out;

  /**
   * @param {string} dir
   * @param {string} base
   * @param {Record<string, number>} acc
   */
  function walkSceneMd(dir, base, acc) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walkSceneMd(full, base, acc);
      } else if (e.isFile() && e.name.endsWith('.md')) {
        const stat = fs.statSync(full);
        const rel = path.relative(base, full).split(path.sep).join('/');
        const sceneId = rel.replace(/\.md$/u, '');
        acc[sceneId] = stat.mtimeMs;
      }
    }
  }
}

export function asciiSceneDevManifestPlugin() {
  /** @type {string} */
  let projectRoot = process.cwd();

  return {
    name: 'ascii-scene-dev-manifest',
    configResolved(config) {
      projectRoot = config.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_ASCII_PUBLIC) return VIRTUAL_ASCII_RESOLVED;
      if (id === VIRTUAL_SCENE_MD_PUBLIC) return VIRTUAL_SCENE_MD_RESOLVED;
      return null;
    },
    load(id) {
      if (id === VIRTUAL_ASCII_RESOLVED) {
        const manifest = buildAsciiSceneManifest(projectRoot);
        for (const [campaignId, items] of Object.entries(manifest)) {
          for (const item of items) {
            const fp = path.join(
              projectRoot,
              'src/campaigns',
              campaignId,
              'ascii',
              'scenes',
              item.path
            );
            this.addWatchFile(fp);
          }
        }
        return `export default ${JSON.stringify(manifest)}`;
      }
      if (id === VIRTUAL_SCENE_MD_RESOLVED) {
        const manifest = buildSceneMdManifest(projectRoot);
        for (const [campaignId, byId] of Object.entries(manifest)) {
          for (const sceneId of Object.keys(byId)) {
            const fp = path.join(
              projectRoot,
              'src/campaigns',
              campaignId,
              'scenes',
              'pt-BR',
              `${sceneId}.md`
            );
            this.addWatchFile(fp);
          }
        }
        return `export default ${JSON.stringify(manifest)}`;
      }
      return null;
    },
  };
}
