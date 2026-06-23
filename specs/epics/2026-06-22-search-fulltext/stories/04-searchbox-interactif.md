# Story 04 : Composant SearchBox interactif (header, dropdown)

**Epic parent** : [Recherche full-text PostgreSQL](../epic.md)
**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : M (~1 jour)

## Contexte

Le header storefront contient un placeholder statique (div non cliquable avec icône
et texte « Rechercher un produit, une marque… »). Ce placeholder doit être remplacé
par un composant interactif : champ de saisie avec dropdown de suggestions en temps
réel, navigation clavier, et redirection vers la page résultats.

## User Story

**En tant que** visiteur du storefront, **je veux** taper dans le champ de recherche
du header et voir des suggestions de produits apparaître instantanément, **afin de**
trouver rapidement un produit sans parcourir les catégories.

## Critères d'acceptation

### Scénario 1 : Saisie et suggestions

- **Étant donné** le champ de recherche dans le header
- **Quand** le visiteur tape 2+ caractères (ex. « dol »)
- **Alors** :
  - Un appel à `/api/storefront/search/suggest?q=dol` est déclenché après un debounce
    de 300 ms
  - Un dropdown apparaît sous le champ avec max 8 suggestions
  - Chaque suggestion affiche : nom du produit, marque, prix TTC, miniature image
  - Un indicateur de chargement est visible pendant le fetch

### Scénario 2 : Navigation clavier

- **Étant donné** le dropdown ouvert avec des suggestions
- **Quand** le visiteur utilise les touches ↑ / ↓
- **Alors** la suggestion active est mise en surbrillance visuellement
- **Quand** il appuie sur Entrée sur une suggestion active
- **Alors** il est redirigé vers la fiche produit (`/produit/{slug}`)
- **Quand** il appuie sur Échap
- **Alors** le dropdown se ferme et le champ perd le focus

### Scénario 3 : Soumission du formulaire

- **Étant donné** un terme saisi dans le champ (ex. « crème solaire »)
- **Quand** le visiteur appuie sur Entrée (sans suggestion sélectionnée) ou clique
  sur le bouton de recherche
- **Alors** il est redirigé vers `/recherche?q=crème+solaire`

### Scénario 4 : Clic sur une suggestion

- **Étant donné** le dropdown ouvert
- **Quand** le visiteur clique sur une suggestion
- **Alors** il est redirigé vers la fiche produit correspondante
- Et le dropdown se ferme

### Scénario 5 : Fermeture du dropdown

- **Étant donné** le dropdown ouvert
- **Quand** le visiteur clique en dehors du composant
- **Alors** le dropdown se ferme
- **Quand** le champ contient moins de 2 caractères (effacement)
- **Alors** le dropdown se ferme

### Scénario 6 : Aucune suggestion

- **Étant donné** un terme qui ne matche aucun produit
- **Quand** les suggestions sont vides
- **Alors** le dropdown affiche un message « Aucun résultat pour "{terme}" » avec un
  lien « Voir tous les résultats » pointant vers `/recherche?q={terme}`

### Scénario 7 : Responsive (mobile)

- **Étant donné** un écran mobile (< 768px)
- **Quand** le visiteur tape sur l'icône de recherche
- **Alors** un champ de recherche pleine largeur s'affiche (overlay ou expansion)
- Et les suggestions fonctionnent de la même manière qu'en desktop

### Scénario 8 : Accessibilité

- **Étant donné** le composant SearchBox
- **Alors** :
  - Le champ a un `role="combobox"` avec `aria-expanded`, `aria-autocomplete="list"`
  - Le dropdown a un `role="listbox"` et chaque suggestion un `role="option"`
  - La suggestion active est liée via `aria-activedescendant`
  - Le label est associé au champ (via `aria-label` ou `<label>`)

## Non-objectifs

- Pas de recherche vocale.
- Pas d'historique de recherche récent dans le dropdown.
- Pas de catégories/marques dans les suggestions (produits uniquement).

## Contraintes

- Le composant SearchBox est un **Client Component** (`"use client"`) car il gère
  du state local (terme, suggestions, focus).
- Le placeholder existant dans `site-header.tsx` (L51-55) est remplacé par le nouveau
  composant.
- Le debounce est côté client (300 ms) — pas de requête avant 2 caractères.
- Le composant utilise les primitives `@pharmacie/ui` existantes (Input, etc.) et
  respecte le design system (tokens couleur, typographie).
- i18n : les textes (placeholder, « Aucun résultat », « Voir tous les résultats »)
  passent par `next-intl` (`useTranslations`).
