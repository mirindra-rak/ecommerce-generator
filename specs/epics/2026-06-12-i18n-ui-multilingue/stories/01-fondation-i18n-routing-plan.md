# Plan : Fondation i18n & routing par locale (`/[locale]`)

**Ticket** : [01-fondation-i18n-routing](./01-fondation-i18n-routing.md) · **Statut** ✅ Réalisé (2026-06-12)

> Exécuté en one-shot. Build vert (`/fr` + `/en` SSG, `/admin/*` OK, middleware actif),
> type-check + lint + tests verts. Topologie « root passthrough + 2 sous-racines `<html>` »
> validée par le build. next-intl résolu en v4.13.0.

## Résumé

Installer **next-intl**, restructurer le storefront sous `app/[locale]/`, ajouter un
middleware de négociation de locale (en gardant `/admin` et `/api` non préfixés), et
externaliser la configuration des locales dans `site.config.ts` (Silo).

## Décisions techniques (verrouillées pour ce plan)

- **Lib** : **next-intl** (support RSC natif, middleware de routing, API serveur+client,
  Metadata API). Verrouille la question 🚧 de l'epic.
- **Préfixe** : `localePrefix: "always"` → `/fr/...` et `/en/...` toujours préfixés
  (URLs uniformes, `hreflang` symétrique). Tranche la 🚧 « préfixer la locale par défaut ».
- **Topologie layouts** : root `app/layout.tsx` devient **passthrough** (retourne
  `children`, conserve l'import `globals.css`). Le `<html lang>` est rendu par
  `app/[locale]/layout.tsx` (storefront) **et** par un nouveau `app/admin/layout.tsx`
  (admin, `lang="fr"` figé en V1). Police Hanken + `IconProvider` extraits dans un module
  partagé pour éviter la duplication. → garde `/admin` hors de l'arbre `[locale]` (story 05).

## Fichiers à créer ou modifier

**Configuration & lib**

- `apps/pharmacie-1/package.json` — ajout dépendance `next-intl` _(modifié)_
- `apps/pharmacie-1/next.config.ts` — envelopper avec `createNextIntlPlugin('./src/i18n/request.ts')` _(modifié)_
- `packages/core/src/config/site-config.ts` — `LocaleConfig` : ajout `supportedLocales: string[]` + `defaultLocale: string` ; assouplir le littéral `"fr-FR"` _(modifié)_
- `apps/pharmacie-1/site.config.ts` — renseigner `supportedLocales: ["fr","en"]`, `defaultLocale: "fr"` _(modifié)_

**Socle i18n**

- `apps/pharmacie-1/src/i18n/routing.ts` — `defineRouting` (locales + defaultLocale lus depuis la config site, `localePrefix: "always"`) _(créé)_
- `apps/pharmacie-1/src/i18n/request.ts` — `getRequestConfig` : charge `messages/<locale>.json`, validation de la locale _(créé)_
- `apps/pharmacie-1/src/i18n/navigation.ts` — `createNavigation(routing)` → `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` localisés _(créé)_
- `apps/pharmacie-1/messages/fr.json` — catalogue FR minimal (amorce ; extraction complète en story 02) _(créé)_
- `apps/pharmacie-1/messages/en.json` — catalogue EN miroir _(créé)_
- `apps/pharmacie-1/src/middleware.ts` — `createMiddleware(routing)` + matcher excluant `api`, `admin`, `_next`, assets _(créé)_

**Layouts & arbre de routes**

- `apps/pharmacie-1/src/lib/fonts.ts` — instanciation partagée de `Hanken_Grotesk` _(créé)_
- `apps/pharmacie-1/src/app/layout.tsx` — réduit à un passthrough (`return children`), conserve `import "./globals.css"` _(modifié)_
- `apps/pharmacie-1/src/app/[locale]/layout.tsx` — `<html lang={locale}>` + body + `IconProvider` + `NextIntlClientProvider` + `setRequestLocale` + `generateStaticParams` + `generateMetadata` _(créé, reprend l'actuel root)_
- `apps/pharmacie-1/src/app/[locale]/(storefront)/**` — déplacement de `app/(storefront)/**` sous `[locale]` _(déplacé)_
- `apps/pharmacie-1/src/app/admin/layout.tsx` — `<html lang="fr">` + body + `IconProvider` (préserve l'admin une fois le root en passthrough) _(créé)_

**Navigation (liens locale-aware)**

- 13 composants/pages storefront utilisant `next/link` / `next/navigation` — remplacer par les helpers de `i18n/navigation` _(modifiés)_

## Étapes de développement

1. **Installer next-intl & brancher le plugin** — ajouter la dépendance, envelopper `next.config.ts`. Test : `pnpm --filter pharmacie-1 type-check` passe ; le serveur démarre.
2. **Étendre `LocaleConfig` (core)** — ajouter `supportedLocales` + `defaultLocale`, ajuster le type `locale`. Renseigner `site.config.ts`. Test : `type-check` du package core + app ; les consommateurs existants de `locale` compilent toujours.
3. **Définir le routing i18n** — `i18n/routing.ts` consommant la config site (locales, défaut, `localePrefix: "always"`). Test : import sans erreur, `routing.locales` = `["fr","en"]`.
4. **Configurer la requête i18n** — `i18n/request.ts` : charge le JSON de la locale, rejette une locale hors liste (fallback `defaultLocale`). Test : unitaire — locale valide → messages chargés ; locale inconnue → fallback déterministe.
5. **Amorcer les catalogues de messages** — `messages/fr.json` + `en.json` avec quelques clés (`common.*`) et **parité de clés**. Test : un script/asserts comparant les jeux de clés FR/EN.
6. **Helpers de navigation** — `i18n/navigation.ts` via `createNavigation`. Test : `getPathname` produit `/fr/...` et `/en/...`.
7. **Middleware de négociation** — `src/middleware.ts` + matcher excluant `api`/`admin`/assets. Test (manuel/e2e) : `/` → redirige vers `/fr` (selon `Accept-Language`) ; `/admin` et `/api/...` **non** redirigés/préfixés.
8. **Extraire la police partagée** — `src/lib/fonts.ts`. Test : import depuis deux layouts sans double déclaration ; `type-check` ok.
9. **Layout `[locale]`** — créer `app/[locale]/layout.tsx` (html `lang={locale}`, providers, `setRequestLocale`, `generateStaticParams`, `generateMetadata` reprenant l'actuel). Test : `<html lang="en">` émis sur `/en`, `lang="fr"` sur `/fr`.
10. **Déplacer le storefront sous `[locale]`** — `app/(storefront)/**` → `app/[locale]/(storefront)/**`. Test : `/fr` rend la home, `/fr/categorie/<slug>` et `/fr/produit/<slug>` répondent.
11. **Root en passthrough + layout admin** — réduire `app/layout.tsx` à `return children` (garde `globals.css`) ; créer `app/admin/layout.tsx` (html `lang="fr"` + IconProvider). Test : `/admin/login` rend toujours correctement (police, icônes) ; aucune erreur « html/body manquant ».
12. **Liens locale-aware** — remplacer `next/link`→`@/i18n/navigation` `Link` et `next/navigation`→helpers, dans les 13 fichiers storefront. Test : naviguer en `/en` conserve le préfixe `/en` sur tous les liens internes ; aucun lien ne ramène en `/fr` par défaut.
13. **Scénario 3 — locale invalide** — vérifier le comportement `/de/...`. Test : 404 (ou redirection `defaultLocale`), jamais de rendu hors `supportedLocales`.
14. **Validation transverse** — `pnpm lint`, `pnpm type-check`, build. Test : pipeline vert, pas de `any`, pas de chaîne de locale codée en dur hors config.

## Points d'attention

- **Topologie root layout** : Next.js exige un root layout ; le pattern « root passthrough +
  html rendu dans les sous-layouts » est supporté mais sensible. Mitigation : valider tôt
  (étape 11) que `/admin` **et** `/fr` rendent chacun un `<html>` unique, sans warning
  d'hydratation. Si le passthrough pose problème, repli : garder l'admin sous un groupe de
  routes à root layout propre (multiple root layouts).
- **Police & CSS dupliqués** : Hanken + `globals.css` doivent rester chargés pour les deux
  arbres. `globals.css` reste importé dans le root passthrough (s'applique globalement) ;
  la police passe par `src/lib/fonts.ts`. Vérifier l'absence de double `<html>`.
- **Pas de middleware existant** : l'auth protège via les layouts serveur (`requireStaff`),
  pas un middleware → aucun conflit. 🚧 Si un middleware d'auth est ajouté plus tard, il
  faudra **composer** avec celui de next-intl (chaînage), pas le remplacer.
- **Swap de navigation = surface partagée avec story 02** : les 13 fichiers seront rouverts
  pour l'externalisation des chaînes. Ici, **se limiter aux liens** (href/Link) ; ne pas
  externaliser les libellés (éviter le double travail / conflits).
- **`setRequestLocale`** requis dans le layout et les pages pour le rendu statique ; un oubli
  bascule en rendu dynamique silencieux. Vérifier que `generateStaticParams` couvre les deux
  locales.
- **SEO (story 04)** : ce lot pose `lang` + le préfixe ; `hreflang`/alternates/sitemap sont
  hors scope ici mais le choix `localePrefix: "always"` les conditionne (cohérence à tenir).
- 🚧 **Locale par défaut sans redirection infinie** : s'assurer que le matcher du middleware
  n'intercepte pas `/_next`, fichiers statiques et `favicon` (sinon boucle/redirection des
  assets).

## Questions techniques à trancher avant de coder

- 🚧 **`localePrefix`** : confirmé `"always"` dans ce plan ; à valider définitivement avec le
  product owner (impacte URLs, `x-default` de la story 04).
- 🚧 **Source des locales** : `routing.ts` lit-il `supportedLocales` depuis `site.config.ts`
  (cohérent Silo, recommandé) ou les redéclare-t-il ? Retenu : **lecture depuis la config**.
