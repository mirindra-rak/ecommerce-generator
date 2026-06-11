# Story : Storefront — fiche produit

**Epic parent** : [Catalogue](../epic.md)
**Date** : 2026-06-11 · **Statut** 🟡 · **Estimation** M

## Contexte

La fiche produit présente un article en détail : galerie média, sélection de variante,
prix HT, et informations réglementaires parapharmacie. C'est la page de conversion
principale ; l'ajout au panier (module `cart`) viendra plus tard.

## User Story

**En tant que** client, **je veux** consulter le détail d'un produit et choisir une
variante, **afin de** décider de mon achat en toute information.

## Critères d'acceptation

### Scénario 1 : Afficher une fiche produit

- **Étant donné** un produit affichable
- **Quand** j'ouvre `/produit/[slug]`
- **Alors** je vois : nom, marque, description, galerie de médias (ordonnés), type de
  produit, composition (INCI) et précautions d'emploi si renseignées
- **Et** le prix HT de la variante sélectionnée (ou la fourchette par défaut)

### Scénario 2 : Sélection de variante

- **Étant donné** un produit multi-axes (ex. Contenance 50 ml / 100 ml)
- **Quand** je choisis une valeur d'option
- **Alors** la variante correspondante est résolue (story 02) et le prix HT, le `sku`
  et l'indication de stock se mettent à jour
- **Et** une combinaison sans variante existante est indisponible/désactivée

### Scénario 3 : Produit non affichable ou inconnu

- **Étant donné** un slug inconnu, ou un produit inactif / sans variante
- **Quand** j'ouvre l'URL
- **Alors** une page **404** est renvoyée

### Scénario 4 : Données structurées & SEO

- **Étant donné** une fiche produit
- **Quand** elle est servie (SSR/ISR)
- **Alors** elle expose un `<title>`, une meta description et des données structurées
  `Product` 🚧 (détail SEO = lot 8.2)

### Scénario 5 : Galerie média

- **Étant donné** un produit avec plusieurs médias
- **Quand** j'affiche la fiche
- **Alors** les médias sont affichés triés par `position`, avec leur texte `alt`
- **Et** un produit sans média affiche un visuel de remplacement

## Non-objectifs

- Ajout au panier / wishlist (→ `cart`, `wishlist`).
- Cross-sell / produits associés (→ itération ultérieure).
- Avis produits (→ `reviews`, lot 4.13).
- Calcul TTC / TVA (→ `pricing`).

## Contraintes

- Route dans `apps/pharmacie-1/src/app/(storefront)` ; données via repositories `core`.
- Sélection de variante interactive (client) au-dessus de données rendues côté serveur.
- Composants issus de `@pharmacie/ui` (thémables).

## Questions ouvertes

- 🚧 Format d'URL : `/produit/[slug]` vs `/[categorie]/[slug]` ? Hypothèse :
  `/produit/[slug]` (slug global unique, robuste aux changements de catégorie).
- 🚧 Affichage du stock : exact, « en stock / rupture », ou rien à ce stade ?
  Hypothèse : binaire « en stock / rupture » basé sur le champ `stock`.
