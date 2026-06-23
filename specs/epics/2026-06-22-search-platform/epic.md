# Epic : Search Platform — Moteur de recherche e-commerce intelligent

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation globale** : L (~8-12 jours)

## Contexte & vision

Le projet dispose déjà d'un socle de **recherche full-text PostgreSQL** sur les
produits, avec `tsvector`, `tsquery`, `ts_rank`, facettes et suggestions préfixes.
Ce socle est pertinent pour le retrieval, mais il reste centré sur une recherche
lexicale simple.

La cible n'est plus une fonctionnalité orientée parapharmacie. Cet epic décrit une
**capacité plateforme** de recherche e-commerce applicable à plusieurs domaines
métier, capable d'interpréter une requête utilisateur, d'identifier des entités
configurables, de pondérer les résultats selon plusieurs signaux, et d'exposer une
API stable au storefront.

Le moteur doit rester **générique, configurable et incrémental** :

- **générique** : aucune logique domaine codée en dur ;
- **configurable** : dictionnaires, synonymes, alias, types d'entités et pondérations
  pilotés par configuration ;
- **incrémental** : PostgreSQL reste le moteur d'indexation et de retrieval initial,
  la couche d'interprétation est ajoutée dans `packages/core/src/modules/search`.

## Objectifs

- Faire évoluer la recherche libre vers une **recherche orientée intention**.
- Introduire une **normalisation canonique** des requêtes : casse, accents,
  ponctuation, espaces, variantes simples d'écriture.
- Détecter des **entités configurables** dans la requête :
  - marque ;
  - catégorie ;
  - modèle ;
  - attribut ;
  - valeur d'attribut ;
  - tout autre type d'entité défini par le domaine.
- Ajouter des **dictionnaires configurables** : synonymes, alias, termes équivalents,
  expressions métier.
- Construire un **moteur de ranking** extensible, fondé sur plusieurs signaux :
  exact match, match entité, disponibilité, popularité, ventes, boosts configurés.
- Supporter une **tolérance aux erreurs** raisonnable : accents manquants, variantes
  d'écriture, fautes de frappe légères.
- Exposer une **autocomplete intelligente** réutilisable par le header storefront et
  les futures surfaces de navigation.

## Non-objectifs

- **Moteur sémantique LLM-first** ou classification par modèle externe dès V1.
- **Migration immédiate** vers Elasticsearch, Meilisearch, OpenSearch ou Algolia.
- **Analytics avancées** de recherche (zéro résultat, popularité par segment, AB test).
- **Indexation multi-entité complète** (CMS, pages éditoriales, contenus support) dès
  la première itération.
- **Personnalisation utilisateur avancée** (profil, historique, collaborative
  filtering).

## Architecture cible

La solution recommandée est une architecture en deux étages :

1. **Retrieval layer** : PostgreSQL full-text + trigram + facettes, déjà aligné avec
   le Repository pattern du projet.
2. **Interpretation layer** : services de domaine `search` chargés de normaliser la
   requête, d'extraire les entités, d'appliquer les dictionnaires et de composer la
   stratégie de ranking.

### Composants cibles

- `SearchQueryNormalizer` : normalisation canonique de la saisie utilisateur
- `SearchDictionaryRepository` : lecture des synonymes, alias et mappings configurés
- `SearchIntentInterpreter` : extraction d'entités et production d'un `SearchIntent`
- `SearchRankingStrategy` : calcul et pondération des signaux de pertinence
- `SearchService` : orchestration du pipeline
- `SearchRepository` : retrieval SQL / Prisma raw, strictement sans logique UI

### Contrat métier cible

```ts
interface SearchIntent {
  rawQuery: string;
  normalizedQuery: string;
  freeTextTerms: string[];
  entities: Record<string, string[]>;
  filters: Record<string, string[]>;
}
```

Ce contrat permet de séparer clairement :

- l'interprétation de la requête ;
- la composition des filtres structurés ;
- le retrieval des produits ;
- le ranking final.

## Parcours global

1. L'utilisateur saisit une requête libre dans la SearchBox.
2. Le moteur normalise la requête puis tente d'identifier des entités configurées.
3. Un `SearchIntent` canonique est produit.
4. Le repository exécute un retrieval enrichi :
   - full-text PostgreSQL ;
   - facettes existantes ;
   - dictionnaires et alias projetés en critères SQL ;
   - fuzzy match léger via trigram si nécessaire.
5. Le service applique la stratégie de ranking et renvoie :
   - des suggestions ;
   - des produits ;
   - des filtres pertinents ;
   - des métadonnées de recherche.

## Stories

| #   | Titre                                                        | Priorité | Est. | Dépend de  |
| --- | ------------------------------------------------------------ | -------- | ---- | ---------- |
| 01  | Search foundation audit + refactor du module existant        | P0       | S    | —          |
| 02  | Query normalization + dictionnaires configurables            | P0       | M    | 01         |
| 03  | Intent interpreter + contrat `SearchIntent`                  | P0       | M    | 02         |
| 04  | Retrieval enrichi PostgreSQL (`pg_trgm`, alias, fuzzy match) | P1       | M    | 02, 03     |
| 05  | Ranking strategy configurable multi-signaux                  | P1       | M    | 03, 04     |
| 06  | API storefront + SearchBox interactive                       | P1       | M    | 03, 04     |
| 07  | Search results page + facettes pilotées par intention        | P1       | M    | 05, 06     |
| 08  | Observability minimale + jeux de tests métier                | P2       | S    | 03, 04, 05 |

## Contraintes

- **Repository pattern obligatoire** : aucun appel Prisma direct depuis les routes ou
  composants.
- **Modèle Silo** : aucun `tenant_id`, aucune logique multi-tenant.
- **Configuration-first** : les synonymes, alias, entités et boosts ne doivent pas
  être codés en dur dans le service.
- **Incrémental** : le socle `search` existant doit être refactorisé, pas remplacé
  brutalement.
- **Performance** : viser un temps de réponse compatible storefront sur un catalogue
  de quelques milliers de produits.
- **i18n** : le moteur doit rester compatible avec plusieurs locales même si la
  première itération reste centrée sur le français.

## Jalons

1. **M1 — Domain Core** : stories 01 à 03
   Le moteur sait normaliser une requête et produire un `SearchIntent` stable.

2. **M2 — Retrieval Upgrade** : stories 04 et 05
   Le moteur améliore la tolérance aux erreurs et le ranking sans changer de stack.

3. **M3 — Storefront Integration** : stories 06 et 07
   Le storefront consomme une vraie recherche intentionnelle avec autocomplete et page
   de résultats cohérente.

4. **M4 — Hardening** : story 08
   Le moteur dispose d'une couverture de tests métier et d'une observability minimale.

## Recommandation d'architecture

La recommandation est de **conserver PostgreSQL** comme moteur de base pour cette
phase. Il couvre correctement :

- le full-text ;
- les facettes ;
- l'indexation d'un catalogue de taille modérée ;
- les requêtes prefix et trigram ;
- une première génération de ranking.

Un moteur externe ne devient justifié que si l'on observe au moins un de ces signaux :

- latence incompatible malgré indexation correcte ;
- besoin fort de typo tolerance avancée à grande échelle ;
- explosion du volume catalogue ;
- exigences analytiques ou merchandising trop complexes pour PostgreSQL seul.

## Références

- Socle actuel : `packages/core/src/modules/search/*`
- Migration FTS existante : `packages/core/prisma/migrations/20260622114005_search_vector/migration.sql`
- Placeholder storefront : `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/site-header.tsx`
- Epic existant de recherche FTS : `specs/epics/2026-06-22-search-fulltext/epic.md`
