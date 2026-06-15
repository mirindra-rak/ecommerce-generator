# Plan : Sélecteur de langue (primitive `@pharmacie/ui`)

**Ticket** : [03-selecteur-de-langue](./03-selecteur-de-langue.md) · **Statut** ✅ (exécuté 2026-06-15, one-shot)

## Résumé

Ajouter une primitive `LanguageSwitcher` (présentationnelle, accessible, Radix Popover) au design
system, puis un adaptateur storefront qui la câble à next-intl pour basculer FR/EN **en conservant
la page courante** (chemin + filtres), avec persistance par cookie via le middleware existant.

## Décisions verrouillées (questions ouvertes du ticket)

- **Forme** : menu déroulant (Radix Popover), pas deux liens. Motif : cohérent avec `multi-select`
  (même primitive Radix), liste exactement `supportedLocales` avec l'actif coché, et **scalable**
  au-delà de 2 langues. (tranche la 🚧 « déroulant vs deux liens »)
- **Emplacement** : dans la rangée d'actions du header (`<nav>` à `ml-auto`, à côté de compte/
  favoris/panier), **visible à tous les breakpoints** — déclencheur compact (icône globe + code
  locale courant). Pas d'intégration au menu hamburger (non implémenté à ce stade).
  (tranche la 🚧 « emplacement mobile »)
- **Séparation primitive / app** : `@pharmacie/ui` reste **découplé de next-intl**. La primitive est
  purement présentationnelle (props `locales`, `value`, `onValueChange`) ; l'adaptateur app porte
  les hooks de routing. Respecte la contrainte « markup via primitives `@pharmacie/ui` ».
- **Libellés de langue** : **autonymes** (« Français », « English ») via `Intl.DisplayNames`
  (repli sur le code), donc identiques quelle que soit l'UI. Seul l'`aria-label` du déclencheur est
  traduit (nouveau namespace `localeSwitcher`).

## Fichiers à créer ou modifier

- `packages/ui/src/icons.tsx` — **modifié** : exporter `Globe as GlobeIcon` (Phosphor).
- `packages/ui/src/components/language-switcher.tsx` — **créé** : primitive client présentationnelle
  (Radix Popover ; déclencheur globe + libellé actif + chevron ; liste `role="listbox"`, options
  `role="option"` + `aria-selected`, coche sur l'actif ; clavier + focus visible).
- `packages/ui/src/index.ts` — **modifié** : exporter `LanguageSwitcher` (+ type `LanguageOption`).
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/language-switcher.tsx` — **créé** :
  adaptateur storefront (client). Lit `useLocale()`, construit les options depuis
  `siteConfig.locale.supportedLocales` (autonymes), et au choix appelle
  `router.replace(<chemin+query>, { locale })` via `@/i18n/navigation` + `useSearchParams`.
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/site-header.tsx` — **modifié** :
  insérer l'adaptateur dans la `<nav>` d'actions.
- `apps/pharmacie-1/messages/fr.json` + `messages/en.json` — **modifié** : namespace `localeSwitcher`
  (`ariaLabel`). Parité garantie par le test existant.
- `apps/pharmacie-1/src/lib/locale-label.ts` (ou colocalisé) — **créé** : helper `localeLabel(code)`
  (autonyme capitalisé via `Intl.DisplayNames`, repli sur le code).
- `apps/pharmacie-1/src/lib/locale-label.test.ts` — **créé** : test unitaire du helper.
- `apps/pharmacie-1/e2e/language-switcher.spec.ts` — **créé** : e2e Playwright des scénarios 1 & 2.

## Étapes de développement

1. **Icône globe** — ajouter `Globe as GlobeIcon` dans `icons.tsx`. Test : import résolu, `type-check`
   du package OK.
2. **Primitive `LanguageSwitcher`** — créer le composant Radix Popover présentationnel : props
   `{ locales: LanguageOption[]; value: string; onValueChange(code): void; ariaLabel: string }`
   (`LanguageOption = { value; label }`). Déclencheur = `GlobeIcon` + libellé/­code actif + chevron ;
   panneau = options avec `aria-selected` et `CheckIcon` sur l'actif. Exporter depuis `index.ts`.
   Test : `type-check` + lint du package ; rendu accessible (rôles `listbox`/`option`, `aria-label`).
3. **Helper `localeLabel`** — autonyme via `Intl.DisplayNames([code], { type: "language" })`, première
   lettre capitalisée, repli sur le code brut si indisponible. Test unitaire :
   `localeLabel("fr") → "Français"`, `localeLabel("en") → "English"`, code inconnu → renvoyé tel quel.
4. **Messages `localeSwitcher`** — ajouter `localeSwitcher.ariaLabel` dans `fr.json` et `en.json`
   (« Changer de langue » / « Change language »). Test : `messages.test.ts` (parité) reste vert.
5. **Adaptateur storefront** — créer le wrapper client : `useLocale()` pour l'actif, options =
   `supportedLocales.map(c => ({ value: c, label: localeLabel(c) }))`, `aria-label` via
   `useTranslations("localeSwitcher")`. Au choix : composer chemin courant (`usePathname` de
   `@/i18n/navigation`) + querystring (`useSearchParams` de `next/navigation`) et appeler
   `router.replace(href, { locale })` ; envelopper dans `useTransition` (pas de rechargement complet).
   Test : `type-check` ; vérifier que le chemin/params sont préservés (couvert par l'e2e).
6. **Intégration header** — insérer l'adaptateur dans la `<nav>` d'actions de `site-header.tsx`
   (avant les `IconButton`). Test : `build` ; le header rend sur `/fr` et `/en`, sélecteur présent.
7. **Validation acceptation (e2e Playwright)** —
   - Scénario 1 : depuis `/fr/categorie/<slug>` (idéalement avec un filtre en query), choisir
     « English » → URL devient `/en/categorie/<slug>` (mêmes query), pas de retour accueil.
   - Scénario 2 : après switch en `en`, recharger `/` (ou nouvelle visite) → middleware restitue
     `en` via le cookie `NEXT_LOCALE`.
   - Scénario 3 (état actif) : ouvrir le panneau → liste = `supportedLocales`, actif marqué.
     Test : `pnpm --filter pharmacie-1 e2e` (ou `test:e2e`) vert.
8. **Vérif transverse** — `type-check` (app + ui + core) · `lint` · `test` · `build`. Grep de contrôle :
   aucune chaîne FR codée en dur introduite (hors autonymes, qui sont volontairement non traduits).

## Points d'attention

- **Préservation des filtres** : `usePathname` (next-intl) ne porte pas la querystring ; il **faut**
  réinjecter `useSearchParams` pour ne pas perdre les facettes de `/categorie/[slug]` au switch
  (fidélité du scénario 1 « même page »).
- **Segments dynamiques** : pas de `pathnames` localisés configurés (slugs identiques entre locales,
  cf. epic V1) → `router.replace(pathname, { locale })` suffit ; ne pas introduire de mapping de
  slugs (réservé V2). Si next-intl exige `params` pour les routes dynamiques, passer la forme objet
  `{ pathname, params }`.
- **Persistance (scénario 2)** : assurée par le **middleware next-intl** (cookie `NEXT_LOCALE`),
  déjà en place (story 01) — à **vérifier**, pas à réimplémenter ; ne pas poser de cookie à la main.
- **Découplage `@pharmacie/ui`** : la primitive ne doit importer **ni** next-intl **ni** `@/i18n`
  (sinon couplage app→design system). Toute la logique de routing reste dans l'adaptateur app.
- **Accessibilité** : Radix Popover gère focus-trap/Échap/clic extérieur ; veiller au `aria-label`
  traduit sur le déclencheur, `aria-selected` sur l'option active, focus visible (tokens existants).
- **Sécurité** : les options proviennent exclusivement de `supportedLocales` (config) et la navigation
  passe par next-intl (locale whitelistée par `routing`) → pas d'open-redirect via le paramètre locale.
- **Performance** : `useTransition` + navigation Next (pas de full reload) ; primitive client légère,
  aucun bundle de messages supplémentaire (autonymes calculés, pas de catalogue par langue).
- 🚧 **Setup e2e** : confirmer la présence/commande Playwright dans `apps/pharmacie-1` (dossier `e2e/`
  - script `test:e2e`). Si absent, livrer au minimum un test composant (Testing Library) du switch et
    marquer l'e2e comme suivi séparé.
- 🚧 **Affichage du déclencheur** : libellé complet (« Français ») vs code court (« FR ») sur mobile —
  à confirmer visuellement ; défaut proposé : icône globe + code court en compact, libellé complet ≥ sm.

✅ Plan rédigé dans `specs/epics/2026-06-12-i18n-ui-multilingue/stories/03-selecteur-de-langue-plan.md`. À relire avant /coder.
