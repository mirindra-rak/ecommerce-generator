# Story : Externalisation des chaînes UI storefront (FR/EN)

**Epic parent** : [Internationalisation (i18n) — UI multilingue](../epic.md)
**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation** M/L

## Contexte

Les libellés du storefront sont codés en dur en français dans les composants
(`_components/*`, pages). Cette story les **externalise** vers des catalogues de messages
par locale (FR défaut + EN) et branche chaque composant sur l'API i18n posée en story 01.

## User Story

**En tant que** visiteur en `en`, **je veux** que l'intégralité du chrome (navigation,
header, footer, hero, réassurance, newsletter, boutons, formulaires) s'affiche en anglais,
**afin de** comprendre et utiliser le site sans rencontrer de texte en français.

## Critères d'acceptation

### Scénario 1 : chrome entièrement traduit

- **Étant donné** la locale `en`
- **Quand** le visiteur parcourt l'accueil, une catégorie et une fiche produit
- **Alors** tous les libellés **d'interface** (menus, boutons, intitulés, placeholders,
  messages d'aide, mentions de réassurance, footer) sont en anglais.

### Scénario 2 : zéro chaîne d'UI en dur

- **Étant donné** le code des composants storefront après cette story
- **Quand** on recherche des libellés littéraux destinés à l'affichage
- **Alors** il n'en reste aucun codé en dur : tout passe par une clé de message.
  _(Le contenu issu de la base — noms produits, descriptions — est explicitement exclu.)_

### Scénario 3 : catalogues structurés et complets

- **Étant donné** les fichiers de messages `fr` et `en`
- **Quand** on les compare
- **Alors** ils ont **les mêmes clés** (pas de clé manquante d'un côté), organisées par
  namespace (ex. `header`, `footer`, `hero`, `reassurance`, `newsletter`, `common`).

### Scénario 4 : pluriels et interpolations

- **Étant donné** un libellé avec variable ou pluriel (ex. « N produits »)
- **Quand** il est rendu
- **Alors** l'interpolation et la pluralisation utilisent l'API de la lib (ICU), correctes
  dans chaque locale.

### Scénario 5 : fallback contrôlé

- **Étant donné** une clé absente de la locale active
- **Quand** elle est demandée
- **Alors** le comportement est déterministe (fallback vers `defaultLocale` ou erreur de
  build), sans afficher la clé brute en production.

## Non-objectifs

- Traduction du **contenu** catalogue/CMS (hors scope epic).
- Externalisation des chaînes du back-office `/admin` (→ story 05).
- Sélecteur de langue (→ story 03) et SEO (→ story 04).

## Contraintes

- Tous les textes via primitives `@pharmacie/ui` + API i18n ; pas de markup natif.
- Rendu des traductions **côté serveur** prioritairement (minimiser le JS client).
- Qualité EN : traductions cohérentes avec le ton « officine éditoriale ».
- TS strict : clés typées si la lib le permet (autocomplétion/erreur sur clé inconnue).

## Questions ouvertes

- 🚧 Emplacement des catalogues : `apps/pharmacie-1/messages/<locale>.json` (par app, Silo)
  vs partagé `packages/` — pencher **par app** (un site = une config). À valider au `/plan`.
- 🚧 Périmètre exact des composants admin partagés éventuellement importés par le storefront.
