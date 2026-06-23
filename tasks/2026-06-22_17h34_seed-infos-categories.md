# Seed infos catégories

**Date:** 2026-06-22 17:34
**Statut:** Terminé

## Contexte

Le seed catégorie alimente actuellement seulement le strict minimum structurel (`name`, `slug`, `position`, parent), alors que le modèle `Category` prévoit aussi des champs éditoriaux et SEO utiles au storefront.

## Modifications

- [x] `packages/core/prisma/seed.ts` - enrichir le seed catégorie avec des champs éditoriaux et SEO générés depuis le nom et la hiérarchie

## Notes

La source PrestaShop riche n'est pas disponible dans ce workspace, donc l'enrichissement est généré de façon déterministe à partir des données déjà présentes dans `catalog.json`.
Le `db:seed` local a été relancé avec succès, et une lecture Prisma de contrôle confirme que `description`, `shortDescription`, `additionalInfo`, `metaTitle`, `metaDescription` et `metaKeywords` sont désormais remplis sur les catégories seedées.

## Rollback

Retirer les helpers de génération de contenu catégorie et restaurer les appels `prisma.category.create` au seed minimal.
