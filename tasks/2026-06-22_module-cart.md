# Module Cart — Panier d'achat (lot 4.4)

**Date:** 2026-06-22
**Statut:** Terminé

## Contexte

Construction du module panier complet : schema, domaine, session anonyme/connectée, UI storefront.

## Modifications

- [x] `packages/core/prisma/schema.prisma` — modèles Cart + CartItem + relations
- [x] `packages/core/prisma/migrations/20260622114838_cart/` — migration
- [x] `packages/core/src/modules/cart/cart.types.ts` — types domaine
- [x] `packages/core/src/modules/cart/cart-errors.ts` — erreurs domaine
- [x] `packages/core/src/modules/cart/cart.repository.ts` — repository (CRUD, merge, item count)
- [x] `packages/core/src/modules/cart/cart.service.ts` — service (addItem, updateItemQty, removeItem, getCart, clearCart, mergeOnLogin)
- [x] `packages/core/src/modules/cart/index.ts` — exports publics
- [x] `packages/core/src/modules/catalog/product.repository.ts` — ajout id au cardInclude
- [x] `apps/pharmacie-1/src/lib/cart-session.ts` — résolution panier (cookie anonyme + auth + fusion)
- [x] `apps/pharmacie-1/src/lib/cart.ts` — couche données panier (view-models)
- [x] `apps/pharmacie-1/src/lib/catalog.ts` — defaultVariantId dans ProductCardVM, id dans variants ProductDetailVM
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_actions/cart-actions.ts` — server actions
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/add-to-cart-button.tsx` — bouton client
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/cart-badge.tsx` — compteur header
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/product-card.tsx` — câblé AddToCartButton
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/site-header.tsx` — CartBadge dynamique
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/produit/[slug]/page.tsx` — câblé AddToCartButton
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/panier/page.tsx` — page panier
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/panier/cart-line-row.tsx` — ligne panier client
- [x] `apps/pharmacie-1/messages/fr.json` — clés cart
- [x] `apps/pharmacie-1/messages/en.json` — clés cart

## Notes

- PriceBreakdown figé à l'ajout (snapshot)
- Cookie `cart_session` HttpOnly, SameSite=Lax, 30 jours
- Fusion anonyme → connecté à la première interaction panier après login
- Page panier noindex
- 166 tests passent (pas de régression)

## Rollback

Supprimer la migration cart, retirer les modèles du schema, supprimer les fichiers créés, restaurer les fichiers modifiés.
