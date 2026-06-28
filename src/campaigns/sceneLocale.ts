export function pickSceneFilesFromGlob(glob: Record<string, string>): Record<string, string> {
  const prefix = './scenes/pt-BR/';
  const out: Record<string, string> = {};
  for (const [path, raw] of Object.entries(glob)) {
    if (!path.startsWith(prefix)) continue;
    out[path.slice(prefix.length)] = raw;
  }
  return out;
}

export function scenePathToId(path: string): string {
  return path.replace(/\.md$/, '');
}
