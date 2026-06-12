# Produit dans plusieurs catégories (M2M + catégorie par défaut)

**Date:** 2026-06-12 17:09
**Statut:** Terminé

## Contexte

`Product` n'avait qu'un `categoryId` unique (many-to-one) : un produit ne pouvait vivre
que dans une seule catégorie. Avant publication, on corrige la cardinalité en
**many-to-many** + une **catégorie principale** (canonical / fil d'Ariane). Au passage :
suppression de catégorie assouplie (les produits ne bloquent plus, alerte du nombre) et
refonte de l'écran ajout/édition de catégorie.

Story : `specs/stories/2026-06-12-produit-multi-categories.md`
Plan : `specs/stories/2026-06-12-produit-multi-categories-plan.md`

## Modifications

- [x] `packages/core/prisma/schema.prisma` — `Product` M2M `categories` (relation
      `ProductCategories`) + `primaryCategory`/`primaryCategoryId` (`ProductPrimaryCategory`,
      SetNull) ; retrait de `categoryId`. `Category` : back-relations `products` + `primaryOf`.
- [x] Migration `20260612165723_product_categories_m2m` (table `_ProductCategories`).
- [x] `product.repository.ts` — `productInclude` charge `categories` + `primaryCategory` ;
      `findCardsByCategorySlug` filtre `categories: { some: { slug } }`.
- [x] `facet.repository.ts` — 2 filtres `category` → `categories.some` (code production).
- [x] `product.service.ts` — `CreateProductInput` (`categoryIds[]` + `primaryCategoryId`) ;
      helper `categoryWrite` (connect/set + rejet principale hors liste).
- [x] `catalog-errors.ts` — `PrimaryCategoryNotAssignedError` (exportée) ; message de
      `CategoryNotEmptyError` recentré sur les sous-catégories.
- [x] `category.repository.ts` — `countProducts(id)` + `findManyWithProductCounts()`.
- [x] `category.service.ts` — commentaire `deleteCategory` (produits détachés en cascade).
- [x] `apps/.../lib/catalog.ts` — `ProductDetailVM` expose `categories` + `primaryCategory`.
- [x] `prisma/seed.ts` — produit en M2M **et** principale.
- [x] Admin produit : `produit-form.tsx` (cases catégories + select principale),
      `_actions.ts` (`getAll("categoryIds")` + `primaryCategoryId` + erreur traduite),
      `[id]/page.tsx` (props `categoryIds`/`primaryCategoryId`).
- [x] Admin catégories : `categories/page.tsx` + `api/admin/categories/route.ts`
      (`findManyWithProductCounts`), `_components/categories-table.tsx` (colonne « Produits » +
      confirmation de suppression affichant le nombre de produits détachés).
- [x] Refonte UI `categories/category-form.tsx` — primitives `@pharmacie/ui`, sections en
      cartes (Identité, Contenu, SEO), compteurs de caractères SEO.
- [x] Tests : `product.repository.test`, `product.service.test`, `category.repository.test`,
      `category.service.test` (M2M, principale, set, suppression non bloquante par produits).

## Notes

- **Migration non-interactive** : `migrate diff` + `migrate deploy`.
- **Suppression** : la jointure M2M (`ON DELETE CASCADE`) détache les produits → seuls les
  enfants (self-relation `Restrict`) bloquent. `countProducts` sert uniquement à l'alerte.
- **Catégorie principale orpheline** possible : `onDelete: SetNull` (produit conservé).
- **Données** : la source ne porte qu'une catégorie par produit → le seed pose 1 catégorie
  = la principale ; le modèle supporte N (associations multiples à venir).
- Coquille story Scénario 5 corrigée précédemment (points de base TVA).

## Rollback

- `git checkout -- packages/core/prisma/schema.prisma` + `prisma migrate reset` (recrée la
  base), ou retirer la migration `…_product_categories_m2m`.
- `git checkout --` des fichiers repo/service/admin/seed/tests listés ci-dessus.
- Re-seed : `pnpm --filter @pharmacie/core db:seed`.
