/// <reference types="vite/client" />

declare module 'virtual:ascii-scene-dev-manifest' {
  const manifest: Record<
    string,
    readonly { key: string; path: string; mtimeMs: number }[]
  >;
  export default manifest;
}

declare module 'virtual:scene-md-dev-manifest' {
  /** campaignId → sceneId → mtimeMs (ficheiros em `scenes/pt-BR/`). */
  const manifest: Record<string, Record<string, number>>;
  export default manifest;
}
