# i18n — Sélecteur de langue (story 03)

**Date:** 2026-06-15
**Statut:** Terminé

## Contexte

Story 03 de l'epic i18n UI-multilingue. Après le routing par locale (01) et l'externalisation
des chaînes (02), permettre au visiteur de **basculer FR/EN** depuis le header, en conservant la
page courante (chemin + filtres). Exécuté via `/plan` → `/coder` (one-shot, sans TDD).

## Modifications

- [x] `packages/ui/src/icons.tsx` — export `Globe as GlobeIcon` (Phosphor).
- [x] `packages/ui/src/components/language-switcher.tsx` — **primitive** présentationnelle
      (Radix Popover, découplée de next-intl) : déclencheur globe + libellé/­code actif, liste
      `role="listbox"`/`option` + `aria-selected` + coche, clavier/focus via Radix.
- [x] `packages/ui/src/index.ts` — export `LanguageSwitcher` + type `LanguageOption`.
- [x] `apps/pharmacie-1/src/lib/locale-label.ts` — helper autonyme via `Intl.DisplayNames`
      (`fallback: "none"` + capitalisation, repli sur le code).
- [x] `apps/pharmacie-1/src/lib/locale-label.test.ts` — test unitaire (fr/en + code inconnu).
- [x] `apps/pharmacie-1/messages/{fr,en}.json` — namespace `localeSwitcher.ariaLabel`.
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/language-switcher.tsx` —
      **adaptateur** storefront : `useLocale`, options depuis `supportedLocales` (autonymes),
      switch via `router.replace(pathname+query, { locale })`, `useTransition`.
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/site-header.tsx` — intégration
      dans la `<nav>` d'actions.
- [x] `apps/pharmacie-1/vitest.config.ts` — exclut `e2e/**` (sinon ramassé par Vitest).
- [x] `apps/pharmacie-1/playwright.config.ts` + `e2e/language-switcher.spec.ts` — scénarios 1-3.

## Notes / décisions

- **Forme** : menu déroulant Radix Popover (pas deux liens) — cohérent avec `multi-select`,
  scalable, liste exactement `supportedLocales` avec l'actif marqué.
- **Emplacement** : rangée d'actions du header, visible tous breakpoints (code court < sm,
  libellé complet ≥ sm). Menu hamburger non concerné (non implémenté).
- **Découplage** : `@pharmacie/ui` n'importe ni next-intl ni `@/i18n` ; toute la logique de
  routing reste dans l'adaptateur app.
- **Préservation des filtres** : `usePathname` (next-intl) ne porte pas la query → réinjection
  via `useSearchParams` pour ne pas perdre les facettes au switch.
- **Persistance (scénario 2)** : assurée par le cookie `NEXT_LOCALE` du middleware next-intl
  (story 01), pas de cookie posé à la main. **À confirmer par l'e2e.**
- **Libellés** : autonymes (identiques quelle que soit l'UI) ; seul l'`aria-label` est traduit.

## Vérifications

- `type-check` ✓ (ui + app) · `lint` ✓ (ui + app) · `test` (Vitest : parité + locale-label) ✓
  · `build` ✓ (`/fr`+`/en` SSG, `/admin/*` OK).
- 🚧 **e2e Playwright non exécuté** : navigateurs absents de l'environnement (`@playwright/test`
  déclaré, mais pas de binaire). Specs + config livrés ; à lancer via
  `pnpm exec playwright install && pnpm --filter pharmacie-1 test:e2e` (suivi séparé).

## Rollback

Working tree (rien de committé au moment de la rédaction). `git checkout`/suppression des
fichiers ci-dessus, et retrait de l'import + `<LanguageSwitcher />` dans `site-header.tsx`,
des deux clés `localeSwitcher`, et de l'export dans `packages/ui/src/index.ts`.
