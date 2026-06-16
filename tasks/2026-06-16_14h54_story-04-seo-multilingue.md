# Story i18n 04 — SEO multilingue (hreflang, alternates, sitemap)

**Date:** 2026-06-16 14:54
**Statut:** Terminé

## Contexte

Story 04 de l'epic i18n. Le routing par locale (`/[locale]`, `localePrefix: "always"`)
créait des URLs distinctes par langue sans signaux SEO → risque de contenu dupliqué.
Cette tâche déclare les alternances `hreflang` réciproques (+ `x-default`), des canoniques
auto-référentes, un `sitemap.xml` décliné par locale et un `robots.txt` excluant le
back-office. Plan : `specs/epics/2026-06-12-i18n-ui-multilingue/stories/04-seo-multilingue-plan.md`.

## Modifications

- [x] `apps/pharmacie-1/src/lib/site.ts` — `siteUrl` (origin absolu dérivé de `brand.domain`,
      surcharge `NEXT_PUBLIC_SITE_URL`).
- [x] `apps/pharmacie-1/src/lib/seo.ts` — **créé** : `alternatesFor(pathname, locale)`
      (canonique + `languages` par locale + `x-default`), source unique des alternances.
- [x] `apps/pharmacie-1/src/lib/seo.test.ts` — **créé** : réciprocité, `x-default`, canonique.
- [x] `apps/pharmacie-1/src/app/[locale]/layout.tsx` — `metadataBase`.
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/page.tsx` — `generateMetadata` (`/`).
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/categorie/[slug]/page.tsx` — `alternates`.
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/produit/[slug]/page.tsx` — `alternates`.
- [x] `apps/pharmacie-1/src/app/sitemap.ts` — **créé** : home + catégories + produits actifs,
      `alternates.languages` par entrée.
- [x] `apps/pharmacie-1/src/app/sitemap.test.ts` — **créé** (catalogue mocké, sans DB).
- [x] `apps/pharmacie-1/src/app/robots.ts` — **créé** : `Disallow /admin`, `/api` + sitemap.
- [x] `apps/pharmacie-1/src/lib/catalog.ts` — `getSitemapCategories()` / `getSitemapProducts()`.
- [x] `packages/core/src/modules/catalog/category.repository.ts` — `findActiveSlugs()`.
- [x] `packages/core/src/modules/catalog/product.repository.ts` — `findActiveSlugs()`.
- [x] `packages/core/src/modules/catalog/*.repository.test.ts` — couverture `findActiveSlugs`.
- [x] `apps/pharmacie-1/vitest.config.ts` — alias `@/*` (aligné sur `tsconfig`) pour tester le
      code app via le même chemin qu'en runtime.

## Notes

- **Décision `x-default`** (question ouverte du ticket) : `localePrefix: "always"` ⇒ aucune URL
  non préfixée ; `x-default` pointe vers la `defaultLocale` **préfixée** (`/fr/...`). Symétrique.
- **Construction des chemins** : `alternatesFor` construit le chemin localisé directement
  (`/<locale><path>`) plutôt que via `getPathname` de next-intl. Raison : `getPathname`
  (react-client) importe `next/navigation`, non résoluble sous Vitest (node). La construction
  manuelle est déterministe, sans dépendance, et testable — valide tant que `localePrefix`
  reste `"always"` (verrouillé story 01, commenté dans le code).
- HTML (`hreflang`) et sitemap partagent `alternatesFor` → réciprocité/cohérence garanties.
- Produits/catégories **inactifs** exclus du sitemap (URLs sinon en 404).
- Vérifs : `pnpm type-check` ✓, `pnpm lint` ✓, `pnpm test` ✓ (core 82, app 10).

## Rollback

```bash
git revert <hash-du-commit-story-04>
```

(Ou supprimer `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts` et annuler les ajouts
`alternates`/`metadataBase`/`findActiveSlugs` ; retirer l'alias Vitest.)
