#!/usr/bin/env node
/**
 * Gera códigos de resgate para Ko-fi Shop.
 *
 * Uso:
 *   node scripts/generate-kofi-codes.mjs --grant bundle_supporter --count 5
 *   node scripts/generate-kofi-codes.mjs --grant echo_15 --count 10
 *   SECRET=... node scripts/generate-kofi-codes.mjs --grant bundle_cosmetic
 *
 * Secret: env SUPPORTER_HMAC_SECRET ou VITE_SUPPORTER_HMAC_SECRET (mesmo do build Vite).
 */
import crypto from 'node:crypto';
import { randomUUID } from 'node:crypto';

const FALLBACK_SECRET = 'silent-dungeon-supporter-dev-secret-v1';

function parseArgs(argv) {
  let grant = 'bundle_supporter';
  let count = 1;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--grant' && argv[i + 1]) {
      grant = argv[++i];
    } else if (a === '--count' && argv[i + 1]) {
      count = Math.max(1, Math.floor(Number(argv[++i]) || 1));
    } else if (a === '-h' || a === '--help') {
      console.log(`Uso: node scripts/generate-kofi-codes.mjs [--grant <bundle>] [--count N]`);
      process.exit(0);
    }
  }
  return { grant, count };
}

function base64UrlEncode(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function signPayload(payload, secret) {
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(payload), 'utf8'));
  const sig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url').slice(0, 22);
  return `SD-${payloadB64}.${sig}`;
}

const { grant, count } = parseArgs(process.argv);
const secret =
  process.env.SUPPORTER_HMAC_SECRET?.trim() ||
  process.env.VITE_SUPPORTER_HMAC_SECRET?.trim() ||
  FALLBACK_SECRET;

console.log(`# grant=${grant} count=${count}`);
for (let i = 0; i < count; i++) {
  const payload = { id: randomUUID(), grants: [grant] };
  console.log(signPayload(payload, secret));
}
