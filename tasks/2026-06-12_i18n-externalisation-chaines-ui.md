# i18n — Externalisation des chaînes UI storefront (story 02)

**Date:** 2026-06-12 18:01 · Terminé le 2026-06-15
**Statut:** Terminé

## Contexte

Story 02 de l'epic i18n. Externaliser tous les libellés UI du storefront vers
`messages/{fr,en}.json` + next-intl, et (en passant) remplacer le placeholder `brand-strip`
par les vraies marques du seed. Exécuté en one-shot `3 n n` (interrompu : utilisateur parti).

État au moment de la pause : **type-check ✓, test de parité ✓** (arbre compilable, sûr).

## Modifications — FAIT

- [x] `messages/fr.json` + `messages/en.json` — **tous** les namespaces (common, header,
      reassurance, megaMenu, hero [+alt], promo, categoryGrid, featuredProducts, expertise,
      brandStrip, loyalty, newsletter, footer, productCard, categoryFilters, categoryPage,
      productPage). Parité garantie par test.
- [x] `global.d.ts` — typage strict des clés next-intl (Messages = fr.json).
- [x] `src/i18n/messages.test.ts` — test de parité FR/EN (vert).
- [x] `src/lib/catalog.ts` — ajout `getBrands(limit=14)` (VM `{slug,name}` via `brandRepository.findMany`).
- [x] `_components/site-header.tsx` — async, `getTranslations` (header + common).
- [x] `_components/reassurance-bar.tsx` — `useTranslations`, items par clé stable.
- [x] `_components/site-footer.tsx` — `useTranslations`, colonnes/liens par clé, copyright ICU.
- [x] `_components/brand-strip.tsx` — async, marques réelles via `getBrands(16)`, 2 accroches traduites.

## Modifications — FAIT (reprise du 2026-06-15)

- [x] `_components/hero.tsx` (client) — `SLIDES` restructuré en `{key,image,href,offer}` (`as const`
      pour clés littérales) ; titre via `t.rich(...{ em })` ; eyebrow/text/cta/alt + aria
      (carousel/slide/label/goToSlide/prev/next), seeCatalog, stats boughtLabel/freeLabel.
- [x] `_components/mega-menu.tsx` — `useTranslations("megaMenu")` : allProducts/deals/premium/ariaLabel/allOf.
- [x] `_components/promo-banners.tsx` — BANNERS → `{key,href,image,tone}`, `useTranslations("promo")`.
- [x] `_components/category-grid.tsx` (async) — `getTranslations("categoryGrid")` heading/subtitle.
- [x] `_components/featured-products.tsx` (async) — `getTranslations("featuredProducts")`.
- [x] `_components/expertise.tsx` — `useTranslations("expertise")` POINTS par clé + textes.
- [x] `_components/loyalty-banner.tsx` — `useTranslations("loyalty")` PERKS par clé + textes.
- [x] `_components/newsletter.tsx` — `useTranslations("newsletter")`.
- [x] `_components/product-card.tsx` — `useTranslations()` : common.priceFrom + productCard.addToCart ({name}).
- [x] `_components/category-filters.tsx` (client) — `useTranslations("categoryFilters")` title/reset.
- [x] `categorie/[slug]/page.tsx` (async) — breadcrumbHome, **productCount (pluriel ICU)**, empty,
      metadata notFound ; **badge debug `image : {coverImageKey}` retiré**.
- [x] `produit/[slug]/page.tsx` (async) — PRODUCT_TYPE_KEY (`as const`)→clés type\*, priceFrom,
      priceSuffix, addToCart, references, inci, precautions, metadata notFound.
- [x] Validation finale : `type-check` ✓ · `lint` ✓ · `test` (parité) ✓ · `build` ✓ (`/fr`+`/en` SSG, `/admin/*` OK).

## Reste non couvert (volontaire — hors story 02)

- `expertise.tsx` : `alt` de l'image conseil encore en FR (aucune clé message ; images = lots futurs,
  cf. liste blanche). Seule chaîne accentuée résiduelle au grep de contrôle.

## Notes / décisions

- Règle API : composants **async** (`site-header`, `category-grid`, `featured-products`,
  `brand-strip`, 2 pages) → `getTranslations` ; sinon `useTranslations`.
- Liste blanche non-traduite : noms de marques (DB), `payment-marks`, réseaux sociaux,
  `siteConfig.brand.*`, `legalMentions` (config FR, conformité). Hero/footer-links/images = lots futurs.
- 🚧 brand-strip : 16 marques (alpha) faute de flag `featured` en base.

## Rollback

Voir `git status` : tout est dans le working tree (rien de committé). `git checkout` des
fichiers ci-dessus + suppression de `global.d.ts`, `src/i18n/messages.test.ts` pour revenir
à l'état post-story 01.
