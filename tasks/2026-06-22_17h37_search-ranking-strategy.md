# Search ranking strategy

**Date:** 2026-06-22 17:37
**Statut:** Terminé

## Contexte

La `Story 05` extrait la pertinence hors du simple `ORDER BY` SQL. Le module `search`
doit maintenant exposer une stratégie de ranking configurable, testée unitairement, et
branchée dans le service pour le tri `relevance`, sans remettre en cause le retrieval
PostgreSQL construit aux stories précédentes.

## Modifications

- [x] `packages/core/src/config/site-config.ts` - étendre la configuration `search` avec des poids de ranking optionnels
- [x] `packages/core/src/index.ts` - réexporter les types de ranking de configuration
- [x] `packages/core/src/modules/search/search-ranking.types.ts` - définir les signaux et poids de ranking
- [x] `packages/core/src/modules/search/search-ranking.strategy.ts` - ajouter la stratégie pure de scoring et d'ordonnancement
- [x] `packages/core/src/modules/search/search-ranking.strategy.test.ts` - couvrir les signaux et la configuration
- [x] `packages/core/src/modules/search/search.repository.ts` - exposer `rank` et `fuzzyRank` dans le contrat raw
- [x] `packages/core/src/modules/search/search.service.ts` - appliquer la stratégie pour le tri `relevance`
- [x] `packages/core/src/modules/search/index.ts` - réexporter la stratégie et ses types
- [x] `apps/pharmacie-1/site.config.ts` - préparer des poids de ranking explicites au niveau site

## Notes

Le SQL continue de fournir un pré-ordre utile via `ts_rank` et `fuzzy_rank`, mais la
décision finale de pertinence sur les lignes candidates d'une page est maintenant
pilotée par une stratégie pure, configurable et testable.

## Rollback

Supprimer les fichiers de stratégie de ranking, retirer la configuration `ranking`
depuis `SiteConfig`, restaurer le mapping direct des rows dans `search.service.ts`,
puis supprimer ce fichier de task.
