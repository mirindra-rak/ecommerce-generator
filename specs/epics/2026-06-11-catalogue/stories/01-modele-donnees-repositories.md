# Story : Modèle de données catalogue + repositories

**Epic parent** : [Catalogue](../epic.md)
**Date** : 2026-06-11 · **Statut** 🟡 · **Estimation** M

## Contexte

Fondation du catalogue : formaliser le schéma Prisma (au-delà de l'amorce existante)
et exposer l'accès aux données via le Repository pattern. Aucune autre story ne peut
démarrer sans ce socle.

## User Story

**En tant que** développeur du moteur e-commerce, **je veux** un modèle de données
catalogue complet et des repositories typés, **afin de** manipuler produits, variantes,
catégories, marques et médias sans requête Prisma dispersée.

## Critères d'acceptation

### Scénario 1 : Schéma de données complet

- **Étant donné** le schéma Prisma `packages/core/prisma/schema.prisma`
- **Quand** la migration est appliquée
- **Alors** les modèles suivants existent : `Brand`, `Category` (arbre auto-référencé),
  `Product`, `ProductOption`, `ProductOptionValue`, `ProductVariant`,
  `VariantOptionValue` (liaison variante↔valeur), `ProductMedia`
- **Et** `Product` porte : `ean` (nullable, unique), `inci` (texte nullable),
  `productType` (enum : `COSMETIC`, `SUPPLEMENT`, `DEVICE`, `OTHER`), `precautions`
  (texte nullable), `slug` (unique), `active`
- **Et** `ProductVariant` porte : `sku` (unique), `priceExclTax` (Int, centimes),
  `volume` (texte nullable, ex. « 100 ml »), `stock` (Int)

### Scénario 2 : Variantes multi-axes

- **Étant donné** un produit avec une option « Contenance » (valeurs 50 ml, 100 ml)
- **Quand** on crée une variante associée à la valeur « 100 ml »
- **Alors** la liaison `VariantOptionValue` relie la variante à la bonne valeur d'option
- **Et** un produit peut avoir 0..N options et 1..N variantes

### Scénario 3 : Médias ordonnés (clés S3)

- **Étant donné** un produit
- **Quand** on lui attache des médias
- **Alors** chaque `ProductMedia` stocke `storageKey` (clé objet S3/MinIO), `alt`,
  `position` (Int) — **aucun binaire en base**
- **Et** les médias sont restituables triés par `position`

### Scénario 4 : Accès exclusivement via Repository

- **Étant donné** les modules consommateurs
- **Quand** ils accèdent au catalogue
- **Alors** ils passent par des repositories de `core` (produit, catégorie, marque)
- **Et** aucune entité catalogue ne porte de `tenant_id` (modèle Silo)

### Scénario 5 : Intégrité référentielle

- **Étant donné** un produit avec variantes et médias
- **Quand** le produit est supprimé
- **Alors** ses variantes, liaisons d'options et médias sont supprimés en cascade
- **Et** supprimer une catégorie ayant des enfants ou des produits est refusé (ou
  re-parenté) — comportement à acter en story 04

## Non-objectifs

- Calcul TVA/TTC (→ `pricing`), facettes (→ `search`), stock avancé (→ `inventory`).
- UI d'administration et d'affichage (stories 03-06).
- Upload réel des fichiers (story 03) : ici seulement le modèle `storageKey`.

## Contraintes

- Prisma + PostgreSQL ; prix en **centimes (Int)**.
- Repositories dans `packages/core/src/modules/catalog` + `…/repositories`.
- `slug`, `ean`, `sku` **uniques** ; index sur `categoryId`, `brandId`, `productId`.
- Tests Vitest sur les repositories (CRUD + cascade + arbre de catégories).

## Questions ouvertes

- 🚧 Génération du `slug` : auto depuis le nom (avec dédoublonnage) ou saisi en admin ?
  Hypothèse : auto-généré, surchageable en admin (à confirmer story 03).
- 🚧 Faut-il un modèle `Media` réutilisable hors produit (CMS) dès maintenant ?
  Hypothèse : non, `ProductMedia` dédié pour l'instant.
