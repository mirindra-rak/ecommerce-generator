# Search foundation refactor

**Date:** 2026-06-22 17:01
**Statut:** Terminé

## Contexte

La nouvelle epic `search-platform` commence par la stabilisation du contrat public du
module `search`. L'objectif est de sortir les types métier de `search.service.ts` et
de faire évoluer le service vers un orchestrateur de pipeline, sans casser le
comportement actuel fondé sur PostgreSQL full-text.

## Modifications

- [x] `packages/core/src/modules/search/search.types.ts` - extraire les contrats métier publics du module `search`
- [x] `packages/core/src/modules/search/search.service.ts` - préparer une orchestration de pipeline avec intention de recherche et paramètres résolus
- [x] `packages/core/src/modules/search/index.ts` - réaligner les exports publics du module

## Notes

Cette itération introduit un contrat `SearchIntent` minimal qui reste compatible avec
le moteur actuel. L'interprétation reste encore simple et textuelle, mais le service
est désormais structuré pour accueillir le `QueryNormalizer` et le
`SearchIntentInterpreter` des stories suivantes.

## Rollback

Supprimer `packages/core/src/modules/search/search.types.ts`, restaurer les types dans
`search.service.ts`, puis retirer ce fichier de task.
