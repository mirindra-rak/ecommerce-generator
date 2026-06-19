# Story 03 — Intégration produit : rattachement TaxRate

**Epic** : [Pricing](../epic.md) · **Priorité** P0 · **Estimation** M · **Dépend de** 01, 02 · **Statut** ✅

## Objectif

Rattacher chaque produit à une règle de TVA explicite via le repository et le
service de domaine, avec résolution d'un taux par défaut si non spécifié.

## Critères d'acceptation

- Les queries lecture du `productRepository` incluent `taxRate` dans les relations.
- `createProduct` et `updateProduct` acceptent un `taxRateId` optionnel.
- Si `taxRateId` est omis, le service résout le taux par défaut via
  `taxRateRepository.findDefault()`.
- Un `taxRateId` invalide ou inactif lève `TaxRateNotFoundError`.
- Les tests existants du catalogue passent avec le rattachement fiscal.

## Fichiers modifiés

- `packages/core/src/modules/catalog/product.repository.ts`
- `packages/core/src/modules/catalog/product.service.ts`
- `packages/core/src/modules/catalog/index.ts`
- `packages/core/src/modules/catalog/product.repository.test.ts`
- `packages/core/src/modules/catalog/product.service.test.ts`
