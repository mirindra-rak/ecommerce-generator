# Story i18n 05 — Internationalisation du back-office /admin

**Date:** 2026-06-16 15:25
**Statut:** Terminé

## Contexte

Dernière story de l'epic i18n. Tout le back-office `/admin` (hors arbre `[locale]`) avait
ses libellés codés en dur en FR. Cette tâche le fait passer par le **même** dispositif
next-intl que le storefront, avec la langue résolue par **cookie** (préférence, pas d'URL
préfixée), `<html lang>` dynamique, sélecteur réutilisant la primitive `@pharmacie/ui`,
catalogue `admin.*` FR/EN à parité, et `noindex` confirmé.
Plan : `specs/epics/2026-06-12-i18n-ui-multilingue/stories/05-i18n-back-office-admin-plan.md`.

## Modifications

### Mécanique i18n (locale par cookie)

- [x] `src/i18n/locale.ts` — **créé** : `resolveLocale(requested, cookie)` (whitelist + défaut).
- [x] `src/i18n/locale.test.ts` — **créé** : segment prioritaire, fallback cookie, hors-whitelist.
- [x] `src/i18n/request.ts` — lecture cookie `NEXT_LOCALE` **uniquement** si `requestLocale`
      absent (préserve le rendu statique du storefront).

### Layout & sélecteur admin

- [x] `src/app/admin/layout.tsx` — `lang` dynamique (`getLocale`), `NextIntlClientProvider`,
      `metadata.robots = { index:false, follow:false }`.
- [x] `src/app/admin/(protected)/_actions/locale-action.ts` — **créé** : server action
      `setAdminLocale` (whitelist + cookie).
- [x] `src/app/admin/(protected)/_components/admin-language-switcher.tsx` — **créé** :
      adaptateur « préférence » (primitive `@pharmacie/ui` + action + `router.refresh()`).
- [x] `_components/admin-shell.tsx` — nav/titres/topbar traduits + sélecteur intégré.

### Catalogue de messages

- [x] `messages/fr.json` & `messages/en.json` — namespace `admin.*` ajouté (parité stricte,
      330 clés au total, vérifiée par `messages.test.ts`).

### Externalisation (useTranslations / getTranslations)

- [x] Tableau de bord : `(protected)/page.tsx`, `_components/{kpi-cards,weekly-chart}.tsx`,
      `logout-button.tsx`, `_components/row-actions.tsx`.
- [x] Catégories : `categories/{page,new/page,[id]/page,category-form,_actions}.tsx/ts`,
      `_components/categories-table.tsx`.
- [x] Marques : `marques/{page,new/page,[id]/page,brand-form,_actions}.tsx/ts`,
      `_components/marques-table.tsx`.
- [x] Produits : `produits/{page,new/page,[id]/page,produit-form,variants-editor,_actions}`,
      `_components/produits-table.tsx`.
- [x] Auth : `login/{page,login-form}.tsx`, `forbidden/page.tsx`.

## Notes

- **Décision (question ouverte)** : locale admin = `defaultLocale` du site, préférence dans le
  cookie `NEXT_LOCALE` **partagé** avec le storefront (préférence utilisateur unique).
  Persistance par compte = hors V1.
- **Découplage i18n / domaine** : les server actions mappent les **types** d'erreur de
  `@pharmacie/core` vers des clés `admin.*.errors.*` (le domaine reste agnostique de la
  locale, `error.message` n'est plus renvoyé). Les messages paramétrés (`InvalidProductAttributes`,
  `DuplicateProductField`…) sont rendus en messages génériques traduits.
- **`produits/_actions.ts`** : `readVariants` reste découplé de l'i18n — il renvoie une clé
  d'erreur + un `label`, et reçoit la traduction du repli « sans référence » en paramètre ;
  l'action traduit le message final.
- **Clés dynamiques + typage strict next-intl** : pour les clés calculées
  (`types.${code}`, `typesLong.${type}`, `errorKey`) → cast vers une clé littérale valide.
- **Réutilisation** : la primitive sélecteur (story 03) est partagée ; l'adaptateur admin
  diffère du storefront (préférence cookie au lieu de changement d'URL).
- **Méthode** : namespace `admin.*` construit en une fois (source unique), puis externalisation
  des fichiers via sous-agents parallèles (fichiers disjoints) ; 3 surfaces ont été terminées
  manuellement après coupures API côté sous-agents.
- Vérifs : `pnpm type-check` ✓, `pnpm lint` ✓, `pnpm test` ✓ (core 82, app 13). Scan « zéro
  littéral UI FR résiduel » sur `app/admin/**` : OK.
- **Limite de vérification** : pas de `next build` complet ici (échec pré-existant à l'étape
  _Collecting page data_, sans rapport — cf. tâche du 2026-06-16 14h34). Le rendu statique du
  storefront est préservé par construction (cookie lu seulement hors `[locale]`).

## Rollback

```bash
git revert <hash-du-commit-story-05>
```
