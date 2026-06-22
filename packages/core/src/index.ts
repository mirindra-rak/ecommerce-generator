// Point d'entrée public de @pharmacie/core.

export { prisma } from "./db/client";
export type { Repository } from "./repositories/base-repository";
export { slugify } from "./utils/slugify";
export {
  defineSiteConfig,
  type SiteConfig,
  type FeatureFlags,
  type BrandConfig,
  type LocaleConfig,
  type SearchConfig,
  type SearchDictionaryConfig,
  type SearchDictionaryEntryConfig,
  type SearchDictionaryEntityConfig,
  type SearchEntityKind,
  type SearchRankingWeightsConfig,
} from "./config/site-config";

// ── Promotions ──
export {
  catalogPriceRuleRepository,
  resolvePrice,
  resolvePrices,
  matchesContext,
} from "./modules/promotions";
export type {
  CatalogPriceRuleRepository,
  CatalogPriceRuleWithTargets,
  CreateCatalogPriceRuleInput,
  UpdateCatalogPriceRuleInput,
  ProductContext,
  DiscountDetail,
  ResolvedPrice,
} from "./modules/promotions";
export {
  InvalidDiscountValueError,
  InvalidFloorPriceError,
  MissingTargetIdsError,
} from "./modules/promotions";
