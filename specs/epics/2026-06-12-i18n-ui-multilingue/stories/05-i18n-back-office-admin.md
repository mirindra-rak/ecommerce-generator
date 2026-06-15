# Story : Internationalisation du back-office `/admin`

**Epic parent** : [Internationalisation (i18n) — UI multilingue](../epic.md)
**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation** M

## Contexte

Le back-office (`/admin` : tableau de bord, catégories, marques, produits, formulaires,
layout) a ses libellés codés en dur en français. Pour un système i18n **unique et
cohérent**, l'admin doit lui aussi passer par next-intl. Spécificité : le back-office est
`noindex` et interne — pas de routing par locale ni de SEO, la langue est une **préférence
utilisateur** (cookie), avec sélecteur.

## User Story

**En tant que** membre de l'équipe utilisant le back-office, **je veux** une interface
d'administration dans ma langue (FR ou EN), **afin de** travailler sans barrière de langue,
de façon cohérente avec le reste de l'outil.

## Critères d'acceptation

### Scénario 1 : admin entièrement traduit

- **Étant donné** un admin ayant choisi `en`
- **Quand** il parcourt le tableau de bord, les catégories, les marques et leurs formulaires
- **Alors** tous les libellés d'interface (navigation, titres, boutons, champs, validations,
  messages de statut) s'affichent en anglais.

### Scénario 2 : même système de messages

- **Étant donné** les catalogues de messages
- **Quand** on ajoute les clés admin
- **Alors** elles vivent dans le **même** dispositif next-intl que le storefront (namespace
  dédié, ex. `admin.*`), avec parité de clés FR/EN.

### Scénario 3 : langue par préférence, sans préfixe d'URL

- **Étant donné** l'admin sur `/admin/categories`
- **Quand** il change de langue via le sélecteur
- **Alors** l'URL **reste** `/admin/categories` (aucun préfixe de locale), la langue est
  persistée par cookie et appliquée aux pages admin suivantes.

### Scénario 4 : sélecteur réutilisé

- **Étant donné** la primitive de sélection de langue (story 03)
- **Quand** elle est intégrée au layout admin
- **Alors** c'est la **même** primitive `@pharmacie/ui`, adaptée au contexte « préférence »
  (pas de changement d'URL).

### Scénario 5 : pas d'impact SEO

- **Étant donné** les pages `/admin`
- **Quand** elles sont rendues
- **Alors** elles restent `noindex`, sans `hreflang` ni entrée de sitemap.

## Non-objectifs

- Préfixe de locale `/[locale]/admin` et signaux SEO pour l'admin (volontairement exclus).
- Traduction des **données** gérées dans l'admin (noms de produits/catégories saisis).
- Persistance de la préférence de langue par compte en base (cookie suffit en V1). 🚧

## Contraintes

- Réutiliser le système next-intl de la story 01 et la primitive sélecteur de la story 03.
- Langue admin résolue **sans** le middleware de préfixe storefront (cookie/préférence) —
  s'assurer que l'admin reste hors de l'arbre `[locale]` (cf. story 01).
- Markup via primitives `@pharmacie/ui` ; TS strict ; parité de clés FR/EN.

## Questions ouvertes

- 🚧 Locale admin par défaut : `defaultLocale` du site ou réglage admin distinct ?
- 🚧 Si l'admin partage des composants avec le storefront, éviter la double-traduction des
  clés communes (factoriser un namespace `common`).
