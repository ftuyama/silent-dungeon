import { describe, expect, it } from 'vitest';
import { createInitialState, createPlayerCharacter } from '../../src/engine/core/index.ts';
import {
  parseCodeInput,
  parseCodePayload,
  redeemSupporterCode,
  signCodePayload,
  verifyCodeSignature,
} from '../../src/engine/supporter/redeemCode.ts';
import { SUPPORTER_HMAC_SECRET_FALLBACK } from '../../src/engine/supporter/hmacSecret.ts';
import { emptySupporterMeta } from '../../src/engine/supporter/supporterMeta.ts';
import {
  applySupporterPerksOnResetRun,
  hasSupporterPerk,
} from '../../src/engine/progression/index.ts';
import { testCampaign } from '../helpers/engineTestData.ts';

describe('supporter code redeem', () => {
  it('signs and verifies a bundle code', async () => {
    const payload = { id: 'test-code-1', grants: ['echo_15'] };
    const code = await signCodePayload(payload, SUPPORTER_HMAC_SECRET_FALLBACK);
    const parsed = parseCodeInput(code);
    expect(parsed).not.toBeNull();
    expect(await verifyCodeSignature(parsed!.payloadB64, parsed!.sig, SUPPORTER_HMAC_SECRET_FALLBACK)).toBe(
      true
    );
    const payloadObj = parseCodePayload(parsed!.payloadB64);
    expect(payloadObj?.grants).toEqual(['echo_15']);
  });

  it('redeems echo grant and prevents double redeem', async () => {
    let state = createInitialState(testCampaign, 1);
    state = { ...state, party: [createPlayerCharacter('H', 'knight')] };
    let meta = emptySupporterMeta();
    const code = await signCodePayload({ id: 'echo-test-uuid', grants: ['echo_5'] }, SUPPORTER_HMAC_SECRET_FALLBACK);

    const first = await redeemSupporterCode(code, state, meta, testCampaign.id);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.state.legacy.echoes).toBe(5);
    expect(first.state.legacy.supporter.purchasedEchoesTotal).toBe(5);

    const second = await redeemSupporterCode(code, first.state, first.meta, testCampaign.id);
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error).toBe('already_redeemed');
  });

  it('redeems cosmetic bundle perks', async () => {
    let state = createInitialState(testCampaign, 2);
    const meta = emptySupporterMeta();
    const code = await signCodePayload(
      { id: 'cosmetic-bundle', grants: ['bundle_cosmetic'] },
      SUPPORTER_HMAC_SECRET_FALLBACK
    );
    const result = await redeemSupporterCode(code, state, meta, testCampaign.id);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(hasSupporterPerk(result.state, 'theme_ember')).toBe(true);
    expect(hasSupporterPerk(result.state, 'frame_supporter')).toBe(true);
    expect(result.state.legacy.titles).toContain('Apoiador');
  });
});

describe('supporter perks on resetRun', () => {
  it('applies starter supply and resets mercy flag', () => {
    let state = createInitialState(testCampaign, 3);
    state = {
      ...state,
      legacy: {
        ...state.legacy,
        supporter: {
          ...state.legacy.supporter,
          unlockedPerks: ['starter_supply', 'mercy_once'],
          mercyUsedThisRun: true,
        },
      },
      resources: { ...state.resources, supply: 5 },
    };
    const next = applySupporterPerksOnResetRun(state);
    expect(next.resources.supply).toBe(6);
    expect(next.legacy.supporter.mercyUsedThisRun).toBe(false);
  });
});
