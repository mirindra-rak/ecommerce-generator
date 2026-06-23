# Epic : Recherche full-text PostgreSQL (lot 4.4)

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation globale** : L (~5-7 jours)

## Contexte & vision

Le catalogue est en place (listing catégorie avec facettes, fiche produit) mais le
storefront n'offre aucune recherche libre : le champ dans le header est un placeholder
inerte. Un visiteur qui cherche « doliprane », « crème solaire SPF 50 » ou tape un EAN
scanner ne trouve rien.

Ce module construit la **recherche full-text PostgreSQL native** (tsvector / tsquery)
avec ranking pondéré, autocomplete as-you-type, intégration des facettes existantes, et
une page de résultats complète. Pas d'Elasticsearch ni de service tiers — PostgreSQL
couvre largement le volume d'un catalogue parapharmacie (quelques milliers de produits).

## Objectifs

- Offrir une **recherche instantanée** depuis le header (autocomplete avec suggestions
  produit en dropdown, navigation clavier).
- Indexer les champs pertinents avec **poids différenciés** : nom (A), marque (A),
  EAN/SKU (A), shortDescription (B), description (C), attributs JSON (C).
- Exposer une **page de résultats** avec facettes drill-down, tri, pagination — même
  UX que le listing catégorie existant.
- Fournir un **repository + service de domaine** réutilisable par d'autres modules
  (admin, recommandations futures).
- Garantir la **performance** : index GIN, debounce côté client, réponse < 100 ms pour
  un catalogue de 5 000 produits.

## Non-objectifs

- **Recherche multi-entité** (catégories, marques, pages CMS) → itération ultérieure.
  On cherche uniquement des produits.
- **Synonymes / corrections orthographiques** (did-you-mean) → itération ultérieure.
  Le FTS PostgreSQL gère le stemming français natif (`french` dictionary).
- **Recherche vocale / image** → hors scope.
- **Historique de recherche utilisateur** → hors scope (pas de tracking).
- **Analytics de recherche** (termes populaires, zéro résultats) → itération ultérieure.
- **Migration vers Elasticsearch / Meilisearch** → le design doit rester compatible
  (repository pattern = swap possible) mais on ne l'implémente pas.

## Parcours global

1. **Visiteur** tape dans le champ de recherche du header → suggestions apparaissent
   après 2+ caractères (debounce 300 ms) → peut cliquer sur une suggestion (→ fiche
   produit) ou valider (→ page résultats).
2. **Page résultats** affiche les produits matchés avec score de pertinence, facettes
   actives pour affiner, tri (pertinence / prix / nom / nouveautés), pagination.
3. **URL partageable** : `/recherche?q=crème+solaire&nature=spray&sort=price-asc&page=2`

## Stories

| #   | Titre                                                     | Priorité | Est. | Dépend de |
| --- | --------------------------------------------------------- | -------- | ---- | --------- |
| 01  | Schema FTS — migration, index GIN, colonne tsvector       | P0       | M    | —         |
| 02  | Repository + service de recherche (query, rank, facettes) | P0       | M    | 01        |
| 03  | API route + autocomplete endpoint                         | P1       | S    | 02        |
| 04  | Composant SearchBox interactif (header, dropdown)         | P1       | M    | 03        |
| 05  | Page résultats recherche (facettes, tri, pagination, SEO) | P1       | M    | 02, 03    |

## Contraintes

- **Stack** : PostgreSQL natif (tsvector, tsquery, ts_rank), pas de service externe.
- **Architecture** : repository pattern (`packages/core/src/modules/search`), logique
  métier en service de domaine, aucun appel Prisma depuis les routes.
- **i18n** : dictionnaire FTS `french` par défaut (le catalogue est majoritairement en
  français). Configuration extensible si besoin (`simple` pour EAN/SKU).
- **SEO** : page résultats indexable, balises meta dynamiques, URL canonique avec `q`.
- **Performance** : index GIN sur tsvector, debounce client 300 ms, limite autocomplete
  à 8 suggestions, pagination server-side.
- **Prisma** : la migration tsvector passe par du SQL brut (`prisma migrate` +
  `-- CreateIndex` custom) car Prisma ne supporte pas nativement tsvector.
- **Modèle Silo** : aucun `tenant_id`.

## Jalons

- **M1 — Socle FTS** : stories 01 + 02 (index opérationnel, recherche testable en DB).
- **M2 — API + UI** : stories 03 + 04 (autocomplete fonctionnel dans le header).
- **M3 — Page résultats** : story 05 (recherche complète côté storefront).

## Références

- Module squelette : `packages/core/src/modules/search/index.ts`
- Placeholder header : `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/site-header.tsx` (L51-55)
- Facettes existantes : `packages/core/src/modules/catalog/facet.repository.ts`
- Pattern listing catégorie : `apps/pharmacie-1/src/app/[locale]/(storefront)/categorie/[slug]/page.tsx`
- Schéma Prisma : `packages/core/prisma/schema.prisma`
- PostgreSQL FTS docs : `https://www.postgresql.org/docs/current/textsearch.html`
