// Module: promotions
// Responsabilité: Catalog Price Rules — réductions catalogue, prix barrés

export { catalogPriceRuleRepository } from "./promotion.repository";
export type {
  CatalogPriceRuleRepository,
  CatalogPriceRuleWithTargets,
} from "./promotion.repository";

export { resolvePrice, resolvePrices, matchesContext } from "./promotion.service";

export type {
  CreateCatalogPriceRuleInput,
  UpdateCatalogPriceRuleInput,
  ProductContext,
  DiscountDetail,
  ResolvedPrice,
  DiscountType,
  TargetType,
} from "./promotion.types";

export {
  InvalidDiscountValueError,
  InvalidFloorPriceError,
  MissingTargetIdsError,
} from "./promotion-errors";
