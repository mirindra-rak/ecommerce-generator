# Rendu image de couverture catégorie

**Date:** 2026-06-19 16:22
**Statut:** Terminé

## Contexte

L'upload d'images catégorie est déjà disponible dans le back-office, mais la page catégorie storefront affiche encore un bandeau placeholder CSS au lieu d'exploiter l'image de couverture persistée.

## Modifications

- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/categorie/[slug]/page.tsx` - brancher `coverImageKey` sur le bandeau hero de catégorie

## Notes

Le domaine et la persistance sont déjà en place (`coverImageKey`, `thumbnailKey`). Le scope ici est limité au rendu storefront visible.
Validation exécutée : `pnpm lint`, `pnpm build`.

## Rollback

Retirer le rendu conditionnel de l'image dans la page catégorie et revenir au bandeau dégradé statique.
