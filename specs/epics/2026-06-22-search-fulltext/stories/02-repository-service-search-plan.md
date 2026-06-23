# Plan : Repository + Service de recherche

**Ticket** : [02-repository-service-search](./02-repository-service-search.md) · **Statut** ✅

## Résumé

Implémenter le repository de recherche (requêtes `$queryRaw` tsvector/tsquery avec
ranking pondéré et filtres facettes) et le service de domaine qui expose une API
typée search + suggest + drill-down facettes, avec tri et pagination.

## Fichiers à créer ou modifier

- `packages/core/src/modules/search/search.repository.ts` — **modifié** : ajouter
  `search(query, filters, sort, limit, offset)` et `suggest(query, limit)` au
  repository existant (qui a déjà `refreshSearchVector`)
- `packages/core/src/modules/search/search.service.ts` — **créé** : service de domaine
  exposant `search(SearchQuery): SearchResult` et `suggest(query): SuggestItem[]`,
  types stricts `SearchQuery`, `SearchResult`, `SearchResultItem`, `SuggestItem`
- `packages/core/src/modules/search/search-sanitize.ts` — **créé** : fonction de
  sanitization du terme utilisateur → tsquery valide (strip des opérateurs, split
  multi-mots → AND, préfixe `:*` pour suggest)
- `packages/core/src/modules/search/index.ts` — **modifié** : réexporter le service
  et les types
- `packages/core/src/modules/search/search.service.test.ts` — **créé** : tests
  d'intégration du service (scénarios 1 à 9 de la spec)
- `packages/core/src/modules/search/search-sanitize.test.ts` — **créé** : tests
  unitaires de la sanitization (cas limites, caractères spéciaux, multi-mots)

## Étapes de développement

### 1. Sanitization du terme de recherche

Créer `search-sanitize.ts` avec deux fonctions :

- `toSearchTsquery(input: string): string | null` — strip les caractères spéciaux
  tsquery (`&`, `|`, `!`, `(`, `)`, `:`, `*`, `<`, `>`), split sur les espaces,
  filtre les tokens vides, joint avec `&` (AND). Retourne `null` si aucun token
  valide. Chaque token passe par `french` sauf si le token ressemble à un code
  (chiffres/tirets → `simple`).
- `toSuggestTsquery(input: string): string | null` — même logique mais le dernier
  token reçoit le suffixe `:*` (prefix match pour autocomplete).

Test : écrire `search-sanitize.test.ts` — tests unitaires purs (pas de DB) couvrant :
mots simples, multi-mots, caractères spéciaux, tokens vides, chaîne vide, EAN pur.

### 2. Méthode `search` dans le repository

Ajouter au repository `search.repository.ts` une méthode `search()` qui exécute une
requête SQL brute (`$queryRaw`) :

- `SELECT` les champs de Product + Brand.name + variantes agrégées (min price) +
  premier média + `ts_rank(search_vector, tsquery)` comme score
- `WHERE active = true AND search_vector @@ tsquery`
- Avec clauses AND dynamiques pour les filtres facettes (même pattern que
  `findCardsByCategorySlug` mais en SQL brut car on combine FTS + facettes)
- `ORDER BY` : `relevance` → `ts_rank DESC`, `price-asc/desc` → min variant price,
  `name` → `Product.name COLLATE`, `new` → `createdAt DESC`
- `LIMIT` / `OFFSET` pour la pagination server-side
- Un second `SELECT COUNT(*)` (ou CTE) pour le total sans pagination

Retourne un type brut `SearchRawResult` contenant les colonnes nécessaires à la
construction du `ProductCardVM` + le total.

Test : `pnpm type-check` passe.

### 3. Méthode `suggest` dans le repository

Ajouter `suggest(tsquery: string, limit: number)` : même requête simplifiée (pas de
facettes, pas de pagination), retourne `name`, `slug`, `brandName`, `priceLabel`,
première `imageKey`, limité à `limit` résultats triés par `ts_rank DESC`.

Test : `pnpm type-check` passe.

### 4. Compteurs de facettes drill-down pour la recherche

Ajouter `searchFacetCounts(tsquery: string, filters: Record<string, string[]>)` au
repository. Même logique que `facet.repository.findForCategoryWithCounts` mais la
clause de base est `search_vector @@ tsquery AND active = true` au lieu de
`categories: { some: { slug } }`. On boucle sur les facettes présentes dans les
résultats et on compte en excluant la facette courante (drill-down).

Choix : dupliquer la logique (SQL brut) plutôt que factoriser avec la version Prisma
du facet repository — les deux approches (Prisma ORM vs $queryRaw FTS) sont trop
différentes pour un shared helper propre.

Test : `pnpm type-check` passe.

### 5. Service de domaine `search.service.ts`

Créer le service avec :

- Types : `SearchQuery { query, filters?, sort?, page?, pageSize? }`,
  `SearchResultItem` (compatible `ProductCardVM`), `SearchResult { items, facets,
total, totalPages, page, query }`, `SuggestItem { name, slug, brandName, priceLabel,
imageKey }`
- `search(query: SearchQuery): Promise<SearchResult>` : sanitize → repo.search →
  repo.searchFacetCounts → assemble le résultat avec pagination metadata
- `suggest(rawQuery: string, limit?: number): Promise<SuggestItem[]>` : sanitize →
  repo.suggest
- Gère le cas `query.length < 2` ou sanitize retourne `null` → résultat vide

Test : `pnpm type-check` passe.

### 6. Mettre à jour le barrel `index.ts`

Réexporter le service et les types depuis `search/index.ts`.

Test : import `from "../search"` résout.

### 7. Tests d'intégration du service

Créer `search.service.test.ts` couvrant les scénarios de la spec :

- Recherche simple par terme → résultats triés par pertinence
- Recherche multi-mots (AND)
- Recherche par EAN / SKU
- Recherche combinée avec filtre facette
- Compteurs de facettes drill-down
- Pagination (page 2)
- Tri alternatif (price-asc)
- Aucun résultat → liste vide, total 0
- Mise à jour du vecteur (déjà couvert par story 01, vérifier l'intégration)

Seed de test : créer 3-5 produits avec marques, facettes et variantes variées via
`createProduct` dans un `beforeAll` ou `beforeEach`.

Test : `pnpm --filter @pharmacie/core test -- search` passe.

## Points d'attention

- **SQL brut et injection** : tous les paramètres passent par les tagged templates
  Prisma (`$queryRaw\`...\``) qui sont paramétrés — pas d'injection possible. Ne jamais
  concaténer du SQL à la main.
- **Double dictionnaire** : la tsquery doit mixer `french` et `simple` pour matcher à
  la fois le texte stemmé et les codes EAN/SKU. La sanitization doit produire une
  tsquery qui couvre les deux : `to_tsquery('french', ...) || to_tsquery('simple', ...)`
  pour chaque token.
- **Facettes drill-down en SQL brut** : la boucle par facette implique N requêtes
  (une par facette présente dans les résultats). Acceptable pour un catalogue de
  quelques milliers de produits et ~5-10 facettes. Si ça pose un problème de latence,
  on pourra regrouper en une seule requête avec `FILTER(WHERE ...)` plus tard.
- **Pagination server-side** : contrairement au listing catégorie (qui charge tout puis
  pagine en mémoire), la recherche pagine directement en SQL (`LIMIT/OFFSET`) car le
  jeu de résultats peut être plus grand (recherche transversale vs catégorie).
- **SortKey** : réutiliser le type `SortKey` de `category-listing.ts` en ajoutant
  `"relevance"` comme option supplémentaire. Définir un type `SearchSortKey` dans le
  service qui étend les possibilités.
- 🚧 **Prix TTC pour le tri** : le tri par prix doit utiliser le prix TTC (min variant
  `priceExclTax * (1 + taxRate.rateBps / 10000)`). Calculable en SQL via une
  sous-requête sur `ProductVariant` + `TaxRate`.
