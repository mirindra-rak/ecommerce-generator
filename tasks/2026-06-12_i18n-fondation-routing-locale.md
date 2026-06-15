# i18n — Fondation & routing par locale (story 01)

**Date:** 2026-06-12
**Statut:** Terminé

## Contexte

Le storefront était mono-langue en dur (libellés FR codés, `<html lang="fr">` figé, aucune
lib i18n). Story 01 de l'epic i18n UI-multilingue : poser le socle next-intl + routing par
locale `/[locale]`, sans toucher au contenu catalogue (V2) et en gardant `/admin` non
préfixé (i18n admin = story 05).

## Modifications

- [x] `apps/pharmacie-1/package.json` — dépendance `next-intl` (v4.13.0)
- [x] `apps/pharmacie-1/next.config.ts` — plugin `createNextIntlPlugin("./src/i18n/request.ts")`
- [x] `packages/core/src/config/site-config.ts` — `LocaleConfig` : ajout `supportedLocales` + `defaultLocale`
- [x] `apps/pharmacie-1/site.config.ts` — `supportedLocales: ["fr","en"]`, `defaultLocale: "fr"`
- [x] `apps/pharmacie-1/src/i18n/routing.ts` — `defineRouting` (locales depuis la config, `localePrefix: "always"`)
- [x] `apps/pharmacie-1/src/i18n/request.ts` — `getRequestConfig` + fallback locale invalide
- [x] `apps/pharmacie-1/src/i18n/navigation.ts` — `createNavigation` (Link/redirect/usePathname/useRouter)
- [x] `apps/pharmacie-1/messages/{fr,en}.json` — catalogues amorce (namespace `common`)
- [x] `apps/pharmacie-1/src/middleware.ts` — `createMiddleware` + matcher excluant `api`/`admin`/assets
- [x] `apps/pharmacie-1/src/lib/fonts.ts` — police Hanken partagée (extraite du root layout)
- [x] `apps/pharmacie-1/src/app/layout.tsx` — réduit à un passthrough (garde `globals.css`)
- [x] `apps/pharmacie-1/src/app/[locale]/layout.tsx` — `<html lang>` dynamique, providers, `setRequestLocale`, `generateStaticParams`, metadata
- [x] `apps/pharmacie-1/src/app/admin/layout.tsx` — nouvelle racine admin (`<html lang="fr">` + IconProvider)
- [x] `git mv app/(storefront) → app/[locale]/(storefront)` — déplacement du storefront sous la locale
- [x] 11 composants storefront — `next/link` → `@/i18n/navigation`
- [x] `category-filters.tsx` — `usePathname`/`useRouter` locale-aware (garde `useSearchParams` de next/navigation)
- [x] `categorie/[slug]`, `produit/[slug]`, `(storefront)/page.tsx` — param `locale` + `setRequestLocale`

## Notes

- **Lib** : next-intl (RSC natif, middleware, Metadata API). **Préfixe** `always` → `/fr`, `/en`.
- **Topologie layouts** (le point dur) : root `app/layout.tsx` en passthrough ; `<html>` rendu
  par `app/[locale]/layout.tsx` (storefront) **et** `app/admin/layout.tsx` (admin FR). Validé
  par le build : `/fr`+`/en` en SSG, `/admin/*` rend correctement, pas d'erreur html/body.
- **Décision** : `LocaleConfig.locale` (régional `"fr-FR"`, formats) conservé tel quel ;
  `supportedLocales`/`defaultLocale` ajoutés à côté pour le routing UI (codes courts).
- **Hors scope tenu** : libellés UI encore en dur (externalisation = story 02), pas de
  sélecteur (story 03), pas de hreflang/sitemap (story 04), admin non internationalisé (story 05).
- Vérifs : `build` ✓, `type-check` (app + core) ✓, `lint` ✓, `test` ✓ (aucun test unitaire).

## Rollback

- `git mv app/[locale]/(storefront) app/(storefront)` puis supprimer le dossier `[locale]`.
- Restaurer `app/layout.tsx` (root rendant `<html>` + font + IconProvider), supprimer
  `app/admin/layout.tsx` et `src/lib/fonts.ts`.
- Supprimer `src/i18n/`, `src/middleware.ts`, `messages/`, le plugin dans `next.config.ts`,
  la dépendance `next-intl`, et les champs `supportedLocales`/`defaultLocale` (core + site.config).
- Réverter les imports `@/i18n/navigation` → `next/link` / `next/navigation` dans les composants.
