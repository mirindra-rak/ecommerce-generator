# Sidebar filtres sticky

**Date:** 2026-06-22 17:08
**Statut:** Terminé

## Contexte

La sidebar de filtres du listing catégorie doit rester visible pendant le scroll et disposer de son propre overflow quand la liste de facettes dépasse la hauteur disponible.

## Modifications

- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/categorie/[slug]/page.tsx` - rendre la sidebar de filtres sticky avec un scroll interne sur desktop

## Notes

Le comportement reste inchangé sur mobile, où les filtres continuent de passer par le bloc repliable.
Sur desktop, la sidebar reste ancrée avec `top-28` et bascule sur un scroll interne via `max-h-[calc(100vh-7rem)]`.

## Rollback

Retirer les classes `sticky`, `top-*`, `max-h-*` et `overflow-y-auto` de la sidebar de la page catégorie.
