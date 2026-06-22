# Breadcrumb hiérarchie catégorie

**Date:** 2026-06-22 17:33
**Statut:** Terminé

## Contexte

Le breadcrumb du listing catégorie n'affiche aujourd'hui que `Accueil / catégorie courante`, alors qu'il doit refléter la hiérarchie réelle de la catégorie, par exemple `Accueil / HYGIENE TEST / sous-catégorie`.

## Modifications

- [x] `apps/pharmacie-1/src/lib/catalog.ts` - exposer les ancêtres actifs de la catégorie courante dans le view-model
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/categorie/[slug]/page.tsx` - rendre un breadcrumb hiérarchique basé sur les ancêtres

## Notes

La hiérarchie affichée remonte les parents directs jusqu'à la racine active, sans dupliquer la catégorie courante dans la liste d'ancêtres.

## Rollback

Retirer le champ `breadcrumbs` du view-model catégorie et restaurer le breadcrumb simplifié `Accueil / catégorie courante`.
