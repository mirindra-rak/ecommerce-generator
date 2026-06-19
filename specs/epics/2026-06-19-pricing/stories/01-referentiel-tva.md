# Story 01 — Référentiel TVA : schéma Prisma, seed & migration

**Epic** : [Pricing](../epic.md) · **Priorité** P0 · **Estimation** S · **Statut** ✅

## Objectif

Introduire un modèle `TaxRate` dans le schéma Prisma pour remplacer l'entier
`Product.vatRate` par une relation explicite vers un référentiel fiscal seedé.

## Critères d'acceptation

- Le modèle `TaxRate` existe avec `id`, `code`, `name`, `rateBps`, `active`,
  `position`, timestamps.
- `Product.vatRate` est supprimé, remplacé par `taxRateId` + relation `taxRate`.
- La migration convertit les produits existants vers les taux référentiels.
- Le seed crée les 5 taux FR (20 %, 10 %, 5,5 %, 2,1 %, 0 %) avant les produits.
- `TaxRate` est inclus dans le reset de la base de test (`db.ts`).
- `pnpm --filter @pharmacie/core db:generate` et `db:seed` passent.

## Fichiers modifiés

- `packages/core/prisma/schema.prisma`
- `packages/core/prisma/migrations/20260619183000_pricing_tax_rate_reference/migration.sql`
- `packages/core/prisma/seed.ts`
- `packages/core/src/test/db.ts`
