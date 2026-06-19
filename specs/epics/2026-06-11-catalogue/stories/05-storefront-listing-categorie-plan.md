# Plan : Storefront — listing de catégorie (tri + pagination)

**Ticket** : [05-storefront-listing-categorie](./05-storefront-listing-categorie.md) · **Statut** ✅ (exécuté le 2026-06-16)

## Résumé

Ajouter le **tri** (nouveautés, prix croissant/décroissant, nom) et la **pagination** au listing
de catégorie existant, l'état étant porté par l'URL (partageable) et les libellés traduits FR/EN.

## Périmètre

Le reste de la story est **déjà livré** (commit `2f4860b` / i18n) et n'est PAS refait :
SSR (`force-dynamic`), 404 (`notFound`), metadata SEO (`generateMetadata`), facettes/filtres
(`CategoryFilters`), état vide, compteur de produits. On greffe uniquement tri + pagination
par-dessus.

## Décision d'architecture (tri + pagination en couche données app)

Les facettes et le compteur chargent **déjà tout le jeu de la catégorie** (`getCategoryFilters`

- `findCardsByCategorySlug` sans `take`). On garde ce jeu complet et on **trie puis pagine dans
  `lib/catalog.ts`**, sur les `cards` bruts _avant_ mapping en view-model :

* `nouveautés` (défaut) = ordre repo déjà en place (`orderBy createdAt desc`) → aucun re-tri.
* `nom` = tri locale-aware (`Intl.Collator` sur `siteConfig.locale`).
* `prix ↑/↓` = tri sur `priceRange(card.variants).min` (le prix « à partir de » déjà affiché).
* `total` = nombre de cartes filtrées ; on `slice` ensuite la page demandée.

Ce choix garde la pagination **cohérente entre les 4 modes de tri** et évite un `orderBy` Prisma
sur un agrégat de relation (prix = min des déclinaisons). Limite assumée ci-dessous (🚧 perf).

## Fichiers à créer ou modifier

- `apps/pharmacie-1/src/lib/category-listing.ts` — **créé**. Fonctions pures : `parseSort`
  (string URL → `SortKey`, repli `"new"`), `sortCards`, `paginate` (clamp de page,
  `{items, page, pageSize, total, totalPages}`). Type `SortKey`.
- `apps/pharmacie-1/src/lib/category-listing.test.ts` — **créé**. Vitest unitaire des 3 helpers.
- `apps/pharmacie-1/src/lib/catalog.ts` — **modifié**. `getCategoryWithProducts` accepte
  `{ sort, page, pageSize }` ; trie/pagine les cartes ; le VM `CategoryPageVM` gagne
  `page, pageSize, total, totalPages` (la liste `products` ne contient que la page courante).
- `apps/pharmacie-1/src/lib/seo.ts` — **modifié**. `alternatesFor` accepte un paramètre optionnel
  de query (`?page=N`) propagé à `canonical` + `languages` pour des alternances paginées exactes.
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/category-sort.tsx` — **créé**.
  Client component : `<select>` de tri piloté par l'URL (réutilise le pattern de `CategoryFilters`
  via `@/i18n/navigation`) ; remet `page` à 1 au changement de tri ; préserve les filtres actifs.
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/category-pagination.tsx` — **créé**.
  Client component : précédent/suivant + numéros de page, `<nav aria-label>`, préserve la query
  (tri + filtres) ; masqué si `totalPages <= 1`.
- `apps/pharmacie-1/src/app/[locale]/(storefront)/categorie/[slug]/page.tsx` — **modifié**.
  Lit `sort` et `page` depuis `searchParams` ; les passe à `getCategoryWithProducts` ; rend
  `CategorySort` (au-dessus de la grille) et `CategoryPagination` (sous la grille) ; injecte la
  query paginée dans `alternatesFor` (canonical).
- `apps/pharmacie-1/messages/fr.json` + `en.json` — **modifiés**. Clés `categoryPage` :
  `sortLabel`, `sortNew`, `sortPriceAsc`, `sortPriceDesc`, `sortName`, `pagPrevious`, `pagNext`,
  `pagPage` (« Page {page} sur {total} »).

## Étapes de développement

1. **Helpers de listing (pur, TDD)** — créer `category-listing.ts` (`SortKey`, `parseSort`,
   `sortCards`, `paginate`). Test : `parseSort` replie une valeur inconnue/absente sur `"new"` ;
   `sortCards` trie nom (collator) et prix asc/desc, et laisse l'ordre inchangé pour `"new"` ;
   `paginate` clampe `page` dans `[1, totalPages]`, calcule `totalPages = ceil(total/pageSize)`,
   et renvoie le bon `slice`. (`category-listing.test.ts` vert.)
2. **Couche données** — étendre `getCategoryWithProducts({ sort, page, pageSize })` : tri+pagination
   des cartes via les helpers, enrichir `CategoryPageVM` (`page/pageSize/total/totalPages`).
   Test : sur un jeu seedé, page 2 renvoie le bon sous-ensemble et `total` reste global ;
   `prix ↑` ordonne par prix « à partir de » croissant.
3. **SEO paginé** — `alternatesFor` propage `?page=N` (sauf page 1) à `canonical` + `languages`.
   Test : `alternatesFor("/categorie/visage", "fr", 2)` produit des URLs absolues suffixées
   `?page=2` réciproques entre locales.
4. **Libellés i18n** — ajouter les clés `categoryPage.*` dans `fr.json` et `en.json` (paires
   strictement symétriques). Test : `pnpm type-check` (typage strict next-intl) + parité des clés.
5. **Composant tri** — `category-sort.tsx` : `<select>` URL-driven, reset `page`, libellés
   traduits, `<label>` accessible. Test : changer le tri met à jour `?sort=` et retire `?page=`.
6. **Composant pagination** — `category-pagination.tsx` : prev/next + pages, préserve tri+filtres,
   masqué si une seule page. Test : naviguer met `?page=N` dans l'URL sans perdre `?sort=`/filtres.
7. **Intégration page** — câbler `sort`/`page` (lecture `searchParams`), rendre les deux composants,
   passer la query paginée à `alternatesFor`. Test : `/fr/categorie/<slug>?sort=price-asc&page=2`
   rend la bonne page triée, canonical = la même URL, `<title>`/description intacts.
8. **Vérification finale** — `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm --filter pharmacie-1 build`.
   Test : tout vert ; scan « zéro littéral UI FR résiduel » sur les nouveaux composants.

## Points d'attention

- 🚧 **Perf — tri/pagination en mémoire** : on charge tout le jeu de la catégorie avant de
  trancher la page. Acceptable au volume « officine » (et les facettes le font déjà), mais ne
  passe pas à l'échelle. Mitigation différée : push-down `orderBy`/`skip`/`take` Prisma + curseur
  (lot perf ultérieur). À noter explicitement, pas de cap silencieux.
- 🚧 **Canonical des vues triées/filtrées (duplicate content)** : une même liste réordonnée =
  contenu dupliqué. Décision proposée : `canonical` **auto-référent inclut `page`** mais
  **exclut `sort` et les filtres** (consolidation des signaux vers la page paginée de base).
  `rel=prev/next` non implémenté (déprécié par Google) — à confirmer en relecture.
- **Cohérence d'état** : tout changement de **tri** ou de **filtre** doit **réinitialiser `page=1`**
  (sinon page hors borne). La pagination, elle, **préserve** tri + filtres.
- **Page hors borne** (`page > totalPages` ou `< 1`) : **clampée** (pas de 404) ; l'état vide
  déjà en place couvre la catégorie sans produit.
- **`pageSize` = 24** (hypothèse de la story, question ouverte) exposé en constante configurable.
- **Tri par nom locale-aware** via `Intl.Collator(siteConfig.locale.locale)` (ne pas comparer en
  binaire — accents FR).
- **Réutilisation** : les deux composants suivent le pattern URL-driven de `CategoryFilters`
  (`@/i18n/navigation` `useRouter`/`usePathname` + `useSearchParams`, `scroll: false`).
- **Accessibilité** : `<label>` sur le select de tri ; `<nav aria-label>` + `aria-current` sur
  la pagination.

✅ Plan rédigé dans specs/epics/2026-06-11-catalogue/stories/05-storefront-listing-categorie-plan.md. À relire avant /coder.
