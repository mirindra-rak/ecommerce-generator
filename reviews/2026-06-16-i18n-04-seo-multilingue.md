# Review : Story i18n 04 — SEO multilingue (hreflang, alternates, sitemap)

**Date** : 2026-06-16 · **Portée** : diff non commité (branche `feat/i18n-storefront`) +
plan `04-seo-multilingue-plan.md` · **Verdict** : 🟢 OK

## Résumé

Implémentation conforme au plan et aux 5 critères d'acceptation. Les alternances `hreflang`
sont centralisées dans une source unique (`alternatesFor`) partagée par le HTML et le
sitemap → réciprocité garantie. Tests verts (core 82, app 10), type-check et lint OK.
Quelques suggestions mineures, aucune bloquante.

## Conformité

- 🟢 **Scénario 1** (alternances réciproques + `x-default`) — `alternatesFor` couvre home,
  `categorie/[slug]`, `produit/[slug]` ; `languages` contient `fr`/`en`/`x-default`
  (`lib/seo.ts:27-34`).
- 🟢 **Scénario 3** (sitemap par locale) — `app/sitemap.ts` décline chaque URL avec
  `alternates.languages` issues de la même source.
- 🟢 **Scénario 4** (canoniques auto-référentes) — `canonical` = URL de la locale courante.
- 🟢 **Scénario 5** (robots/indexabilité) — `app/robots.ts` autorise `/`, exclut `/admin` +
  `/api`, référence le sitemap.
- 🟡 **Scénario 2** (`<html lang>` exact) — déjà satisfait par `[locale]/layout.tsx` (story 01)
  mais le plan prévoyait un **test de non-régression** ; il n'a pas été ajouté. Écart mineur,
  à documenter ou couvrir (test trivial ou e2e).
- 🔵 **Question ouverte `x-default`** — tranchée (→ `defaultLocale` préfixée) et documentée
  dans le code et le journal de tâche. RAS.

## Qualité

- 🟢 Repository pattern respecté : `getSitemapCategories/Products` délèguent aux repos
  (`findActiveSlugs`), aucun appel Prisma direct dans l'app.
- 🟢 Source unique des alternances (`alternatesFor`) — pas de duplication HTML/sitemap.
- 🔵 `lib/seo.ts:localizedPath` code en dur l'hypothèse `localePrefix: "always"`. C'est
  documenté et verrouillé (story 01), mais un changement futur de `routing` ne serait pas
  reflété ici (couplage implicite). Acceptable en l'état.
- 🔵 `alternates` est émis aussi sur la branche 404 de `categorie`/`produit`
  (`page.tsx` `generateMetadata` quand `data`/`product` est nul). Sans impact (statut 404,
  ignoré par les crawlers), mais on pourrait omettre les alternances dans ce cas.

## Tests

- 🟢 `lib/seo.test.ts` : réciprocité, `x-default`, canonique auto-référente, stabilité
  inter-locale.
- 🟢 `app/sitemap.test.ts` : déclinaison par locale, exclusion `/admin` et `/api`,
  `lastModified` propagé ; catalogue mocké → pas de dépendance DB.
- 🟢 `*.repository.test.ts` : `findActiveSlugs` exclut bien les entités inactives.
- 🔵 Pas de test sur `app/robots.ts` (statique/trivial) ni de vérification que les pages
  exposent réellement les `alternates` (le helper est testé en isolation). Couverture jugée
  suffisante.

## Sécurité

- 🟢 `siteUrl` dérivé de la config (`brand.domain`) ou de `NEXT_PUBLIC_SITE_URL` — aucune
  donnée en base, cohérent Silo ; pas d'entrée utilisateur dans la construction d'URL.
- 🟢 Locales déjà whitelistées en amont (middleware + `hasLocale`, story 01).
- 🔵 `new URL(siteUrl)` (layout) lèverait si `NEXT_PUBLIC_SITE_URL` était fourni sans schéma.
  Risque de mauvaise config uniquement ; un garde/validation serait un plus.

## Performance

- 🟢 Sitemap : 2 requêtes en parallèle, projection `select` minimale (`slug`, `updatedAt`),
  aucun N+1.
- 🔵 À grande échelle (>50 000 URLs), un sitemap unique atteindrait la limite du protocole ;
  un index de sitemaps serait à prévoir — hors périmètre V1 (volumétrie actuelle faible).

## Actions suggérées

1. 🟡 Ajouter un test (unitaire ou e2e léger) verrouillant `<html lang>` par locale
   (scénario 2) pour combler l'écart au plan.
2. 🔵 (Optionnel) Omettre `alternates` sur les branches 404 de `categorie`/`produit`.
3. 🔵 (Optionnel) Valider le schéma de `NEXT_PUBLIC_SITE_URL` (ou documenter le format attendu).
4. 🔵 (Backlog) Prévoir un index de sitemaps si la volumétrie produits explose.

✅ Review rédigée dans reviews/2026-06-16-i18n-04-seo-multilingue.md. Verdict : 🟢
