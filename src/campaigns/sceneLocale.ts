function isPlayableScenePath(relativePath: string): boolean {
  const base = relativePath.split('/').pop() ?? relativePath;
  return base.endsWith('.md') && base !== 'README.md';
}

export function pickSceneFilesFromGlob(glob: Record<string, string>): Record<string, string> {
  const prefix = './scenes/pt-BR/';
  const out: Record<string, string> = {};
  for (const [path, raw] of Object.entries(glob)) {
    if (!path.startsWith(prefix)) continue;
    const relative = path.slice(prefix.length);
    if (!isPlayableScenePath(relative)) continue;
    out[relative] = raw;
  }
  return out;
}

export function scenePathToId(path: string): string {
  return path.replace(/\.md$/, '');
}
