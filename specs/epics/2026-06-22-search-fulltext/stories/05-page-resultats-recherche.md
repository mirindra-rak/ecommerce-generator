# Story 05 : Page résultats recherche (facettes, tri, pagination, SEO)

**Epic parent** : [Recherche full-text PostgreSQL](../epic.md)
**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : M (~1-2 jours)

## Contexte

Le listing catégorie existant (`/categorie/[slug]`) offre déjà facettes drill-down,
tri multi-critères et pagination. La page résultats recherche adopte la même UX mais
est pilotée par un terme de recherche au lieu d'une catégorie. L'URL est partageable
et indexable.

## User Story

**En tant que** visiteur du storefront, **je veux** une page de résultats de recherche
avec facettes, tri et pagination, **afin de** parcourir et affiner les produits
correspondant à ma recherche.

## Critères d'acceptation

### Scénario 1 : Affichage des résultats

- **Étant donné** l'URL `/recherche?q=crème+solaire`
- **Quand** la page se charge
- **Alors** :
  - Le titre affiche le terme recherché (ex. « Résultats pour "crème solaire" »)
  - Les produits matchants sont affichés en grille (même `ProductCard` que le listing
    catégorie)
  - Le nombre total de résultats est affiché (ex. « 42 produits »)
  - Le tri par défaut est « Pertinence » (ts_rank)

### Scénario 2 : Facettes drill-down

- **Étant donné** des résultats avec des facettes applicables
- **Quand** la page se charge
- **Alors** :
  - Les facettes pertinentes sont affichées dans le panneau latéral (même composant
    que le listing catégorie)
  - Chaque valeur de facette affiche son compteur
  - Les compteurs utilisent le drill-down (même logique que le listing catégorie)
- **Quand** le visiteur sélectionne une facette `nature=spray`
- **Alors** :
  - L'URL se met à jour : `/recherche?q=crème+solaire&nature=spray`
  - Les résultats sont filtrés
  - Les compteurs des autres facettes sont recalculés

### Scénario 3 : Tri

- **Étant donné** la page de résultats
- **Quand** le visiteur change le tri
- **Alors** les options disponibles sont : Pertinence (défaut), Prix croissant,
  Prix décroissant, Nom (A-Z), Nouveautés
- Et l'URL reflète le tri : `&sort=price-asc`
- Et « Pertinence » n'apparaît pas dans l'URL (c'est le défaut)

### Scénario 4 : Pagination

- **Étant donné** plus de 24 résultats
- **Quand** la page se charge
- **Alors** :
  - La pagination est affichée (même composant que le listing catégorie)
  - 24 produits par page
  - L'URL reflète la page : `&page=2`
  - Page 1 n'apparaît pas dans l'URL (c'est le défaut)

### Scénario 5 : Aucun résultat

- **Étant donné** un terme sans match (ex. `?q=xyzinexistant`)
- **Quand** la page se charge
- **Alors** :
  - Un message « Aucun produit trouvé pour "xyzinexistant" » est affiché
  - Des suggestions sont proposées : « Vérifiez l'orthographe » / « Essayez des
    termes plus généraux » / lien vers les catégories principales
  - Pas de facettes affichées

### Scénario 6 : Query manquant

- **Étant donné** l'URL `/recherche` (sans paramètre `q`)
- **Quand** la page se charge
- **Alors** :
  - Le champ de recherche est mis en avant (focus auto ou message invitant à chercher)
  - Pas de résultats affichés
  - Pas d'erreur

### Scénario 7 : SEO — balises meta

- **Étant donné** l'URL `/recherche?q=crème+solaire`
- **Quand** un moteur de recherche indexe la page
- **Alors** :
  - `<title>` : « Résultats pour "crème solaire" — {nomPharmacie} »
  - `<meta name="description">` : description dynamique avec le terme et le nombre
    de résultats
  - `<meta name="robots">` : `noindex, follow` (les pages de recherche ne doivent pas
    être indexées, mais les liens suivis)
  - `<link rel="canonical">` : URL sans pagination ni filtres
    (`/recherche?q=crème+solaire`)

### Scénario 8 : URL partageable

- **Étant donné** un visiteur sur `/recherche?q=crème+solaire&nature=spray&sort=price-asc&page=2`
- **Quand** il copie et partage cette URL
- **Alors** le destinataire voit exactement les mêmes résultats (même query, filtres,
  tri et page)

## Non-objectifs

- Pas de suggestions « did-you-mean » (correction orthographique).
- Pas de filtres numériques (fourchette de prix) — itération ultérieure.
- Pas de vue « liste » alternative (grille uniquement, comme le listing catégorie).

## Contraintes

- La page vit dans `apps/pharmacie-1/src/app/[locale]/(storefront)/recherche/page.tsx`.
- Server Component (le fetch est côté serveur, les filtres sont dans les searchParams).
- Réutiliser au maximum les composants du listing catégorie : `ProductCard`,
  `CategoryFilters` (renommé ou abstrait si nécessaire), `Pagination`, `SortSelect`.
- i18n : tous les textes via `next-intl` (clés dans `search.*` ou `searchPage.*`).
- Le champ de recherche du header (`SearchBox`, story 04) est pré-rempli avec le terme
  `q` de l'URL quand on est sur cette page.
