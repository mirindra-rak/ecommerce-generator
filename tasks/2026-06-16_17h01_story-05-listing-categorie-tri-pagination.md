# Story 05 — Listing de catégorie : tri + pagination

**Date:** 2026-06-16 17:01
**Statut:** Terminé

## Contexte

Le listing de catégorie storefront (`/[locale]/categorie/[slug]`) était livré pour le SSR, le
404, la metadata SEO, les facettes/filtres et l'état vide, mais les **scénarios 2 (tri)** et
**3 (pagination)** de la story restaient à faire (statut 🟡). Cette tâche complète le reste-à-faire,
état porté par l'URL (partageable) et libellés traduits FR/EN.

Plan : `specs/epics/2026-06-11-catalogue/stories/05-storefront-listing-categorie-plan.md`.

## Modifications

- [x] `apps/pharmacie-1/src/lib/category-listing.ts` — créé : helpers purs `parseSort`,
      `sortCards` (nouveautés / nom locale-aware / prix « à partir de » asc-desc), `paginate`
      (clamp de page, `totalPages`).
- [x] `apps/pharmacie-1/src/lib/category-listing.test.ts` — créé : 12 tests unitaires.
- [x] `apps/pharmacie-1/src/lib/catalog.ts` — `getCategoryWithProducts` prend désormais
      `{ filters, sort, page, pageSize }` ; trie + pagine en mémoire ; VM enrichi
      (`page/pageSize/total/totalPages`). Constante `CATEGORY_PAGE_SIZE = 24`.
- [x] `apps/pharmacie-1/src/lib/seo.ts` — `alternatesFor(pathname, locale, page?)` suffixe
      `?page=N` (N ≥ 2) sur canonique + hreflang. +2 tests.
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/category-sort.tsx` — créé :
      `<select>` de tri URL-driven, reset `page`, préserve les filtres, `<label>` accessible.
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/category-pagination.tsx` —
      créé : liens crawlables (Link locale-aware) prev/next + fenêtre de pages (±2), `nav aria-label`,
      `aria-current`, `rel=prev/next`, préserve tri + filtres, masquée si une seule page.
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/categorie/[slug]/page.tsx` — lit
      `sort`/`page` (params réservés exclus des facettes), câble les deux composants, compteur basé
      sur le total global, canonique paginée.
- [x] `apps/pharmacie-1/messages/{fr,en}.json` — clés `categoryPage` : `sortLabel`, `sortNew`,
      `sortPriceAsc`, `sortPriceDesc`, `sortName`, `pagPrevious`, `pagNext`, `pagPage`.

## Notes

- **Décisions 🚧 tranchées (plan)** :
  - _Perf_ — tri + pagination **en mémoire** dans `lib/catalog.ts` sur le jeu complet de la
    catégorie (les facettes le chargent déjà). Acceptable au volume officine ; push-down
    `orderBy`/`skip`/`take` Prisma + curseur = optimisation différée (lot perf).
  - _SEO_ — canonique **auto-référente incluant `page`** mais **excluant `sort` et les filtres**
    (consolidation des signaux, évite le duplicate content des vues réordonnées). `rel=prev/next`
    posé sur les liens de pagination (bonus, déprécié par Google mais inoffensif).
- **Cohérence d'état** : changer le tri ou un filtre remet `page=1` ; la pagination préserve
  tri + filtres. Page hors borne **clampée** (jamais de 404).
- **Tri nouveautés** = ordre repository (`createdAt desc`), aucun re-tri en mémoire.
- Vérifs : `pnpm --filter pharmacie-1 type-check` ✓, `lint` ✓, `test` ✓ (27, dont 12 nouveaux),
  `build` ✓ (10/10 pages).

## Rollback

```bash
# Avant commit : restaurer les fichiers modifiés et supprimer les fichiers créés.
git checkout -- apps/pharmacie-1/src/lib/catalog.ts apps/pharmacie-1/src/lib/seo.ts \
  apps/pharmacie-1/src/lib/seo.test.ts apps/pharmacie-1/messages/fr.json \
  apps/pharmacie-1/messages/en.json \
  "apps/pharmacie-1/src/app/[locale]/(storefront)/categorie/[slug]/page.tsx"
rm apps/pharmacie-1/src/lib/category-listing.ts apps/pharmacie-1/src/lib/category-listing.test.ts \
  "apps/pharmacie-1/src/app/[locale]/(storefront)/_components/category-sort.tsx" \
  "apps/pharmacie-1/src/app/[locale]/(storefront)/_components/category-pagination.tsx"
# Après commit : git revert <hash>.
```
