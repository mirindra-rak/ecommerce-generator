# Search intent interpreter

**Date:** 2026-06-22 17:26
**Statut:** Terminé

## Contexte

La `Story 03` de l'epic `search-platform` doit faire évoluer l'intention de recherche
au-delà d'une simple requête canonicalisée. Le module `search` doit maintenant exposer
un interpréteur dédié qui détecte des entités configurées via le dictionnaire et
produit un contrat `SearchIntent` plus riche, réutilisable par les prochaines stories.

## Modifications

- [x] `packages/core/src/modules/search/search.types.ts` - enrichir `SearchIntent` avec les entités détectées et les matches de dictionnaire
- [x] `packages/core/src/modules/search/search-intent.interpreter.ts` - ajouter un interpréteur dédié pour construire l'intention de recherche
- [x] `packages/core/src/modules/search/search-intent.interpreter.test.ts` - couvrir la détection d'entités et la conservation du texte libre
- [x] `packages/core/src/modules/search/search.service.ts` - déléguer la construction de l'intention à l'interpréteur
- [x] `packages/core/src/modules/search/index.ts` - réexporter l'interpréteur et ses types
- [x] `packages/core/src/modules/search/search.service.test.ts` - couvrir l'exposition des entités via le service
- [x] `apps/pharmacie-1/site.config.ts` - ajouter un premier jeu de dictionnaire démonstratif pour la recherche storefront

## Notes

Cette itération conserve un comportement de retrieval textuel. L'interpréteur enrichit
simplement l'intention avec des entités détectées et des matches de dictionnaire, ce
qui prépare les futures projections de filtres structurés dans le repository.

## Rollback

Supprimer l'interpréteur et ses tests, restaurer la construction directe de
`SearchIntent` dans `search.service.ts`, retirer les ajouts de types et supprimer ce
fichier de task.
