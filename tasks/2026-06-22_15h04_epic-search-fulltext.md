# Epic search full-text PostgreSQL

**Date:** 2026-06-22 15:04
**Statut:** Terminé

## Contexte

Formaliser le lot 4.4 de recherche full-text PostgreSQL pour cadrer l'architecture, le périmètre fonctionnel, les contraintes de performance et le séquencement des stories avant implémentation.

## Modifications

- [x] `specs/epics/2026-06-22-search-fulltext/epic.md` - définition de l'epic, des objectifs, non-objectifs, contraintes et jalons
- [x] `specs/epics/2026-06-22-search-fulltext/stories/01-schema-fts-plan.md` - plan d'implémentation pour la migration FTS et l'indexation
- [x] `specs/epics/2026-06-22-search-fulltext/stories/01-schema-fts.md` - user story et critères d'acceptation pour la colonne `tsvector` et l'index GIN
- [x] `specs/epics/2026-06-22-search-fulltext/stories/02-repository-service-search-plan.md` - plan d'implémentation du repository et du service de recherche
- [x] `specs/epics/2026-06-22-search-fulltext/stories/02-repository-service-search.md` - user story et critères d'acceptation du domaine search
- [x] `specs/epics/2026-06-22-search-fulltext/stories/03-api-autocomplete.md` - user story de l'endpoint autocomplete
- [x] `specs/epics/2026-06-22-search-fulltext/stories/04-searchbox-interactif.md` - user story du composant SearchBox interactif
- [x] `specs/epics/2026-06-22-search-fulltext/stories/05-page-resultats-recherche.md` - user story de la page de résultats avec facettes, tri et pagination

## Notes

Le design retient PostgreSQL natif (`tsvector`, `tsquery`, `ts_rank`, index GIN) et préserve le repository pattern imposé par le projet, sans introduire de service de recherche externe.

## Rollback

Supprimer le dossier `specs/epics/2026-06-22-search-fulltext/` et ce fichier de task si cette phase de cadrage doit être abandonnée.
