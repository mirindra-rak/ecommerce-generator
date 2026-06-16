# Review : Story i18n 05 — Internationalisation du back-office /admin

**Date** : 2026-06-16 · **Portée** : diff non commité (branche `feat/i18n-storefront`) +
plan `05-i18n-back-office-admin-plan.md` · **Verdict** : 🟢 OK

## Résumé

Story conforme aux 5 critères d'acceptation : back-office entièrement traduit FR/EN via le
même dispositif next-intl que le storefront, langue résolue par cookie (sans préfixe d'URL),
sélecteur réutilisant la primitive `@pharmacie/ui`, `noindex` confirmé. Catalogue `admin.*` à
parité (330 clés, test vert). type-check, lint et tests passent ; scan « zéro littéral FR
résiduel » sur `app/admin/**` propre. Quelques points mineurs, aucun bloquant.

## Conformité

- 🟢 **Scénario 1** (admin traduit) — toutes les surfaces externalisées (shell, dashboard,
  catégories, marques, produits, login, forbidden).
- 🟢 **Scénario 2** (même système) — namespace `admin.*` dans `messages/{fr,en}.json`, parité
  vérifiée par `messages.test.ts`.
- 🟢 **Scénario 3** (préférence cookie, sans préfixe) — `i18n/request.ts` lit `NEXT_LOCALE`
  hors `[locale]` ; `setAdminLocale` persiste le cookie ; `router.refresh()` applique.
- 🟢 **Scénario 4** (sélecteur réutilisé) — `admin-language-switcher.tsx` câble la primitive
  `@pharmacie/ui` en mode préférence ; intégré dans `admin-shell.tsx:153`.
- 🟢 **Scénario 5** (pas de SEO) — `admin/layout.tsx` : `metadata.robots = {index:false}` ;
  pas de préfixe ni d'entrée sitemap.
- 🟢 Questions ouvertes du ticket tranchées et documentées (locale par défaut = site,
  cookie partagé ; namespace `common` factorisé).

## Qualité

- 🟢 Découplage i18n/domaine exemplaire : les server actions mappent les **types** d'erreur de
  `@pharmacie/core` vers des clés (`domainErrorKey`, `_actions.ts`) ; `error.message` n'est
  plus renvoyé. `readVariants` reste pur (clé d'erreur + label injecté).
- 🟢 `resolveLocale` extrait en helper pur testable ; `cookies()` appelé conditionnellement
  pour préserver le rendu statique storefront.
- 🟡 **Clé `new` dupliquée dans le catalogue source** : `admin.{categories,brands,products}`
  contient à la fois un (intention de) libellé plat `new` et un objet `new:{title,subtitle}` —
  au parse JSON, l'objet écrase la chaîne. Conséquence sans bug visible : les boutons de liste
  rendent `+ {t("new.title")}` (≈ libellé d'origine). À nettoyer : renommer le bouton de liste
  (ex. `newButton`) pour lever l'ambiguïté. Fichiers : `messages/{fr,en}.json`,
  `{categories,marques,produits}/page.tsx:23`.
- 🔵 Clés dynamiques typées par cast vers une clé littérale (`types.${code} as "types.COSMETIC"`,
  `errorKey as "priceInvalid"`). Fonctionnel et nécessaire avec le typage strict next-intl,
  mais un `as` qui masque la vérification exhaustive — acceptable, à commenter éventuellement.

## Tests

- 🟢 `i18n/locale.test.ts` couvre `resolveLocale` (segment, cookie, hors-whitelist, défaut).
- 🟢 `messages.test.ts` garantit la parité FR/EN, admin inclus.
- 🔵 Pas de test sur `setAdminLocale` (whitelist) ni sur le `noindex` du layout admin ; surface
  faible et difficilement testable en unitaire (cookies/headers). Couverture jugée suffisante ;
  un test e2e du switch admin serait le complément naturel.

## Sécurité

- 🟢 `setAdminLocale` derrière l'admin protégé + whitelist stricte (`hasLocale`) → pas
  d'écriture de cookie arbitraire. Cookie `sameSite: lax`, non httpOnly (nécessaire pour la
  résolution next-intl) — acceptable (préférence non sensible).
- 🟢 Login : message d'erreur générique conservé (`admin.login.invalid`, pas d'énumération
  d'utilisateurs).
- 🔵 Cookie `NEXT_LOCALE` partagé storefront/admin : changer la langue admin affecte le
  storefront. Comportement voulu (préférence unique), documenté dans le journal de tâche.

## Performance

- 🟢 Chargement des messages **par locale** (import dynamique dans `request.ts`), pas de bundle
  multi-langues. Aucun N+1 introduit (les pages réutilisent les `findMany` existants).
- 🔵 RAS de notable.

## Actions suggérées

1. 🟡 Nettoyer la clé `new` dupliquée : introduire `admin.<entité>.newButton` pour les boutons
   de liste et garder `new.{title,subtitle}` pour les en-têtes de page.
2. 🔵 (Optionnel) Ajouter un test e2e du changement de langue admin (cookie + persistance) et
   un test vérifiant `metadata.robots.index === false` sur le layout admin.
3. 🔵 (Vérification) Lancer un `next build` complet une fois l'échec pré-existant
   (_Collecting page data_) résolu, pour valider de bout en bout le rendu RSC admin/storefront.

✅ Review rédigée dans reviews/2026-06-16-i18n-05-back-office-admin.md. Verdict : 🟢
