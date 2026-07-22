/** Secret partilhado entre o build Vite e `scripts/generate-kofi-codes.mjs`. */
export const SUPPORTER_HMAC_SECRET_FALLBACK = 'silent-dungeon-supporter-dev-secret-v1';

export function getSupporterHmacSecret(): string {
  const fromEnv =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    typeof import.meta.env.VITE_SUPPORTER_HMAC_SECRET === 'string'
      ? import.meta.env.VITE_SUPPORTER_HMAC_SECRET.trim()
      : '';
  return fromEnv || SUPPORTER_HMAC_SECRET_FALLBACK;
}
