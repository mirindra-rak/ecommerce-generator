# Epic : Internationalisation (i18n) — UI multilingue (V1)

**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation globale** : M/L

## Contexte & vision

Le storefront est aujourd'hui **mono-langue, en dur** : libellés français codés dans les
composants, `<html lang="fr">` figé, `LocaleConfig.locale` typé `"fr-FR"` littéral, aucune
lib i18n. Cet epic pose le **socle d'internationalisation de l'UI** : routing par locale,
externalisation des chaînes statiques, sélecteur de langue et SEO multilingue (`hreflang`).

Périmètre **délibérément borné à l'UI (chrome)**. Le **contenu** (catalogue, CMS) reste
mono-langue en V1 ; le socle est néanmoins conçu pour l'accueillir en V2 (URLs par locale
prêtes pour des slugs localisés). Aucune migration Prisma en V1.

Contrainte structurante : modèle **Silo** (1 déploiement = 1 pharmacie). Les locales
**supportées** et la locale **par défaut** sont une **configuration** (`site.config.ts`),
jamais une donnée en base. Décliner une pharmacie dans une autre langue = changer la config.

## Objectifs

- Intégrer une **lib i18n adaptée App Router + RSC** (candidat de tête : **next-intl** —
  support natif RSC, middleware de routing, API serveur/client ; choix verrouillé en `/plan`).
- **Routing par locale en sous-chemin** `/[locale]/...` + **middleware** de négociation
  (cookie → `Accept-Language` → locale par défaut), `<html lang>` dynamique.
- Étendre `LocaleConfig` : `supportedLocales` + `defaultLocale` (au lieu d'un littéral figé).
- **Externaliser toutes les chaînes UI statiques** du **storefront ET du back-office
  `/admin`** vers des catalogues de messages **FR (défaut) + EN**, via le **même** système
  next-intl, structure extensible à d'autres locales.
- **Sélecteur de langue** (primitive `@pharmacie/ui`) conservant la page courante au switch,
  côté storefront comme côté admin.
- **SEO multilingue** : `hreflang`/`alternates`, `<html lang>` correct, sitemap par locale,
  canoniques cohérentes.

## Non-objectifs

- **Traduction du contenu** catalogue (noms/descriptions produits, catégories) et **CMS**
  → V2. Le contenu s'affiche dans sa langue d'origine quelle que soit la locale d'UI.
- **Modèle de données multilingue Prisma** (tables de traduction) et **slugs localisés du
  contenu** → V2 (anticipés en archi, non implémentés). 🚧
- **Routing par locale et SEO pour le back-office `/admin`** : l'admin est internationalisé
  (chaînes via next-intl + sélecteur) **mais sans préfixe d'URL ni `hreflang`/sitemap** —
  back-office `noindex`, langue gérée par cookie/préférence. 🚧
- **Détection par géolocalisation IP**, **devises multiples**, **formats régionaux avancés**
  au-delà de ce que la lib fournit nativement (dates/nombres).
- **Traduction automatique** / intégration d'un TMS externe.

## Parcours global

1. Un visiteur arrive sur `/` → le middleware négocie la locale (cookie, sinon
   `Accept-Language`, sinon défaut) → redirection/rendu sous `/[locale]`.
2. Toutes les chaînes d'UI s'affichent dans la locale active (FR ou EN).
3. Le visiteur change de langue via le **sélecteur** → reste sur la même page, locale
   persistée (cookie) ; le prochain accès respecte ce choix.
4. Les moteurs lisent `hreflang`/`alternates` et un sitemap déclinant chaque URL par locale.

## Stories

| #   | Titre                                             | Priorité | Est. | Dépend de |
| --- | ------------------------------------------------- | -------- | ---- | --------- |
| 01  | Fondation i18n & routing par locale (`/[locale]`) | P0       | M    | —         |
| 02  | Externalisation des chaînes UI storefront (FR/EN) | P0       | M/L  | 01        |
| 03  | Sélecteur de langue (primitive `@pharmacie/ui`)   | P1       | S/M  | 01        |
| 04  | SEO multilingue (`hreflang`, alternates, sitemap) | P1       | M    | 01, 02    |
| 05  | Internationalisation du back-office `/admin`      | P2       | M    | 01, 03    |

## Contraintes

- **Stack** : Next.js App Router (RSC) + React 19 + TS strict (`any` interdit). Lib i18n
  consommée côté serveur **et** client ; middleware en runtime edge-compatible.
- **Silo** : `supportedLocales`/`defaultLocale` en config (`site.config.ts`), aucune notion
  de tenant ni de locale en base.
- **Design system** : sélecteur et tout markup via primitives `@pharmacie/ui` (pas de
  markup natif) ; direction « officine éditoriale » respectée.
- **SEO (priorité haute)** : `hreflang` réciproques + `x-default`, `alternates.languages`
  dans `generateMetadata`, sitemap par locale, `<html lang>` exact, pas de contenu dupliqué
  sans alternance déclarée.
- **Performance** : chargement des messages **par locale** (pas de bundle global toutes
  langues) ; privilégier le rendu serveur des traductions, minimiser le JS client.
- **Sécurité** : valider/whitelister la locale issue de l'URL et des en-têtes (rejet des
  valeurs hors `supportedLocales`, pas d'open-redirect via le paramètre de locale).
- **i18n-ready** : aucune chaîne d'UI ne doit rester codée en dur après le lot 02
  (critère vérifiable).

## Jalons

- **M1 — Socle navigable** : story 01 → l'app rend sous `/[locale]`, locale négociée,
  `lang` dynamique, config étendue.
- **M2 — UI traduite** : stories 02 + 03 → tous les libellés storefront en FR/EN +
  sélecteur fonctionnel conservant la page.
- **M3 — SEO conforme** : story 04 → `hreflang`/alternates/sitemap par locale en place.
- **M4 — Back-office traduit** : story 05 → admin internationalisé (next-intl + sélecteur),
  sans préfixe d'URL.

## Décisions ouvertes (à trancher en `/plan`)

- 🚧 **Préfixe de la locale par défaut** : toujours préfixer (`/fr`, `/en` — URLs uniformes,
  `hreflang` symétrique, conseillé) **vs** « as-needed » (défaut sans préfixe). Pré-lancement,
  pas d'URL indexée à préserver → pencher vers **toujours préfixer**.
- 🚧 **Verrouillage de la lib** (next-intl vs alternative) — justification définitive en `/plan`.

## Références

- Config à étendre : `packages/core/src/config/site-config.ts` (`LocaleConfig`), instance
  `apps/pharmacie-1/site.config.ts`.
- `<html lang>` en dur : `apps/pharmacie-1/src/app/layout.tsx`.
- Composants à externaliser : `apps/pharmacie-1/src/app/(storefront)/_components/*`.
- Primitives UI : `packages/ui/src/components/*` (cible du sélecteur de langue).
- Décisions Silo : `CLAUDE.md`, `ARCHITECTURE.md`.
- next-intl (App Router + RSC) — doc à consulter en `/plan`.
