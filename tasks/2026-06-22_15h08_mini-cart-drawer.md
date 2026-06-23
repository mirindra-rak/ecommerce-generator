# Mini-cart drawer storefront

**Date:** 2026-06-22 15:08
**Statut:** Terminé

## Contexte

Le panier existe déjà sous forme de page dédiée. Il faut maintenant ajouter un mini-cart drawer ancré à droite, ouvert à l'ajout d'un article et au clic sur l'icône panier du header, pour rapprocher l'expérience storefront de la maquette fournie.

## Modifications

- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/cart-drawer-provider.tsx` - ajouter l'état partagé d'ouverture du mini-cart
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/cart-drawer.tsx` - ajouter le drawer, l'overlay et le résumé panier
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/cart-drawer-line.tsx` - ajouter la ligne compacte du mini-cart
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/cart-badge.tsx` - ouvrir le drawer depuis le header
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/cart-badge-button.tsx` - porter le déclencheur header côté client
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/add-to-cart-button.tsx` - ouvrir le drawer après ajout réussi
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_actions/cart-actions.ts` - exposer une lecture fraîche du panier pour le drawer
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/panier/cart-line-row.tsx` - rafraîchir la route après mutation panier
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/layout.tsx` - monter le provider et le drawer au niveau storefront
- [x] `apps/pharmacie-1/src/lib/cart.ts` - exposer un view-model adapté au mini-cart
- [x] `packages/core/src/modules/cart/cart.types.ts` - enrichir le view-model cart avec la marque
- [x] `packages/core/src/modules/cart/cart.service.ts` - hydrater la marque dans les lignes panier
- [x] `packages/core/src/modules/cart/cart.repository.ts` - sélectionner la marque dans les lectures panier
- [x] `apps/pharmacie-1/messages/fr.json` - ajouter les libellés du mini-cart
- [x] `apps/pharmacie-1/messages/en.json` - ajouter les libellés du mini-cart

## Notes

Le drawer reste branché sur les server actions et le view-model serveur du panier. `router.refresh()` est utilisé après mutation pour resynchroniser le badge header et le contenu du drawer sans réimplémenter le repository côté client.

Bug corrigé après intégration :

- le drawer était alimenté par un snapshot chargé dans le layout storefront, alors que la page `/panier` relisait le panier directement côté page ;
- ce décalage de cycle de rendu pouvait produire un drawer non synchronisé avec la page panier ;
- le drawer recharge désormais son propre snapshot frais à l'ouverture et après ses mutations.

Validation effectuée :

- `pnpm --filter pharmacie-1 type-check`
- `pnpm --filter pharmacie-1 lint`

## Rollback

Supprimer les composants du mini-cart, retirer le provider du layout storefront, restaurer le comportement précédent du bouton d'ajout et de l'icône panier, puis retirer les clés i18n associées.
