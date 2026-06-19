# Module Inventory — Stock & disponibilité (lot 4.3)

**Date:** 2026-06-19 16:48
**Statut:** Terminé

## Contexte

Le module `inventory` dans `packages/core/src/modules/inventory/` était un stub vide. Le stock n'était qu'un champ `Int` sur `ProductVariant` sans logique métier, audit trail ou service dédié. Implémentation complète des 4 stories de l'epic inventory.

## Modifications

- [x] `packages/core/prisma/schema.prisma` — ajout enums `OutOfStockBehavior`, `StockMovementReason`, champs inventory sur `ProductVariant`, modèle `StockMovement`
- [x] `packages/core/prisma/migrations/20260619134742_inventory_module/` — migration Prisma
- [x] `packages/core/src/modules/inventory/inventory.types.ts` — types d'entrée/sortie du module
- [x] `packages/core/src/modules/inventory/inventory.repository.ts` — repository (getVariantStock, getMovements, createMovement, updateSettings)
- [x] `packages/core/src/modules/inventory/inventory.service.ts` — service (adjust, isAvailable, getMovementHistory, updateSettings, alertes)
- [x] `packages/core/src/modules/inventory/inventory.service.test.ts` — 19 tests unitaires
- [x] `packages/core/src/modules/inventory/email-notifier.ts` — notifier email (console.warn en attendant module email)
- [x] `packages/core/src/modules/inventory/index.ts` — exports publics
- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/stock-editor.tsx` — composant client StockEditor
- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/_actions.ts` — server actions adjustStockAction + updateInventorySettingsAction
- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/[id]/page.tsx` — chargement données inventory
- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx` — section Stocks intégrée
- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/variants-editor.tsx` — champ stock retiré
- [x] `apps/pharmacie-1/messages/fr.json` — clés i18n admin.products.stock
- [x] `apps/pharmacie-1/messages/en.json` — clés i18n admin.products.stock

## Notes

- Politique `DEFAULT` pour `outOfStockBehavior` retourne `false` en attendant config site-level
- Email notifier en mode `console.warn` — à remplacer quand le module `email` sera construit
- Le champ stock reste dans `VariantRow` pour le stock initial à la création, mais n'est plus éditable dans le variant editor (géré via section Stocks)

## Rollback

1. Supprimer la migration : `pnpm --filter @pharmacie/core exec prisma migrate resolve --rolled-back 20260619134742_inventory_module`
2. Retirer les champs et modèles ajoutés dans `schema.prisma`
3. Supprimer les fichiers créés dans `packages/core/src/modules/inventory/`
4. Revert les modifications dans les fichiers admin (git checkout)
