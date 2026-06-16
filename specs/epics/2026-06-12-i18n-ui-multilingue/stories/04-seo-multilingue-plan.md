# Plan : SEO multilingue (`hreflang`, alternates, sitemap)

**Ticket** : [04-seo-multilingue](04-seo-multilingue.md) · **Statut** ✅ (implémenté le 2026-06-16)

## Résumé

Déclarer les signaux SEO multilingues du storefront : `metadataBase` + canoniques
auto-référentes, `alternates.languages` réciproques (`hreflang` + `x-default`) sur chaque
page, `app/sitemap.ts` déclinant chaque URL par locale et `app/robots.ts` excluant le
back-office — le `<html lang>` dynamique étant déjà en place (story 01).

## État des lieux (exploration)

- Routing : `localePrefix: "always"` déjà actif (`src/i18n/routing.ts`) → URLs uniformes
  `/fr/...`, `/en/...`. `getPathname` (locale-aware) exporté par `src/i18n/navigation.ts`.
- `<html lang={locale}>` dynamique déjà émis dans `app/[locale]/layout.tsx` (scénario 2 ✅,
  à couvrir par un test de non-régression).
- `generateMetadata` existant sur `categorie/[slug]` et `produit/[slug]` (titre/description
  uniquement, **aucun** `alternates`). Home (`page.tsx`) sans `generateMetadata`.
- **Aucun** `metadataBase`, `sitemap.ts` ni `robots.ts` aujourd'hui.
- Domaine canonique : `siteConfig.brand.domain` (`parapharmacie-exemple.fr`).
- Énumération du contenu : `category.repository.findMany()` existe ; côté produits,
  `findActive()` existe mais ne projette pas `slug`/`updatedAt`. Pas de `lib/catalog` exposant
  des entrées de sitemap.

## Fichiers à créer ou modifier

- `apps/pharmacie-1/src/lib/site.ts` — **modifié** : exposer `siteUrl` (origin absolu,
  `https://${brand.domain}`, surchargé par `NEXT_PUBLIC_SITE_URL` pour staging).
- `apps/pharmacie-1/src/lib/seo.ts` — **créé** : helper `alternatesFor(path)` →
  `{ canonical, languages }` (URLs absolues par locale + `x-default`), réciproque, basé sur
  `routing.locales`, `routing.defaultLocale` et `getPathname`.
- `apps/pharmacie-1/src/lib/seo.test.ts` — **créé** : réciprocité, présence `x-default`,
  canonique auto-référente.
- `apps/pharmacie-1/src/app/[locale]/layout.tsx` — **modifié** : ajouter `metadataBase`
  dans `metadata`.
- `apps/pharmacie-1/src/app/[locale]/(storefront)/page.tsx` — **modifié** : ajouter
  `generateMetadata` avec `alternates` pour `/`.
- `apps/pharmacie-1/src/app/[locale]/(storefront)/categorie/[slug]/page.tsx` — **modifié** :
  ajouter `alternates` (via `alternatesFor`) au `generateMetadata` existant.
- `apps/pharmacie-1/src/app/[locale]/(storefront)/produit/[slug]/page.tsx` — **modifié** :
  idem.
- `apps/pharmacie-1/src/app/sitemap.ts` — **créé** : `MetadataRoute.Sitemap`, une entrée par
  URL canonique (home + catégories + produits actifs) avec `alternates.languages` par locale.
- `apps/pharmacie-1/src/app/sitemap.test.ts` — **créé** : chaque URL présente pour chaque
  locale, cohérence avec les `hreflang`, exclusion de l'admin.
- `apps/pharmacie-1/src/app/robots.ts` — **créé** : `Allow: /`, `Disallow: /admin`, `/api`,
  référence vers le sitemap (URL absolue via `siteUrl`).
- `apps/pharmacie-1/src/lib/catalog.ts` — **modifié** : `getSitemapCategories()` et
  `getSitemapProducts()` → `{ slug, updatedAt }[]` (produits **actifs** uniquement).
- `packages/core/src/modules/catalog/product.repository.ts` — **modifié** : méthode
  `findActiveSlugs()` projetant `{ slug, updatedAt }` (produits actifs).
- `packages/core/src/modules/catalog/category.repository.ts` — **modifié** : méthode
  `findSlugs()` projetant `{ slug, updatedAt }`.
- `packages/core/src/modules/catalog/*.repository.test.ts` — **modifié** : couverture des
  nouvelles projections.

## Étapes de développement

1. **`siteUrl` dans `lib/site`** — dériver l'origin absolu du domaine config (surcharge env
   staging). Test : `siteUrl` vaut `https://parapharmacie-exemple.fr` par défaut, respecte
   `NEXT_PUBLIC_SITE_URL` si défini.
2. **Helper `alternatesFor(path)`** — construire `languages` pour toutes les `routing.locales`
   - `x-default` (→ `defaultLocale` préfixé, cf. décision ci-dessous) et `canonical` =
     URL de la locale courante. Test (`seo.test.ts`) : 3 clés `languages` (`fr`,`en`,
     `x-default`), URLs absolues préfixées, canonique auto-référente, réciprocité.
3. **`metadataBase` dans `[locale]/layout`** — ajouter `metadataBase: new URL(siteUrl)` pour
   que les canoniques relatives se résolvent. Test : présent dans l'objet `metadata`.
4. **Projections repository** — `category.repository.findSlugs()` et
   `product.repository.findActiveSlugs()` (`select: { slug, updatedAt }`, produits `active`).
   Test : retournent slugs attendus, excluent les produits inactifs.
5. **Adaptateurs `lib/catalog`** — `getSitemapCategories()` / `getSitemapProducts()`
   déléguant aux repositories (jamais d'appel Prisma direct). Test : forme `{ slug, updatedAt }`.
6. **`app/sitemap.ts`** — assembler home + catégories + produits ; chaque entrée porte
   `url` (locale par défaut), `lastModified` (`updatedAt`) et `alternates.languages` (toutes
   locales). Test (`sitemap.test.ts`) : chaque chemin présent pour chaque locale, langues
   cohérentes avec `alternatesFor`, aucune URL `/admin`.
7. **`generateMetadata` home + alternates pages dynamiques** — brancher `alternatesFor` sur
   `/`, `categorie/[slug]`, `produit/[slug]` (conserver titres/descriptions existants). Test :
   `alternates.languages` réciproques par page, canonique auto-référente.
8. **`app/robots.ts`** — `Allow: /`, `Disallow: /admin` + `/api`, `sitemap: ${siteUrl}/sitemap.xml`,
   `host`. Test : admin/api interdits, sitemap absolu référencé, storefront indexable
   (scénario 5).
9. **Vérifs finales** — `pnpm type-check`, `pnpm lint`, `pnpm test` (workspaces touchés).

## Points d'attention

- 🚧 **`x-default`** (question ouverte du ticket) : `localePrefix: "always"` ⇒ aucune URL
  non préfixée n'existe. **Décision** : `x-default` → `defaultLocale` **préfixé** (`/fr/...`),
  cohérent avec le routing et symétrique. À acter dans le code + commentaire.
- **`generateMetadata` async vs `setRequestLocale`** : `getPathname` est synchrone et n'a pas
  besoin du contexte de requête → utilisable dans `generateMetadata` sans `setRequestLocale`.
- **`force-dynamic` sur les pages** : les pages catalogue sont en `force-dynamic` ; le
  `sitemap.ts` lit la base à la génération. Acceptable en V1 (rendu à la demande) ; SSG/ISR =
  lot 8.1 hors périmètre. Ne pas forcer le statique au prix d'un sitemap figé.
- **Réciprocité** : centraliser la construction des `languages` dans `alternatesFor` pour que
  HTML (`hreflang`) et `sitemap` partagent la **même** source → garantit la cohérence
  exigée (scénarios 1 & 3).
- **Silo** : `siteUrl` dérivé de `site.config.ts` uniquement, pas de notion de tenant ni de
  domaine en base.
- **Produits inactifs** : exclus du sitemap (`findActiveSlugs`) pour ne pas exposer d'URLs en
  `notFound` ; aligné avec `getProductDetail` (404 si introuvable).
- **Sécurité** : pas de nouvelle entrée utilisateur ; locales déjà whitelistées par le
  middleware/`hasLocale` (story 01). `robots.ts` exclut explicitement `/admin` (noindex
  back-office, en attendant la story 05).

✅ Plan rédigé dans specs/epics/2026-06-12-i18n-ui-multilingue/stories/04-seo-multilingue-plan.md. À relire avant /coder.
