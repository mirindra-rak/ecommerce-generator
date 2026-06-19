# Story 05 — Storefront : affichage TTC listing + fiche produit

**Epic** : [Pricing](../epic.md) · **Priorité** P1 · **Estimation** S · **Dépend de** 02, 03 · **Statut** ✅

## Objectif

Afficher des prix TTC cohérents côté storefront (cartes produit et fiche produit),
avec la logique de calcul dans `core`, pas dans les composants React.

## Critères d'acceptation

- `catalog.ts` construit les view models via `calculatePriceBreakdown` /
  `calculatePriceRange` du module `pricing`.
- Les cartes produit et la fiche produit affichent un prix TTC.
- Le tri par prix du listing catégorie utilise le prix TTC (pas le HT).
- `category-listing.test.ts` couvre le tri TTC ascendant / descendant.
- La fiche produit affiche le taux de TVA applicable.

## Fichiers modifiés

- `apps/pharmacie-1/src/lib/catalog.ts`
- `apps/pharmacie-1/src/lib/category-listing.ts`
- `apps/pharmacie-1/src/lib/category-listing.test.ts`
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/product-card.tsx`
- `apps/pharmacie-1/src/app/[locale]/(storefront)/produit/[slug]/page.tsx`
