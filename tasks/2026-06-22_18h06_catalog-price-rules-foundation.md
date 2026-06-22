# Catalog Price Rules — Fondation (Stories 01 & 02)

**Date:** 2026-06-22 18:06
**Statut:** Terminé

## Contexte

Module promotions : Catalog Price Rules pour afficher des prix barrés sur le catalogue. Stories 01 (schema + types + repository) et 02 (service de résolution de prix).

## Modifications

- [x] `packages/core/prisma/schema.prisma` — ajout enums `TargetType`, `DiscountType`, modèles `CatalogPriceRule` et `CatalogPriceRuleTarget`
- [x] `packages/core/prisma/migrations/20260622145835_catalog_price_rules/` — migration auto-générée
- [x] `packages/core/src/modules/promotions/promotion.types.ts` — types TS (inputs, ResolvedPrice, DiscountDetail, ProductContext)
- [x] `packages/core/src/modules/promotions/promotion.repository.ts` — CRUD + findActiveForProduct + findActiveForProducts (batch)
- [x] `packages/core/src/modules/promotions/promotion.repository.test.ts` — 13 tests d'intégration
- [x] `packages/core/src/modules/promotions/promotion.service.ts` — resolvePrice, resolvePrices, matchesContext
- [x] `packages/core/src/modules/promotions/promotion.service.test.ts` — 17 tests unitaires (7 scénarios spec + edge cases)
- [x] `packages/core/src/modules/promotions/promotion-errors.ts` — erreurs domaine
- [x] `packages/core/src/modules/promotions/index.ts` — exports module
- [x] `packages/core/src/index.ts` — re-exports package
- [x] `packages/core/src/test/db.ts` — ajout tables promotions au TRUNCATE

## Notes

- Décision 🚧 table de liaison : choix table `CatalogPriceRuleTarget` (vs JSON array) pour les requêtes SQL performantes
- Décision 🚧 targetType=ALL : validé côté repository (pas de targets requis)
- Prix figé dans CartItem à l'ajout : re-validation au checkout sera dans une future story

## Rollback

```bash
cd packages/core && npx prisma migrate resolve --rolled-back 20260622145835_catalog_price_rules
```

Puis supprimer les fichiers créés dans `src/modules/promotions/`.
