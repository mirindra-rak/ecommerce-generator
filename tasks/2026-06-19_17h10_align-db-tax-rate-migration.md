# Align Database With Tax Rate Migration

**Date:** 2026-06-19 17:10
**Statut:** Terminé

## Contexte

La page d'édition produit échoue au runtime car le code Prisma attend la colonne `Product.taxRateId`, absente de la base PostgreSQL locale. Le repository et le schéma Prisma sont déjà alignés sur la migration `20260619183000_pricing_tax_rate_reference`.

## Modifications

- [x] `database` - application de la migration Prisma en attente pour ajouter `Product.taxRateId`, créer `TaxRate` et supprimer l'ancien champ `vatRate`
- [x] `tasks/2026-06-19_17h10_align-db-tax-rate-migration.md` - journalisation de l'intervention de réalignement du schéma

## Notes

Le symptôme provient d'un schema drift entre le code applicatif et la base locale. La correction visée est infrastructurelle, sans fallback applicatif temporaire.
Validation effectuée avec `prisma migrate status` puis une requête Prisma `product.findFirst({ select: { taxRateId, taxRate } })`.

## Rollback

Restaurer la base depuis un backup antérieur à la migration, ou rejouer le schéma précédent dans un environnement de développement dédié si un retour arrière devient nécessaire.
