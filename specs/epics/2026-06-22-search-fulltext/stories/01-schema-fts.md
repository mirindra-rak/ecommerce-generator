# Story 01 : Schema FTS — migration, index GIN, colonne tsvector

**Epic parent** : [Recherche full-text PostgreSQL](../epic.md)
**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : M (~1 jour)

## Contexte

PostgreSQL offre un moteur full-text natif performant via `tsvector` / `tsquery`.
Pour l'exploiter, il faut une colonne `tsvector` sur la table `Product`, un index GIN
pour des recherches sub-milliseconde, et un trigger pour maintenir le vecteur à jour
lors des INSERT / UPDATE. Prisma ne supporte pas nativement `tsvector` — la migration
passe par du SQL brut dans un fichier `migration.sql`.

## User Story

**En tant que** développeur du module search, **je veux** une colonne `searchVector`
indexée sur la table `Product`, **afin de** pouvoir exécuter des requêtes full-text
performantes sans dépendance externe.

## Critères d'acceptation

### Scénario 1 : La migration crée la colonne et l'index

- **Étant donné** la base de données existante sans colonne `searchVector`
- **Quand** on exécute `pnpm --filter @pharmacie/core db:migrate`
- **Alors** :
  - La table `Product` possède une colonne `search_vector` de type `tsvector`
  - Un index GIN existe sur `Product.search_vector`
  - La migration est idempotente (re-run sans erreur)

### Scénario 2 : Le vecteur agrège les champs avec poids différenciés

- **Étant donné** un produit avec nom, marque, SKU/EAN, shortDescription, description
  et attributs JSON
- **Quand** le trigger (ou la fonction) calcule le `search_vector`
- **Alors** le vecteur contient :
  - Poids **A** : `name`, `brand.name`, premier SKU, premier EAN
  - Poids **B** : `shortDescription`
  - Poids **C** : `description`, valeurs extraites de `attributes` (JSON)
- Et le dictionnaire utilisé est `french` pour les champs textuels, `simple` pour
  SKU / EAN (pas de stemming sur les codes)

### Scénario 3 : Le vecteur se met à jour automatiquement

- **Étant donné** un produit existant avec un `search_vector` calculé
- **Quand** on modifie le `name`, la `description`, ou on change la marque associée
- **Alors** le `search_vector` est recalculé automatiquement (trigger ou appel explicite
  depuis le service)

### Scénario 4 : Les produits existants sont indexés

- **Étant donné** des produits déjà présents en base avant la migration
- **Quand** la migration s'exécute
- **Alors** tous les produits existants ont leur `search_vector` calculé (backfill)

## Non-objectifs

- Pas de colonnes tsvector sur `Category`, `Brand` ou `FacetValue` (recherche produits
  uniquement).
- Pas de dictionnaire multilingue (le catalogue est en français) — extensible plus tard.
- Pas de logique de requête (tsquery) — c'est la story 02.

## Contraintes

- La migration utilise du **SQL brut** dans le fichier Prisma migration (Prisma ne gère
  pas `tsvector` nativement).
- Le trigger/fonction PostgreSQL doit joindre `Brand.name` via une sous-requête (la
  marque est dans une table séparée).
- Les variantes (SKU, EAN) sont dans `ProductVariant` — le trigger doit agréger les
  valeurs des variantes liées.
- `attributes` est un champ JSONB — extraire les valeurs (pas les clés) pour
  l'indexation.
- Le schéma Prisma reste synchronisé : ajouter un commentaire `/// @db.Tsvector` ou
  un champ `Unsupported("tsvector")` si nécessaire pour que `prisma db pull` ne casse
  pas.

## Questions ouvertes

- 🚧 **Trigger vs appel explicite** : un trigger `BEFORE INSERT OR UPDATE` sur
  `Product` est simple mais ne capte pas les changements de `Brand.name` ou des
  variantes (tables liées). Alternative : fonction SQL appelée explicitement par le
  service après chaque mutation. Hypothèse retenue : **fonction SQL appelée par le
  service** (plus prévisible, couvre les cas cross-table).
