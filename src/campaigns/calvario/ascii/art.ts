const sceneArtRaw = import.meta.glob<string>('./scenes/**/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function buildSceneArt(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, content] of Object.entries(sceneArtRaw)) {
    const base = path.split('/').pop()!;
    const key = base.replace(/\.txt$/u, '');
    if (out[key]) {
      throw new Error(`Duplicate scene art key: ${key}`);
    }
    if (isPlaceholderAsciiContent(content)) continue;
    out[key] = content;
  }
  return out;
}

function isPlaceholderAsciiContent(text: string): boolean {
  return text.trim().toUpperCase() === 'PLACEHOLDER';
}

/** Arte ASCII reutilizável — paisagens e cenas (artKey no frontmatter). */
export const SCENE_ART: Record<string, string> = buildSceneArt();
