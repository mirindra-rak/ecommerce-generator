// Module: pricing
// Responsabilité: Prix & TVA (HT/TTC, règles FR)
//
// Frontière d'accès données via Repository (voir ../../repositories).
// La logique métier vit dans des services de domaine de ce module.

export { taxRateRepository } from "./tax-rate.repository";
export type { TaxRateRepository } from "./tax-rate.repository";

export {
  calculateTaxAmount,
  calculatePriceBreakdown,
  calculatePriceRange,
} from "./pricing.service";
export type { TaxRateSnapshot, PriceBreakdown, PriceBreakdownRange } from "./pricing.service";

export {
  DEFAULT_TAX_RATE_ID,
  TAX_RATE_REFERENCES,
  type TaxRateReference,
} from "./tax-rate.constants";

export {
  InvalidMoneyAmountError,
  InvalidTaxRateError,
  TaxRateNotFoundError,
} from "./pricing-errors";
