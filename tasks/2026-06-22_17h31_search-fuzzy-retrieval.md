# Search fuzzy retrieval

**Date:** 2026-06-22 17:31
**Statut:** Terminé

## Contexte

La `Story 04` doit enrichir le retrieval PostgreSQL existant avec une tolérance légère
aux fautes de frappe et aux variantes d'écriture, sans abandonner le full-text comme
chemin principal. Le repository doit réutiliser le même prédicat de match pour les
résultats et les facettes, et le schéma doit préparer `pg_trgm` côté base.

## Modifications

- [x] `packages/core/prisma/migrations/20260622173133_search_trigram/migration.sql` - activer `pg_trgm` et `unaccent`, puis ajouter des index trigram utiles au retrieval
- [x] `packages/core/src/modules/search/search.repository.ts` - centraliser le prédicat de match et ajouter un fuzzy fallback léger via trigram
- [x] `packages/core/src/modules/search/search.service.ts` - transmettre la requête normalisée au repository pour le fuzzy fallback
- [x] `packages/core/src/modules/search/search.service.test.ts` - couvrir la tolérance aux fautes de frappe côté service

## Notes

Le retrieval conserve PostgreSQL FTS comme signal principal. Le fuzzy fallback est
borné par une longueur minimale et un seuil de similarité pour éviter d'élargir
excessivement la recherche. Les suggestions ne sont pas encore fuzzy dans cette
itération.

## Rollback

Supprimer la migration `search_trigram`, restaurer le prédicat full-text précédent dans
`search.repository.ts`, retirer la transmission de la requête normalisée depuis
`search.service.ts`, puis supprimer ce fichier de task.
