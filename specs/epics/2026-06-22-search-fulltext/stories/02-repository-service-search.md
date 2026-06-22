# Story 02 : Repository + Service de recherche

**Epic parent** : [Recherche full-text PostgreSQL](../epic.md)
**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : M (~1-2 jours)

## Contexte

L'index GIN et la colonne `searchVector` sont en place (story 01). Il faut maintenant
le code TypeScript qui transforme une saisie utilisateur en `tsquery`, exécute la
recherche avec ranking pondéré, combine avec les filtres facettes existants, et retourne
des résultats paginés. Tout passe par un repository (accès données) et un service de
domaine (logique métier).

## User Story

**En tant que** module consommateur (API route, admin), **je veux** un service de
recherche qui accepte un terme libre + des filtres facettes optionnels, **afin de**
obtenir des produits classés par pertinence avec compteurs de facettes pour le
drill-down.

## Critères d'acceptation

### Scénario 1 : Recherche simple par terme

- **Étant donné** des produits indexés (« Doliprane 1000mg », « Crème solaire SPF 50 »)
- **Quand** on appelle `searchService.search({ query: "doliprane" })`
- **Alors** :
  - Les produits dont le `searchVector` matche la tsquery sont retournés
  - Les résultats sont triés par `ts_rank` décroissant (pertinence)
  - Seuls les produits `active = true` sont retournés

### Scénario 2 : Recherche multi-mots

- **Étant donné** des produits indexés
- **Quand** on cherche `"crème solaire"`
- **Alors** la requête est transformée en tsquery avec opérateur AND entre les mots
  (`crème & solaire`), et le stemming français s'applique (« crèmes solaires » matche)

### Scénario 3 : Recherche par EAN / SKU

- **Étant donné** un produit avec variante SKU `"ACM-SPF50-200"` et EAN `"3401560123456"`
- **Quand** on cherche `"3401560123456"` ou `"ACM-SPF50"`
- **Alors** le produit est retourné (match via dictionnaire `simple`, pas de stemming
  sur les codes)

### Scénario 4 : Recherche combinée avec filtres facettes

- **Étant donné** des produits matchant « crème » dont certains ont la facette
  `nature=crème` et d'autres `nature=gel`
- **Quand** on cherche `{ query: "crème", filters: { nature: ["crème"] } }`
- **Alors** seuls les produits matchant le terme ET la facette sont retournés

### Scénario 5 : Compteurs de facettes drill-down

- **Étant donné** 10 produits matchant « solaire » dont 6 avec `nature=spray` et
  4 avec `nature=crème`
- **Quand** on cherche `{ query: "solaire" }` (sans filtre)
- **Alors** les compteurs retournés indiquent `spray: 6, crème: 4`
- **Quand** on ajoute le filtre `conditionnement=tube`
- **Alors** les compteurs de `nature` sont recalculés en excluant le filtre
  `conditionnement` du propre comptage de `nature` (drill-down, même logique que
  le listing catégorie existant)

### Scénario 6 : Pagination

- **Étant donné** 50 produits matchant « vitamine »
- **Quand** on cherche `{ query: "vitamine", page: 2, pageSize: 24 }`
- **Alors** les résultats 25 à 48 sont retournés, avec `total: 50`, `totalPages: 3`,
  `page: 2`

### Scénario 7 : Tri alternatif

- **Étant donné** des résultats de recherche
- **Quand** on spécifie `sort: "price-asc"` (ou `price-desc`, `name`, `relevance`)
- **Alors** les résultats sont triés selon le critère choisi au lieu de la pertinence
- Le tri par défaut est `relevance` (ts_rank décroissant)

### Scénario 8 : Mise à jour du vecteur de recherche

- **Étant donné** un produit existant
- **Quand** le service de catalogue modifie son nom, sa marque, ou ses variantes
- **Alors** le service de recherche est appelé pour recalculer le `searchVector`
  (via la fonction SQL de la story 01)

### Scénario 9 : Aucun résultat

- **Étant donné** aucun produit ne matchant le terme
- **Quand** on cherche `{ query: "xyznonexistent" }`
- **Alors** le service retourne une liste vide avec `total: 0`, pas d'erreur

## Non-objectifs

- Pas de suggestions / autocomplete (story 03).
- Pas de correction orthographique ni de synonymes.
- Pas de recherche floue (trigram `pg_trgm`) — itération ultérieure si le stemming
  français ne suffit pas.

## Contraintes

- Le repository utilise `prisma.$queryRaw` pour les requêtes tsvector/tsquery (Prisma
  ne supporte pas les opérateurs FTS nativement).
- Le service expose des types stricts : `SearchQuery`, `SearchResult`,
  `SearchResultItem` (pas de `any`).
- Les compteurs de facettes réutilisent la même logique de drill-down que
  `facet.repository.ts` — factoriser si possible, sinon dupliquer avec commentaire
  de justification.
- Le `ProductCardVM` existant est réutilisé pour les items de résultat (même shape
  que le listing catégorie).
