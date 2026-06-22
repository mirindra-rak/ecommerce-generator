# Story 02 — Noyau pricing : calcul HT / TVA / TTC + tests

**Epic** : [Pricing](../epic.md) · **Priorité** P0 · **Estimation** S · **Dépend de** 01 · **Statut** ✅

## Objectif

Implémenter le module de domaine `pricing` avec des fonctions pures de calcul
monétaire (centimes entiers, arrondi centralisé) et un repository pour le
référentiel fiscal.

## Critères d'acceptation

- `calculateTaxAmount(priceExclTax, rateBps)` retourne la TVA en centimes.
- `calculatePriceBreakdown(priceExclTax, taxRate)` retourne un objet complet
  HT / TVA / TTC avec snapshot du taux.
- `calculatePriceRange(variants, taxRate)` retourne la fourchette min/max TTC.
- Arrondi centralisé via `Math.round` dans une seule fonction.
- Erreurs métier : `InvalidMoneyAmountError`, `InvalidTaxRateError`,
  `TaxRateNotFoundError`.
- `taxRateRepository` expose `findById`, `findByCode`, `findMany`, `findActive`,
  `findDefault`.
- Constantes : `DEFAULT_TAX_RATE_ID`, `TAX_RATE_REFERENCES`.
- Tests unitaires couvrent les calculs sur plusieurs taux (0, 210, 550, 1000, 2000)
  et les cas d'erreur.
- Test d'intégration du repository sur base de test.

## Fichiers créés

- `packages/core/src/modules/pricing/pricing.service.ts`
- `packages/core/src/modules/pricing/tax-rate.repository.ts`
- `packages/core/src/modules/pricing/pricing-errors.ts`
- `packages/core/src/modules/pricing/tax-rate.constants.ts`
- `packages/core/src/modules/pricing/index.ts`
- `packages/core/src/modules/pricing/pricing.service.test.ts`
- `packages/core/src/modules/pricing/tax-rate.repository.test.ts`
