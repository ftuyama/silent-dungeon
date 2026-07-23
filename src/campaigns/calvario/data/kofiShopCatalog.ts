import type { GameState } from '../../../engine/schema/index.ts';
import { hasSupporterPerk } from '../../../engine/progression/index.ts';
import { SUPPORTER_BUNDLES } from '../../../engine/supporter/codeGrants.ts';
import previewBundleCosmetic from '../../../../shop/kofi/previews/bundle_cosmetic.png';
import previewBundleConvenience from '../../../../shop/kofi/previews/bundle_convenience.png';
import previewBundleGameplay from '../../../../shop/kofi/previews/bundle_gameplay.png';
import previewBundleSupporter from '../../../../shop/kofi/previews/bundle_supporter.png';
import previewBundleSupporterEcho15 from '../../../../shop/kofi/previews/bundle_supporter_echo15.png';
import previewEcho5 from '../../../../shop/kofi/previews/echo_5.png';
import previewEcho15 from '../../../../shop/kofi/previews/echo_15.png';
import previewEcho35 from '../../../../shop/kofi/previews/echo_35.png';

export type KofiShopProductId =
  | 'echo_5'
  | 'bundle_convenience'
  | 'bundle_gameplay'
  | 'bundle_cosmetic'
  | 'echo_15'
  | 'bundle_supporter'
  | 'echo_35'
  | 'bundle_supporter_echo15';

export type KofiShopGroupId = 'bundles' | 'packs' | 'echoes';

export type KofiShopProduct = {
  id: KofiShopProductId;
  nameKey: string;
  summaryKey: string;
  priceUsd: number;
  previewUrl: string;
  /** URL do produto no Ko-fi Shop — preencher quando publicar. */
  kofiUrl: string;
};

export type KofiShopGroup = {
  id: KofiShopGroupId;
  titleKey: string;
  subtitleKey: string;
  /** Destaque visual no topo da vitrine. */
  featured?: boolean;
  /** Uma coluna — cards mais largos. */
  singleColumn?: boolean;
  productIds: KofiShopProductId[];
};

export const KOFI_SHOP_URL = 'https://ko-fi.com/lelouchiee/shop';

export const kofiShopProducts: Record<KofiShopProductId, KofiShopProduct> = {
  echo_5: {
    id: 'echo_5',
    nameKey: 'supporter.products.echo_5.name',
    summaryKey: 'supporter.products.echo_5.summary',
    priceUsd: 1,
    previewUrl: previewEcho5,
    kofiUrl: '',
  },
  echo_15: {
    id: 'echo_15',
    nameKey: 'supporter.products.echo_15.name',
    summaryKey: 'supporter.products.echo_15.summary',
    priceUsd: 2,
    previewUrl: previewEcho15,
    kofiUrl: '',
  },
  echo_35: {
    id: 'echo_35',
    nameKey: 'supporter.products.echo_35.name',
    summaryKey: 'supporter.products.echo_35.summary',
    priceUsd: 3.5,
    previewUrl: previewEcho35,
    kofiUrl: '',
  },
  bundle_cosmetic: {
    id: 'bundle_cosmetic',
    nameKey: 'supporter.products.bundle_cosmetic.name',
    summaryKey: 'supporter.products.bundle_cosmetic.summary',
    priceUsd: 1.5,
    previewUrl: previewBundleCosmetic,
    kofiUrl: '',
  },
  bundle_convenience: {
    id: 'bundle_convenience',
    nameKey: 'supporter.products.bundle_convenience.name',
    summaryKey: 'supporter.products.bundle_convenience.summary',
    priceUsd: 1.5,
    previewUrl: previewBundleConvenience,
    kofiUrl: '',
  },
  bundle_gameplay: {
    id: 'bundle_gameplay',
    nameKey: 'supporter.products.bundle_gameplay.name',
    summaryKey: 'supporter.products.bundle_gameplay.summary',
    priceUsd: 1.5,
    previewUrl: previewBundleGameplay,
    kofiUrl: '',
  },
  bundle_supporter: {
    id: 'bundle_supporter',
    nameKey: 'supporter.products.bundle_supporter.name',
    summaryKey: 'supporter.products.bundle_supporter.summary',
    priceUsd: 3,
    previewUrl: previewBundleSupporter,
    kofiUrl: '',
  },
  bundle_supporter_echo15: {
    id: 'bundle_supporter_echo15',
    nameKey: 'supporter.products.bundle_supporter_echo15.name',
    summaryKey: 'supporter.products.bundle_supporter_echo15.summary',
    priceUsd: 4.5,
    previewUrl: previewBundleSupporterEcho15,
    kofiUrl: '',
  },
};

/** Vitrine agrupada na Loja do Apoiador. */
export const kofiShopGroups: KofiShopGroup[] = [
  {
    id: 'bundles',
    titleKey: 'supporter.shopGroups.bundles.title',
    subtitleKey: 'supporter.shopGroups.bundles.subtitle',
    featured: true,
    singleColumn: true,
    productIds: ['bundle_supporter_echo15', 'bundle_supporter'],
  },
  {
    id: 'packs',
    titleKey: 'supporter.shopGroups.packs.title',
    subtitleKey: 'supporter.shopGroups.packs.subtitle',
    productIds: ['bundle_cosmetic', 'bundle_convenience', 'bundle_gameplay'],
  },
  {
    id: 'echoes',
    titleKey: 'supporter.shopGroups.echoes.title',
    subtitleKey: 'supporter.shopGroups.echoes.subtitle',
    productIds: ['echo_5', 'echo_15', 'echo_35'],
  },
];

/** Lista plana (scripts, testes, compat). */
export const kofiShopCatalog: KofiShopProduct[] = kofiShopGroups.flatMap((group) =>
  group.productIds.map((id) => kofiShopProducts[id])
);

export function kofiProductUrl(product: KofiShopProduct): string {
  return product.kofiUrl.trim() || KOFI_SHOP_URL;
}

export function formatKofiPrice(usd: number): string {
  return usd % 1 === 0 ? `$${usd.toFixed(0)}` : `$${usd.toFixed(2)}`;
}

/** Produto resgatado quando todos os grants do bundle constam no estado. */
export function isKofiProductAcquired(state: GameState, productId: KofiShopProductId): boolean {
  const grants = SUPPORTER_BUNDLES[productId];
  if (!grants?.length) return false;
  for (const grant of grants) {
    if (grant.type === 'perk') {
      if (!hasSupporterPerk(state, grant.id)) return false;
    } else if (state.legacy.supporter.purchasedEchoesTotal < grant.amount) {
      return false;
    }
  }
  return true;
}

/** Preferências cosméticas (tema / moldura) — só após compra com perks visuais. */
export function hasSupporterCosmeticPrefs(state: GameState): boolean {
  return (
    hasSupporterPerk(state, 'frame_supporter') ||
    state.legacy.supporter.unlockedPerks.some((id) => id.startsWith('theme_'))
  );
}
