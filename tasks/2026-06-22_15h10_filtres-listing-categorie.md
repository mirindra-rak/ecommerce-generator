# Filtres listing catégorie

**Date:** 2026-06-22 15:10
**Statut:** Terminé

## Contexte

Le listing catégorie storefront affiche bien le tri, mais la sidebar de filtres reste vide sur `/fr/categorie/visage` parce que les produits seedés ne portent aucune liaison de facette.

## Modifications

- [x] `packages/core/prisma/seed-facets.ts` - ajouter une inférence déterministe de `FacetValue` depuis les métadonnées produit
- [x] `packages/core/prisma/seed-facets.test.ts` - verrouiller l'inférence par tests unitaires
- [x] `packages/core/prisma/seed.ts` - relier les produits seedés aux facettes inférées pendant le seed

## Notes

L'objectif était de réactiver les filtres storefront sans introduire de logique multi-tenant ni de dépendance à une source externe pendant le seed.
Le `db:seed` local a créé `220` liaisons `ProductFacetValue`, ce qui réactive la sidebar sur `/fr/categorie/visage`.

## Rollback

Retirer l'appel à `inferFacetValueCodes` dans `packages/core/prisma/seed.ts`, supprimer les nouvelles liaisons `ProductFacetValue` du seed, puis relancer `pnpm --filter @pharmacie/core db:seed`.
