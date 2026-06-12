# Storefront branché sur le catalogue réel (story 02 + vitrine data)

**Date:** 2026-06-12 00:05
**Statut:** Terminé

## Contexte

Objectif demandé : aller jusqu'à un résultat visible sur le front. On branche la
vitrine (home, listing catégorie, fiche produit) sur les vraies données du module
catalogue, et on ajoute les services de domaine (story 02) + un seed.

## Modifications

- [x] `packages/core/.../catalog/product.service.ts` (+ test) - priceRange, isDisplayable, resolveVariant (story 02)
- [x] `packages/core/.../catalog/product.repository.ts` - vues « carte » (findActiveCards, findCardsByCategorySlug)
- [x] `packages/core/.../catalog/index.ts` - exports service + ProductCard
- [x] `packages/core/prisma/seed.ts` + config `prisma db seed` (+ tsx) - 5 marques, 6 catégories, 8 produits, 11 variantes
- [x] `apps/pharmacie-1/src/lib/catalog.ts` - couche d'accès données (view-models)
- [x] `apps/.../(storefront)/_components/{featured-products,category-grid,product-card}.tsx` - branchés DB
- [x] `apps/.../(storefront)/categorie/[slug]/page.tsx` - listing catégorie (story 05, base)
- [x] `apps/.../(storefront)/produit/[slug]/page.tsx` - fiche produit (story 06, base)
- [x] `apps/.../(storefront)/page.tsx` - force-dynamic
- [x] `apps/pharmacie-1/.env` (gitignoré) - DATABASE_URL dev

## Notes

- Vérifié au runtime (curl sur le serveur dev) : home, /categorie/visage-soin et
  /produit/creme-hydratante-visage affichent le contenu réel ; 404 sur slugs inconnus.
- Validation : 20 tests ✅, type-check ✅, lint ✅, build ✅.
- Prix affichés en **HT** (TVA = module pricing, lot 4.2). Sélecteur de variante
  encore non interactif (interactivité = finition story 06). Images = placeholder CSS
  (upload MinIO = story 03).
- Composants de design (hero, header, footer, icons, reassurance) préexistants dans le
  repo (créés hors de cette session) : intégrés et branchés ici.

## Rollback

- `git revert` du commit. Données : `pnpm --filter @pharmacie/core db:seed` régénère,
  ou TRUNCATE des tables catalogue.
