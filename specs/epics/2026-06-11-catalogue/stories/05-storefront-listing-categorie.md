# Story : Storefront — listing de catégorie

**Epic parent** : [Catalogue](../epic.md)
**Date** : 2026-06-11 · **Statut** ✅ · **Estimation** M

## Contexte

Première vitrine client : afficher les produits d'une catégorie, avec tri et
pagination. Les filtres/facettes sont **hors périmètre** (module `search`, lot 4.4).

## User Story

**En tant que** client, **je veux** parcourir les produits d'une catégorie,
**afin de** trouver des articles de parapharmacie qui m'intéressent.

## Critères d'acceptation

### Scénario 1 : Afficher une catégorie

- **Étant donné** une catégorie avec des produits affichables
- **Quand** j'ouvre `/[slug-categorie]`
- **Alors** je vois la liste des produits **affichables** (cf. story 02) : visuel
  principal, nom, marque, prix HT (ou fourchette si plusieurs variantes)
- **Et** les produits inactifs ou sans variante n'apparaissent pas

### Scénario 2 : Tri

- **Étant donné** la page de catégorie
- **Quand** je choisis un tri (nouveautés, prix croissant, prix décroissant, nom)
- **Alors** la liste est réordonnée en conséquence
- **Et** le tri est reflété dans l'URL (paramètre de requête) pour être partageable

### Scénario 3 : Pagination

- **Étant donné** une catégorie avec plus de N produits (N = taille de page)
- **Quand** je navigue entre les pages
- **Alors** la page courante est reflétée dans l'URL
- **Et** une catégorie vide affiche un **état vide** explicite (pas d'erreur)

### Scénario 4 : Catégorie inexistante

- **Étant donné** un slug de catégorie inconnu
- **Quand** j'ouvre l'URL
- **Alors** une page **404** est renvoyée

### Scénario 5 : Rendu SEO-friendly

- **Étant donné** une page catégorie
- **Quand** elle est servie
- **Alors** elle est rendue côté serveur (SSR/ISR) avec un `<title>` et une meta
  description issus de la catégorie 🚧 (stratégie de rendu fine = lot 8.1)

## Non-objectifs

- Filtres / facettes / recherche (→ `search`, lot 4.4).
- Inclusion récursive des produits des sous-catégories : 🚧 hypothèse = produits
  directement rattachés uniquement (à confirmer).
- Design HD final (→ maquette lot 2.4).

## Contraintes

- Route dans `apps/pharmacie-1/src/app/(storefront)` ; données via repositories `core`.
- Pagination par offset ou curseur (au choix `/plan`) ; taille de page configurable.
- Composants visuels issus de `@pharmacie/ui` (thémables par tokens).

## Questions ouvertes

- 🚧 Taille de page par défaut ? Hypothèse : 24.
- 🚧 Inclure les produits des sous-catégories ? (cf. non-objectifs)
