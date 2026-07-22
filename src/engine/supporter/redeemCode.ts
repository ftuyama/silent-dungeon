import type { GameState } from '../schema/index.ts';
import { uniqueTitles } from '../core/effects/legacySummary.ts';
import { isSupporterThemeId } from '../schema/supporter.ts';
import { expandGrantRefs, type GrantRef, type SupporterGrant } from './codeGrants.ts';
import { getSupporterHmacSecret } from './hmacSecret.ts';
import {
  applyGrantsToState,
  isCodeRedeemed,
  markCodeRedeemed,
  type SupporterMeta,
} from './supporterMeta.ts';

export type CodePayload = {
  id: string;
  grants: GrantRef[];
};

export type RedeemResult =
  | { ok: true; state: GameState; meta: SupporterMeta; grants: SupporterGrant[] }
  | { ok: false; error: 'invalid_format' | 'invalid_signature' | 'already_redeemed' | 'empty_grants' };

const CODE_PREFIX = 'SD-';

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacSign(payloadB64: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  return base64UrlEncode(new Uint8Array(sig)).slice(0, 22);
}

export async function signCodePayload(payload: CodePayload, secret = getSupporterHmacSecret()): Promise<string> {
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmacSign(payloadB64, secret);
  return `${CODE_PREFIX}${payloadB64}.${sig}`;
}

export function parseCodeInput(raw: string): { payloadB64: string; sig: string } | null {
  const trimmed = raw.trim();
  if (!/^sd-/i.test(trimmed)) return null;
  const rest = trimmed.slice(3);
  const dot = rest.lastIndexOf('.');
  if (dot <= 0) return null;
  return { payloadB64: rest.slice(0, dot), sig: rest.slice(dot + 1) };
}

export async function verifyCodeSignature(
  payloadB64: string,
  sig: string,
  secret = getSupporterHmacSecret()
): Promise<boolean> {
  const expected = await hmacSign(payloadB64, secret);
  return expected === sig;
}

export function parseCodePayload(payloadB64: string): CodePayload | null {
  try {
    const json = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const o = JSON.parse(json) as unknown;
    if (typeof o !== 'object' || o === null) return null;
    const id = (o as CodePayload).id;
    const grants = (o as CodePayload).grants;
    if (typeof id !== 'string' || !id.trim()) return null;
    if (!Array.isArray(grants) || grants.some((g) => typeof g !== 'string')) return null;
    return { id: id.trim(), grants: grants.map((g) => g.trim()).filter(Boolean) };
  } catch {
    return null;
  }
}

export async function redeemSupporterCode(
  rawCode: string,
  state: GameState,
  meta: SupporterMeta,
  _campaignId: string
): Promise<RedeemResult> {
  const parsed = parseCodeInput(rawCode);
  if (!parsed) return { ok: false, error: 'invalid_format' };

  const valid = await verifyCodeSignature(parsed.payloadB64, parsed.sig);
  if (!valid) return { ok: false, error: 'invalid_signature' };

  const payload = parseCodePayload(parsed.payloadB64);
  if (!payload) return { ok: false, error: 'invalid_format' };

  if (isCodeRedeemed(meta, payload.id)) return { ok: false, error: 'already_redeemed' };

  const grants = expandGrantRefs(payload.grants);
  if (grants.length === 0) return { ok: false, error: 'empty_grants' };

  let nextMeta = markCodeRedeemed(meta, payload.id);
  let nextState = applyGrantsToState(state, grants, nextMeta);

  if (grants.some((g) => g.type === 'perk' && g.id === 'title_supporter')) {
    nextState = {
      ...nextState,
      legacy: {
        ...nextState.legacy,
        titles: uniqueTitles([...nextState.legacy.titles, 'Apoiador']),
      },
    };
  }

  nextMeta = {
    ...nextMeta,
    unlockedPerks: [...nextState.legacy.supporter.unlockedPerks],
    purchasedEchoesTotal: nextState.legacy.supporter.purchasedEchoesTotal,
    redeemedCodeIds: [...nextState.legacy.supporter.redeemedCodeIds, payload.id],
  };
  nextState = {
    ...nextState,
    legacy: {
      ...nextState.legacy,
      supporter: {
        ...nextState.legacy.supporter,
        redeemedCodeIds: [...nextMeta.redeemedCodeIds],
      },
    },
  };

  return { ok: true, state: nextState, meta: nextMeta, grants };
}

/** Sincroniza meta global → estado (load / slot change). */
export function mergeSupporterMetaIntoState(state: GameState, meta: SupporterMeta): GameState {
  const activeTheme =
    meta.activeTheme && isSupporterThemeId(meta.activeTheme) ? meta.activeTheme : null;
  const supporter = {
    ...state.legacy.supporter,
    unlockedPerks: [...meta.unlockedPerks],
    redeemedCodeIds: [...meta.redeemedCodeIds],
    activeTheme,
    activeFrame: meta.activeFrame,
    supporterName: meta.supporterName,
    purchasedEchoesTotal: meta.purchasedEchoesTotal,
  };
  return { ...state, legacy: { ...state.legacy, supporter } };
}
