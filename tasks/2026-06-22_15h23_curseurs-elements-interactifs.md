# Curseurs éléments interactifs

**Date:** 2026-06-22 15:23
**Statut:** Terminé

## Contexte

Le storefront n'affiche pas toujours un curseur `pointer` sur certains contrôles interactifs, ce qui réduit l'affordance de clic sur le listing catégorie et plusieurs composants de navigation.

## Modifications

- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/category-sort.tsx` - ajouter un curseur explicite sur le sélecteur de tri
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/category-filters.tsx` - ajouter un curseur explicite sur les valeurs de facettes et la réinitialisation
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/site-header.tsx` - ajouter un curseur explicite sur le bouton de menu mobile
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/user-menu.tsx` - ajouter un curseur explicite sur le déclencheur et l'action de déconnexion
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/hero.tsx` - ajouter un curseur explicite sur les contrôles du carrousel
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/panier/cart-line-row.tsx` - ajouter un curseur explicite sur les actions de quantité et suppression
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/email-verification-banner.tsx` - ajouter un curseur explicite sur le renvoi d'email
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/_components/account-nav.tsx` - ajouter un curseur explicite sur l'action de déconnexion

## Notes

La correction reste ciblée sur les affordances interactives du storefront et n'ajoute pas de `cursor-pointer` sur les labels de formulaires standards qui n'en ont pas besoin.
`panier/cart-line-row.tsx` contenait déjà des changements locaux avant cette tâche ; la mise à jour de curseur a été appliquée sans revert de ces modifications existantes.

## Rollback

Retirer les classes `cursor-pointer` et `disabled:cursor-not-allowed` ajoutées dans les composants storefront ci-dessus.
