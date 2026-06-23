# Plan : Search Platform — Moteur de recherche e-commerce intelligent

**Ticket** : [epic.md](./epic.md) · **Statut** 🟡

## Résumé

Faire évoluer le module `search` existant vers une architecture en pipeline :
normalisation, dictionnaires, interprétation d'intention, retrieval enrichi, ranking
configurable, puis intégration storefront. Le but est d'obtenir une capacité
plateforme sans abandonner le socle PostgreSQL déjà implémenté.

## Fichiers à créer ou modifier

### Story 01 — Search foundation audit + refactor

- `packages/core/src/modules/search/index.ts` — **modifié** : clarifier les exports
  publics du module
- `packages/core/src/modules/search/search.types.ts` — **créé** : contrats métier
  publics (`SearchIntent`, `SearchResult`, `SuggestResult`, types de signaux)
- `packages/core/src/modules/search/search.service.ts` — **modifié** : préparer
  l'orchestration pipeline au lieu d'un simple accès direct repository
- `packages/core/src/modules/search/*.test.ts` — **modifié** : réaligner les tests
  sur le nouveau contrat du module

### Story 02 — Query normalization + dictionnaires

- `packages/core/src/modules/search/query-normalizer.ts` — **créé** : normalisation
  canonique (casse, accents, séparateurs, variantes simples)
- `packages/core/src/modules/search/search-dictionary.repository.ts` — **créé** :
  accès aux dictionnaires configurables
- `packages/core/src/modules/search/search-dictionary.types.ts` — **créé** : types
  de synonymes, alias, expressions métier
- `packages/core/src/modules/search/query-normalizer.test.ts` — **créé**

### Story 03 — Intent interpreter

- `packages/core/src/modules/search/search-intent.interpreter.ts` — **créé** :
  extraction d'entités et production du `SearchIntent`
- `packages/core/src/modules/search/search-intent.interpreter.test.ts` — **créé**
- `packages/core/src/modules/search/search.types.ts` — **modifié** : enrichir les
  types d'entités configurables

### Story 04 — Retrieval enrichi PostgreSQL

- `packages/core/prisma/migrations/*_search_trigram/migration.sql` — **créé** :
  activation de `pg_trgm` et index utiles si retenus
- `packages/core/src/modules/search/search.repository.ts` — **modifié** : supporter
  full-text enrichi, alias projetés, fuzzy match léger et critères structurés
- `packages/core/src/modules/search/search.repository.test.ts` — **modifié**

### Story 05 — Ranking strategy configurable

- `packages/core/src/modules/search/search-ranking.strategy.ts` — **créé** :
  composition des signaux de pertinence
- `packages/core/src/modules/search/search-ranking.types.ts` — **créé**
- `packages/core/src/modules/search/search.service.ts` — **modifié** : appliquer la
  stratégie avant de retourner le résultat final
- `packages/core/src/modules/search/search.service.test.ts` — **modifié**

### Story 06 — API storefront + SearchBox

- `apps/pharmacie-1/src/app/api/storefront/search/route.ts` — **créé**
- `apps/pharmacie-1/src/app/api/storefront/search/suggest/route.ts` — **créé**
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/search-box.tsx` — **créé**
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/site-header.tsx` — **modifié**
- `apps/pharmacie-1/messages/fr.json` — **modifié**
- `apps/pharmacie-1/messages/en.json` — **modifié**

### Story 07 — Search results page

- `apps/pharmacie-1/src/app/[locale]/(storefront)/recherche/page.tsx` — **créé**
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/search-results.tsx` — **créé**
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/search-filters.tsx` — **créé**
- `apps/pharmacie-1/src/lib/search.ts` — **créé** : adaptation view-model storefront
- `apps/pharmacie-1/messages/fr.json` — **modifié**
- `apps/pharmacie-1/messages/en.json` — **modifié**

### Story 08 — Observability + tests métier

- `packages/core/src/modules/search/fixtures/*` — **créé** : jeux de requêtes métier
- `packages/core/src/modules/search/search.acceptance.test.ts` — **créé**
- `packages/core/src/modules/search/search-observability.ts` — **créé** ou **modifié**
  si une convention projet existe déjà

## Étapes de développement

### Story 01 — Search foundation audit + refactor

1. **Stabiliser le contrat du module**
   Extraire les types publics du module `search` dans `search.types.ts` afin de rendre
   explicites les objets échangés entre interprétation, retrieval et UI.
   **Test** : `pnpm type-check`.

2. **Refactorer `search.service.ts` en orchestrateur**
   Le service ne doit plus seulement transformer une string en `tsquery`, mais piloter
   un pipeline structuré.
   **Test** : tests unitaires existants réalignés.

### Story 02 — Query normalization + dictionnaires

3. **Créer le normalizer**
   Implémenter la normalisation canonique : minuscules, suppression des accents,
   collapse des espaces, gestion simple des tokens concaténés.
   **Test** : jeux de cas `avene -> avene`, `iphone15 -> iphone 15`.

4. **Introduire un repository de dictionnaires**
   Centraliser la lecture des synonymes et alias depuis une source configurable du
   projet.
   **Test** : repository testable sans UI.

### Story 03 — Intent interpreter

5. **Construire `SearchIntentInterpreter`**
   Convertir une requête normalisée en `SearchIntent` contenant :
   texte libre, entités détectées, filtres candidats.
   **Test** : cas métiers sur plusieurs domaines.

6. **Formaliser la taxonomie d'entités**
   Le type d'entité doit être extensible et piloté par configuration.
   **Test** : ajout d'un nouveau type d'entité sans changer le service principal.

### Story 04 — Retrieval enrichi PostgreSQL

7. **Activer la stratégie fuzzy minimale**
   Évaluer puis, si retenu, activer `pg_trgm` pour gérer les fautes légères et
   variantes de saisie.
   **Test** : `iphon`, `iphonne`, `samsng` renvoient des candidats plausibles.

8. **Projeter l'intention dans le repository**
   Le repository doit combiner full-text, critères structurés et alias projetés dans
   la requête SQL.
   **Test** : une marque détectée influence réellement le retrieval.

### Story 05 — Ranking strategy configurable

9. **Extraire la stratégie de ranking**
   Définir un objet de signaux et une pondération configurable, séparée du retrieval.
   **Test** : un boost configuré modifie l'ordre des résultats attendus.

10. **Ajouter des signaux non textuels**
    Injecter disponibilité, fraîcheur ou popularité si les données existent déjà.
    **Test** : comportement déterministe couvert par tests.

### Story 06 — API storefront + SearchBox

11. **Créer les routes API storefront**
    Exposer une route de recherche et une route de suggestions adossées au service de
    domaine, sans appel Prisma direct.
    **Test** : réponses JSON stables et validées.

12. **Brancher une SearchBox interactive**
    Remplacer le placeholder du header par un composant client avec debounce,
    navigation clavier et redirection vers la page résultats.
    **Test** : UX manuelle et tests de rendu si présents.

### Story 07 — Search results page

13. **Créer la page résultats**
    Ajouter une route storefront partageable et indexable avec facettes, tri,
    pagination et préremplissage du terme courant.
    **Test** : parcours manuel complet.

14. **Réutiliser les facettes existantes**
    S'appuyer sur les facettes catalogue déjà présentes plutôt que recréer un modèle.
    **Test** : drill-down cohérent avec l'intention et la requête.

### Story 08 — Observability + tests métier

15. **Créer des tests d'acceptance métier**
    Introduire des requêtes canoniques par domaine pour éviter les régressions de
    pertinence.
    **Test** : suite `search.acceptance.test.ts`.

16. **Ajouter une observability minimale**
    Tracer les requêtes, les intentions produites et les cas zéro-résultat selon les
    conventions du projet, sans `console.log`.
    **Test** : hooks ou interfaces testables.

## Points d'attention

- **Ne pas sur-ingénierer** : l'interprétation d'intention doit rester déterministe et
  pilotée par configuration avant toute approche ML.
- **Données catalogue** : la qualité du moteur dépend fortement de la qualité des
  marques, catégories et attributs existants.
- **Configuration source of truth** : les dictionnaires et boosts doivent avoir une
  source de vérité claire pour éviter la duplication.
- **Compatibilité** : le plan doit préserver le repository pattern et la capacité à
  substituer un moteur externe plus tard si nécessaire.
