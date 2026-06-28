/**
 * Shared flatten helpers for i18n validation scripts.
 */

/**
 * Flatten nested objects into dot-path string leaves.
 * @param {unknown} obj
 * @param {string} [prefix]
 * @returns {Array<{ path: string; value: string }>}
 */
export function flattenStringLeaves(obj, prefix = '') {
  /** @type {Array<{ path: string; value: string }>} */
  const out = [];
  if (!obj || typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.push({ path: p, value: v });
    else if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === 'string') out.push({ path: `${p}[${i}]`, value: item });
      });
    } else if (v && typeof v === 'object') {
      out.push(...flattenStringLeaves(v, p));
    }
  }
  return out;
}

/**
 * Flatten nested objects into dot-path keys for string leaves only.
 * @param {unknown} obj
 * @param {string} [prefix]
 * @returns {string[]}
 */
export function flattenStringKeys(obj, prefix = '') {
  return flattenStringLeaves(obj, prefix).map((leaf) => leaf.path);
}
