# Plan : Internationalisation du back-office `/admin`

**Ticket** : [05-i18n-back-office-admin](05-i18n-back-office-admin.md) · **Statut** ✅ (implémenté le 2026-06-16)

## Résumé

Faire passer tout le back-office `/admin` (hors arbre `[locale]`) par le même dispositif
next-intl que le storefront : locale résolue par **cookie** (préférence, pas d'URL préfixée),
`<html lang>` dynamique, sélecteur réutilisant la primitive `@pharmacie/ui`, catalogue de
messages `admin.*` FR/EN à parité, et `noindex` confirmé.

## État des lieux (exploration)

- `src/i18n/request.ts` : `getRequestConfig` résout la locale via `requestLocale` (segment
  `[locale]`) + fallback `defaultLocale`. **Ne lit pas** de cookie → l'admin (sans segment)
  retombe toujours sur `defaultLocale`.
- `app/admin/layout.tsx` : `<html lang="fr">` **en dur**, pas de `NextIntlClientProvider`, pas
  de `metadata` (donc pas de `noindex` au niveau page ; seul `robots.ts` exclut `/admin`).
- `app/admin/(protected)/layout.tsx` : garde `requireStaff` + `AdminShell` (client).
- Libellés **en dur** (FR) répartis sur : `admin-shell.tsx` (nav, titres de page, top bar),
  `(protected)/page.tsx` + `_components/{kpi-cards,weekly-chart,produits-table,
categories-table,marques-table,row-actions}.tsx`, les dossiers `categories/`, `marques/`,
  `produits/` (`page.tsx`, `*-form.tsx`, `variants-editor.tsx`, `_actions.ts`), `login/`
  (`page.tsx`, `login-form.tsx`), `forbidden/page.tsx`, `(protected)/logout-button.tsx`.
- Validations : (a) inline dans les `_actions.ts` (« Le nom est requis. », « Identifiant
  manquant. ») ; (b) **erreurs de domaine** typées de `@pharmacie/core` dont le `.message`
  (FR) est aujourd'hui renvoyé tel quel — à mapper par **type** vers une clé i18n (le domaine
  reste agnostique de la locale).
- Sélecteur storefront (`[locale]/(storefront)/_components/language-switcher.tsx`) : câble la
  primitive `LanguageSwitcher` de `@pharmacie/ui` à `router.replace(..., { locale })` (change
  l'URL). Namespace `localeSwitcher` (ariaLabel) déjà présent. Cookie next-intl : `NEXT_LOCALE`.
- `messages/{fr,en}.json` : 18 namespaces, **pas** de namespace `admin`. `messages.test.ts`
  impose la **parité de clés** FR/EN.

## Fichiers à créer ou modifier

### Mécanique i18n (locale par cookie)

- `apps/pharmacie-1/src/i18n/locale.ts` — **créé** : helper pur `resolveLocale(requested,
cookie)` (whitelist `routing.locales`, fallback `defaultLocale`) — testable sans next-intl.
- `apps/pharmacie-1/src/i18n/locale.test.ts` — **créé** : storefront (segment prioritaire),
  admin (cookie), valeurs hors whitelist → défaut.
- `apps/pharmacie-1/src/i18n/request.ts` — **modifié** : utiliser `resolveLocale` ; lire le
  cookie `NEXT_LOCALE` **uniquement** si `requestLocale` est absent (préserve le rendu
  statique du storefront — `cookies()` non appelé sur les routes `[locale]`).

### Layout & noindex admin

- `apps/pharmacie-1/src/app/admin/layout.tsx` — **modifié** : `async`, `lang` dynamique via
  `getLocale()`, envelopper dans `NextIntlClientProvider`, `export const metadata` avec
  `robots: { index: false, follow: false }` (scénario 5).

### Sélecteur de langue admin (préférence, sans URL)

- `apps/pharmacie-1/src/app/admin/(protected)/_actions/locale-action.ts` — **créé** : server
  action `setAdminLocale(locale)` — valide la locale, écrit le cookie `NEXT_LOCALE`.
- `apps/pharmacie-1/src/app/admin/(protected)/_components/admin-language-switcher.tsx` —
  **créé** : adaptateur client réutilisant la **primitive** `@pharmacie/ui` ; au changement,
  appelle `setAdminLocale` puis `router.refresh()` (aucun changement d'URL).
- `admin-shell.tsx` — **modifié** : intégrer le sélecteur dans la top bar.

### Externalisation des chaînes (namespace `admin.*`)

- `apps/pharmacie-1/messages/fr.json` & `en.json` — **modifié** : ajouter le namespace
  `admin` (sous-clés : `nav`, `topbar`, `dashboard`, `categories`, `brands`, `products`,
  `login`, `forbidden`, `common`). Parité FR/EN stricte.
- **Composants/pages client** (`useTranslations`) : `admin-shell.tsx`,
  `_components/{kpi-cards,weekly-chart,produits-table,categories-table,marques-table,
row-actions}.tsx`, `categories/category-form.tsx`, `marques/brand-form.tsx`,
  `produits/{produit-form,variants-editor}.tsx`, `login/login-form.tsx`,
  `(protected)/logout-button.tsx`.
- **Pages/serveur** (`getTranslations`) : `(protected)/page.tsx`, `categories/page.tsx`,
  `marques/page.tsx`, `produits/page.tsx`, `login/page.tsx`, `forbidden/page.tsx`,
  les `new/` et `[id]/` si elles portent des libellés.
- **Server actions** (`getTranslations`) : `categories/_actions.ts`, `marques/_actions.ts`,
  `produits/_actions.ts` — remplacer les chaînes inline et le `error.message` brut par des
  clés (`admin.*.errors.*`) mappées **par type d'erreur** de domaine.

## Étapes de développement

1. **Helper `resolveLocale` + test** — extraire la résolution (whitelist + fallback) dans
   `i18n/locale.ts`. Test : `("en", undefined)→en`, `(undefined,"en")→en`,
   `(undefined,"de")→fr`, `(undefined,undefined)→fr`.
2. **Cookie dans `request.ts`** — brancher `resolveLocale` ; n'appeler `cookies()` que si
   `requestLocale` est absent. Vérif : storefront rend toujours en statique (build/`type-check`
   OK), admin lit le cookie.
3. **Layout admin i18n + noindex** — `lang` dynamique (`getLocale()`),
   `NextIntlClientProvider`, `metadata.robots.index=false`. Test : `metadata` exporte
   `robots:{index:false}` ; `pnpm type-check`.
4. **Server action `setAdminLocale` + sélecteur admin** — action qui whiteliste et écrit
   `NEXT_LOCALE` ; adaptateur client (primitive `@pharmacie/ui`) → action + `router.refresh()`
   ; intégration top bar `admin-shell`. Test : action rejette une locale hors whitelist
   (test unitaire de la garde si extraite ; sinon vérif manuelle documentée).
5. **Catalogue `admin.*` (FR + EN)** — créer toutes les clés à parité dans les deux fichiers.
   Test : `messages.test.ts` reste vert (parité), `admin` présent dans les deux.
6. **Externaliser la coquille** — `admin-shell` (nav, titres de page, top bar, logout) +
   `logout-button`. Test : plus de littéral FR dans ces fichiers ; `type-check`/`lint`.
7. **Externaliser le tableau de bord** — `(protected)/page.tsx`, `kpi-cards`,
   `weekly-chart`. Test : idem.
8. **Externaliser catégories** — `page.tsx`, `categories-table`, `category-form`,
   `row-actions`, `_actions.ts` (clés d'erreur + mapping par type). Test : `type-check`/`lint`.
9. **Externaliser marques** — `page.tsx`, `marques-table`, `brand-form`, `_actions.ts`.
10. **Externaliser produits** — `page.tsx`, `produits-table`, `produit-form`,
    `variants-editor`, `_actions.ts`.
11. **Externaliser login/forbidden** — `login/page.tsx`, `login-form`, `forbidden/page.tsx`.
12. **Vérifs finales** — `pnpm type-check`, `pnpm lint`, `pnpm test` ; revue « zéro littéral
    UI résiduel » sur `app/admin/**` (critère i18n-ready de l'epic).

## Points d'attention

- **Rendu statique storefront (risque majeur)** : appeler `cookies()` inconditionnellement
  dans `getRequestConfig` rendrait le storefront dynamique. Mitigation : cookie lu **seulement**
  si `requestLocale` absent (cas admin). À vérifier explicitement (build storefront).
- **Erreurs de domaine** : ne pas traduire dans `@pharmacie/core` (couche agnostique). Les
  `_actions.ts` mappent `instanceof <ErreurTypée>` → clé `admin.*.errors.*` via
  `getTranslations`. Les messages FR actuels des erreurs deviennent le contenu des clés FR.
- 🚧 **Locale admin par défaut** : décision → `defaultLocale` du site (pas de réglage admin
  distinct en V1) ; la préférence vit dans le cookie `NEXT_LOCALE` (partagé avec le storefront,
  cohérent). Persistance par compte = hors V1 (cf. non-objectif).
- 🚧 **Factorisation `common`** : décision → réutiliser le namespace racine `common` pour le
  vraiment transverse storefront+admin ; créer `admin.common` pour les actions communes
  propres à l'admin (Enregistrer/Annuler/Supprimer…). Éviter de dupliquer des clés.
- **Cookie partagé** : l'admin et le storefront partagent `NEXT_LOCALE`. Changer la langue
  dans l'admin affecte aussi le storefront — comportement acceptable (préférence utilisateur
  unique). À noter, pas un bug.
- **`router.refresh()`** : nécessaire après `setAdminLocale` pour re-rendre les Server
  Components avec la nouvelle locale (le cookie seul ne suffit pas sans rechargement).
- **Volumétrie** : story large (beaucoup de chaînes) mais mécanique. Respecter le design
  system (`@pharmacie/ui`), TS strict (`any` interdit), pas de `console.log`.
- **Sécurité** : `setAdminLocale` derrière l'admin protégé + whitelist stricte de la locale
  (pas d'écriture de cookie arbitraire). Pas de SEO/préfixe pour l'admin (scénario 5).

✅ Plan rédigé dans specs/epics/2026-06-12-i18n-ui-multilingue/stories/05-i18n-back-office-admin-plan.md. À relire avant /coder.
