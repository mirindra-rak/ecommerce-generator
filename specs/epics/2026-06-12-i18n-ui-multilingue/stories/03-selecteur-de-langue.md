# Story : Sélecteur de langue (primitive `@pharmacie/ui`)

**Epic parent** : [Internationalisation (i18n) — UI multilingue](../epic.md)
**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation** S/M

## Contexte

Une fois le routing par locale (story 01) et les chaînes externalisées (story 02) en place,
le visiteur doit pouvoir **changer de langue** depuis l'interface. Cette story ajoute une
primitive de sélection de langue au design system et l'intègre au header.

## User Story

**En tant que** visiteur, **je veux** un sélecteur de langue visible dans le header,
**afin de** basculer entre FR et EN sans perdre la page que je consulte.

## Critères d'acceptation

### Scénario 1 : changement de langue sans perte de contexte

- **Étant donné** un visiteur sur `/fr/categorie/visage`
- **Quand** il choisit « English » dans le sélecteur
- **Alors** il arrive sur `/en/categorie/visage` (même page, locale changée), sans retour
  à l'accueil.

### Scénario 2 : persistance du choix

- **Étant donné** un visiteur ayant choisi `en`
- **Quand** il revient plus tard sur le site (nouvelle visite)
- **Alors** la locale `en` est restaurée (cookie), cohérente avec le middleware (story 01).

### Scénario 3 : état actif et locales disponibles

- **Étant donné** le sélecteur affiché
- **Quand** il est ouvert
- **Alors** il liste exactement les `supportedLocales`, avec la locale active marquée comme
  sélectionnée.

### Scénario 4 : primitive design system

- **Étant donné** le composant de sélection
- **Quand** il est rendu
- **Alors** il vit dans `@pharmacie/ui`, suit la direction « officine éditoriale », et est
  accessible (navigation clavier, `aria` adéquats, focus visible).

## Non-objectifs

- Détection/redirection automatique par géolocalisation.
- Drapeaux comme unique indicateur (préférer libellé langue ; drapeau optionnel décoratif).
- Intégration de la primitive dans le back-office (→ story 05) ; ici, intégration storefront.

## Contraintes

- Markup exclusivement via primitives `@pharmacie/ui` (réutiliser `select`/`icon-button`
  existants si pertinent, sinon nouvelle primitive `language-switcher`).
- Conservation de la route courante au switch (mapping chemin → même chemin autre locale).
- Accessibilité : composant utilisable au clavier et lecteur d'écran.
- Performance : pas de rechargement complet superflu ; s'appuyer sur la navigation Next.

## Questions ouvertes

- 🚧 Forme exacte (menu déroulant vs deux liens FR/EN) — trancher au `/plan` selon le header.
- 🚧 Emplacement mobile (dans le header compact vs le menu) — à caler avec le design header.
