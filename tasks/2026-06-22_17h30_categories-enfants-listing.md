# Catégories enfants listing

**Date:** 2026-06-22 17:30
**Statut:** Terminé

## Contexte

Le listing catégorie storefront n'expose pas les catégories enfants de la catégorie courante sous la bannière, alors qu'elles doivent servir de navigation contextuelle rapide.

## Modifications

- [x] `apps/pharmacie-1/src/lib/catalog.ts` - exposer les catégories enfants actives dans le view-model de page catégorie
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/categorie/[slug]/page.tsx` - afficher les catégories enfants sous la bannière sous forme de liens contextuels
- [x] `apps/pharmacie-1/messages/fr.json` - ajouter le libellé storefront associé
- [x] `apps/pharmacie-1/messages/en.json` - ajouter le libellé storefront associé

## Notes

Le comportement attendu concerne uniquement les enfants directs actifs de la catégorie sélectionnée.
Les fichiers de messages portent déjà d'autres changements locaux non liés ; cette tâche y ajoute seulement la clé `categoryPage.childCategoriesLabel`.

## Rollback

Retirer le champ `childCategories` du view-model catégorie, supprimer le rendu des liens sous la bannière et enlever les nouvelles clés de traduction.
