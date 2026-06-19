# Socle pricing + référentiel TVA

**Date:** 2026-06-19 17:10
**Statut:** Terminé

## Contexte

Le projet stocke déjà des prix HT et des taux de TVA, mais sans module métier de pricing ni référentiel fiscal dédié. Les produits portent encore un entier `vatRate` isolé, ce qui rend le storefront, l'administration et les futurs calculs transactionnels fragiles.

## Modifications

- [x] `specs/epics/2026-06-19-pricing/epic.md` - créer l'epic pricing (référentiel TVA, noyau pricing, intégrations produit/storefront)
- [x] `specs/epics/2026-06-19-pricing/epic-plan.md` - formaliser le plan d'implémentation de l'epic selon le workflow `spec -> plan -> coder -> review`
- [x] `packages/core/prisma/schema.prisma` - introduire le référentiel `TaxRate` et rattacher les produits
- [x] `packages/core/prisma/migrations/*/migration.sql` - migrer les données produits vers `TaxRate`
- [x] `packages/core/prisma/seed.ts` - seeder les taux de TVA et relier les produits importés
- [x] `packages/core/src/modules/pricing/*` - implémenter le noyau métier pricing et le repository TVA
- [x] `packages/core/src/modules/catalog/*` - adapter les produits au rattachement `taxRate`
- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/*` - exposer le taux de TVA dans le back-office
- [x] `apps/pharmacie-1/src/lib/catalog.ts` - exposer les prix TTC via le noyau pricing
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/*` - afficher TTC côté storefront
- [x] `apps/pharmacie-1/messages/*.json` - ajouter les libellés TVA/TTC nécessaires
- [x] `packages/core/src/modules/*/*.test.ts` - couvrir pricing + intégration produit/TVA
- [x] `packages/core/src/modules/cart/*` / `packages/core/src/modules/order/*` - brancher explicitement le contrat transactionnel `PriceBreakdown` sur les futurs modules
- [x] `ARCHITECTURE.md` - ADR-004 pricing centralisé consommé par les modules transactionnels
- [x] `specs/epics/2026-06-19-pricing/stories/*` - specs des 6 stories de l'epic

## Notes

Le périmètre visé reste le socle pricing: référentiel de TVA, calcul HT/TVA/TTC, affichage storefront et pilotage produit. Les promotions, le panier et la commande restent hors scope.
Réalignement explicite sur le workflow d'équipe: le code déjà entamé localement est mis en pause tant que l'étape `plan` n'est pas validée.
Le socle pricing a finalement été implémenté et vérifié dans `core` et `apps/pharmacie-1`. Le point restant est surtout l'intégration explicite du contrat `PriceBreakdown` dans les modules transactionnels futurs (`cart`, `order`), laissés hors scope immédiat.

## Rollback

Revenir aux fichiers précédents, supprimer la migration `TaxRate`, rétablir le stockage direct de `vatRate` sur `Product`, puis relancer la base de développement à partir de l'état antérieur.
