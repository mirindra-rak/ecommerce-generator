# Search normalization and dictionaries

**Date:** 2026-06-22 17:09
**Statut:** Terminé

## Contexte

La `Story 02` de l'epic `search-platform` introduit deux briques structurantes :
une normalisation canonique de la requête et des dictionnaires configurables par site.
Le projet suit un modèle Silo, donc `site.config.ts` est la bonne source de vérité pour
porter cette configuration sans coupler `core` à une app donnée.

## Modifications

- [x] `packages/core/src/config/site-config.ts` - étendre le contrat `SiteConfig` avec une configuration `search`
- [x] `packages/core/src/index.ts` - réexporter les types de configuration `search`
- [x] `packages/core/src/modules/search/query-normalizer.ts` - ajouter la normalisation canonique des requêtes
- [x] `packages/core/src/modules/search/query-normalizer.test.ts` - couvrir la normalisation
- [x] `packages/core/src/modules/search/search-dictionary.types.ts` - définir les types des dictionnaires configurables
- [x] `packages/core/src/modules/search/search-dictionary.repository.ts` - ajouter le repository de dictionnaire et la canonicalisation
- [x] `packages/core/src/modules/search/search-dictionary.repository.test.ts` - couvrir la canonicalisation et le matching
- [x] `packages/core/src/modules/search/search.types.ts` - accepter une configuration `search` optionnelle sur la requête
- [x] `packages/core/src/modules/search/search.service.ts` - intégrer le normalizer et la canonicalisation dans l'intention minimale
- [x] `packages/core/src/modules/search/search.service.test.ts` - couvrir la normalisation et les alias configurables
- [x] `packages/core/src/modules/search/index.ts` - réexporter les nouveaux contrats utilitaires
- [x] `apps/pharmacie-1/site.config.ts` - préparer le point d'ancrage de configuration `search`

## Notes

Le dictionnaire de cette itération ne fait pas encore d'extraction d'entités. Il
canonicalise la requête en remplaçant des alias et expressions équivalentes par un
terme canonique, ce qui améliore la compatibilité avec le retrieval PostgreSQL actuel
sans forcer une refonte du repository.

## Rollback

Supprimer les nouveaux fichiers du module `search`, retirer la clé `search` du contrat
`SiteConfig`, restaurer `search.service.ts` à son état précédent, puis supprimer ce
fichier de task.
