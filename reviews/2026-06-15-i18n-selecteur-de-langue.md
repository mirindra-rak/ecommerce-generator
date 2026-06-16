# Review : Sélecteur de langue (story 03)

**Date** : 2026-06-15 · **Portée** : commit `06d35fa` + plan `03-selecteur-de-langue-plan.md` · **Verdict** : 🟡 À ajuster

## Résumé

Implémentation propre, fidèle au plan : primitive `@pharmacie/ui` présentationnelle (Radix Popover)
correctement découplée de next-intl, adaptateur storefront qui préserve chemin **et** filtres au
switch, libellés en autonymes. Les portes statiques (type-check, lint, build, Vitest) sont vertes.
Le seul vrai manque est la **non-exécution des e2e** : le critère d'acceptation n°2 (persistance du
choix de langue) n'est donc validé par aucun test exécuté.

## Conformité

- 🟡 **AC2 (persistance) non vérifié** — la restauration de la locale via cookie `NEXT_LOCALE` repose
  sur le comportement du middleware next-intl (`createMiddleware(routing)`, `localePrefix: "always"`),
  jamais réimplémenté côté code (bon choix). Mais aucun test exécuté ne le confirme : l'e2e qui le
  couvre (`e2e/language-switcher.spec.ts:21`) n'a pas pu tourner (navigateurs absents). À lancer avant
  merge : `pnpm exec playwright install && pnpm --filter pharmacie-1 test:e2e`.
- 🔵 **AC1/AC3 couverts** — switch conservant page + query (`language-switcher.tsx:32-35`), liste =
  `supportedLocales` avec actif marqué (`role="option"` + `aria-selected`). Conforme.
- 🔵 **Déviation documentée** — href en string plutôt que la forme objet `{pathname, params}` évoquée
  au plan : justifié (pas de `pathnames` localisés, `usePathname` porte déjà les segments résolus).
- 🔵 **Ajout non listé au plan** — `apps/pharmacie-1/vitest.config.ts` créé pour exclure `e2e/**` de
  Vitest (sinon l'import `@playwright/test` casse `pnpm test`). Nécessaire et tracé dans le journal.

## Qualité

- 🔵 **Double nom `LanguageSwitcher`** — primitive (`@pharmacie/ui`) et adaptateur (app) portent le
  même nom, désambiguïsés par alias `LanguageSwitcherPrimitive` (`language-switcher.tsx:6`). Lisible
  mais demande une seconde de lecture ; cohérent avec un pattern primitive/adaptateur assumé.
- 🔵 **Cohérence design system** — la primitive calque fidèlement `multi-select.tsx` (Popover, tokens,
  `role="listbox"`/`option`, coche `CheckIcon`). Bonne homogénéité.
- RAS sur nommage, duplication, conventions (TS strict, pas de `console`, markup via primitives).

## Tests

- 🟡 **e2e non exécutés** (cf. Conformité) — config + 3 scénarios livrés et bien formés
  (`e2e/language-switcher.spec.ts`), mais verts non constatés. C'est le point à lever.
- 🔵 **Dépendances de seed implicites** — le scénario 1 cible `/fr/categorie/visage-soin?marque=avene` ;
  l'assertion d'URL tient même si la facette n'existe pas (la query est préservée côté client quoi
  qu'il arrive), mais le test suppose le slug `visage-soin` présent en base. À garder en tête au run.
- 🔵 **Unitaires OK** — `locale-label.test.ts` couvre fr/en + code inconnu ; parité FR/EN toujours
  verte après ajout du namespace `localeSwitcher`.

## Sécurité

- RAS. Options issues exclusivement de `siteConfig.locale.supportedLocales` ; navigation via next-intl
  (locale whitelistée par `routing`) ; href interne construit depuis `usePathname` + query courante,
  pas d'open-redirect ni d'injection. Aucun secret, aucune donnée sensible loggée.

## Performance

- 🔵 **`Intl.DisplayNames` reconstruit à chaque rendu** (`locale-label.ts:5` appelé dans le `.map` de
  `language-switcher.tsx:23`) — négligeable pour 2 locales ; mémoïsation inutile à ce stade. À
  surveiller seulement si la liste de locales grossit fortement.
- ✅ `useTransition` + navigation Next : pas de rechargement complet au switch.

## Actions suggérées

1. 🟡 **Exécuter les e2e** (`playwright install` puis `test:e2e`) pour valider AC1+AC2+AC3 — en
   particulier la persistance cookie. Bloquant pour clore la story, non bloquant pour le code.
2. 🔵 Vérifier visuellement l'alignement vertical du déclencheur (`px-2.5 py-2`, ~h-9) face aux
   `IconButton` voisins (`h-10`) dans la `<nav>` du header — ajuster le padding si décalage.
3. 🔵 (Optionnel) Confirmer le rendu mobile (code court < sm) vs libellé complet ≥ sm, et la
   cohérence du `aria-haspopup="dialog"` (Radix) avec le `role="listbox"` du contenu — imperfection
   sémantique mineure, déjà présente sur `multi-select`.
