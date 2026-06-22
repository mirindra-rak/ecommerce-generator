# Refonte epic search platform

**Date:** 2026-06-22 15:51
**Statut:** Terminé

## Contexte

L'epic de recherche existant est centré sur un cas d'usage produit full-text. Il faut
le faire évoluer vers une capacité plateforme de recherche e-commerce configurable par
domaine, sans logique métier codée en dur, tout en conservant le socle PostgreSQL déjà
présent dans le projet.

## Modifications

- [x] `specs/epics/2026-06-22-search-platform/epic.md` - formaliser la vision cible, les objectifs, les contraintes et les jalons du moteur de recherche plateforme
- [x] `specs/epics/2026-06-22-search-platform/epic-plan.md` - définir un plan d'implémentation incrémental fondé sur le socle `search` existant

## Notes

La recommandation retient une architecture hybride : PostgreSQL reste le moteur
d'indexation et de retrieval, tandis qu'une couche d'interprétation de requête,
de dictionnaires configurables et de stratégie de ranking est ajoutée dans le domaine
`search`. Cette approche minimise le risque de sur-ingénierie et évite une migration
précoce vers un moteur externe.

## Rollback

Supprimer le dossier `specs/epics/2026-06-22-search-platform/` ainsi que ce fichier de
task si ce cadrage doit être abandonné.
