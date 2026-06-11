# Story : Admin — catégories (arborescence) & marques

**Epic parent** : [Catalogue](../epic.md)
**Date** : 2026-06-11 · **Statut** 🟡 · **Estimation** M

## Contexte

Gérer la taxonomie du catalogue : une arborescence de catégories et une liste de
marques, depuis le back-office. Structure indispensable au listing storefront (story 05)
et au rangement des produits (story 03).

## User Story

**En tant que** gestionnaire de la pharmacie, **je veux** organiser les catégories en
arborescence et gérer les marques, **afin de** structurer le catalogue et la navigation.

## Critères d'acceptation

### Scénario 1 : Créer une catégorie racine ou enfant

- **Étant donné** le back-office des catégories
- **Quand** je crée une catégorie en choisissant (ou non) un parent
- **Alors** elle est persistée avec son `parentId` et un `slug` unique
- **Et** l'arborescence est affichée hiérarchiquement

### Scénario 2 : Déplacer une catégorie

- **Étant donné** une catégorie existante
- **Quand** je change son parent
- **Alors** la nouvelle hiérarchie est persistée
- **Et** créer un cycle (rattacher une catégorie sous l'un de ses descendants) est refusé

### Scénario 3 : Supprimer une catégorie

- **Étant donné** une catégorie ayant des enfants et/ou des produits
- **Quand** je tente de la supprimer
- **Alors** la suppression est **refusée** avec un message expliquant qu'il faut
  d'abord déplacer/détacher enfants et produits
- **Et** une catégorie vide se supprime sans erreur

### Scénario 4 : Gérer les marques

- **Étant donné** le back-office des marques
- **Quand** je crée, édite ou supprime une marque
- **Alors** l'opération est persistée ; `slug` unique ; supprimer une marque liée à des
  produits les laisse sans marque (marque optionnelle, cf. story 01)

## Non-objectifs

- Médias/bannières de catégorie (hors périmètre initial).
- SEO avancé par catégorie (méta, → lot 8.2).
- Réordonnancement fin par glisser-déposer si trop coûteux : un champ `position`
  suffit. 🚧

## Contraintes

- Écrans dans `apps/pharmacie-1/src/app/admin` ; accès via repositories `core`.
- Lecture de l'arbre via CTE récursif PostgreSQL ou parcours applicatif (au choix
  d'implémentation, à acter en `/plan`).

## Questions ouvertes

- 🚧 Profondeur d'arborescence maximale ? Hypothèse : non limitée techniquement,
  recommandation UX de ≤ 3 niveaux.
- 🚧 Même dépendance au socle admin (lot 5.1) que la story 03.
