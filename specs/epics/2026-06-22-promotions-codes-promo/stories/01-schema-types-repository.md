# Story 01 : Schéma Prisma, types & repository

**Date** 2026-06-22 · **Statut** 🟡 · **Estimation** S
**Epic parent** : [Catalog Price Rules](../epic.md)

## Contexte

Le module `promotions` est un stub vide. On pose les fondations : modèle Prisma, types TypeScript, repository pour le CRUD des Catalog Price Rules.

## User Story

**En tant qu'** équipe de développement, **je veux** un schéma de données et un repository pour les Catalog Price Rules, **afin de** pouvoir stocker, lire et manipuler les règles de prix catalogue.

## Critères d'acceptation

### Scénario 1 : Migration Prisma

- **Étant donné** le schéma Prisma actuel sans table de promotions
- **Quand** on exécute `db:migrate`
- **Alors** une table `CatalogPriceRule` est créée avec les colonnes : `id` (cuid), `name`, `active`, `startDate`, `endDate`, `priority`, `targetType` (enum), `discountType` (enum), `discountValue`, `floorPrice`, `customerLabel`, `showStrikethrough`, `createdAt`, `updatedAt`

### Scénario 2 : Table de liaison pour les cibles

- **Étant donné** une règle de type `CATEGORY`, `PRODUCT` ou `BRAND`
- **Quand** on crée la règle avec des targetIds
- **Alors** les associations sont stockées dans une table de liaison `CatalogPriceRuleTarget` (ruleId + targetId + targetType)

### Scénario 3 : Types TypeScript

- **Étant donné** le module promotions
- **Quand** on importe les types depuis `@pharmacie/core`
- **Alors** les types `CatalogPriceRule`, `CreateCatalogPriceRuleInput`, `UpdateCatalogPriceRuleInput`, `DiscountType`, `TargetType` sont disponibles

### Scénario 4 : Repository CRUD

- **Étant donné** le repository `catalogPriceRuleRepository`
- **Quand** on appelle `create`, `findById`, `findMany`, `update`, `delete`
- **Alors** les opérations fonctionnent et retournent les données attendues avec les targets incluses

### Scénario 5 : Requête des règles actives par produit

- **Étant donné** un produit avec une catégorie et une marque
- **Quand** on appelle `findActiveForProduct(productId, categoryId, brandId)`
- **Alors** le repository retourne les règles actives dont le ciblage matche (ALL, ou categoryId dans targets, ou productId dans targets, ou brandId dans targets) et dont les dates sont valides, triées par priorité décroissante

## Non-objectifs

- Logique de calcul de la réduction (story 02)
- UI admin (story 04)
- Seed de données de test (hors migration)

## Contraintes

- Enums Prisma pour `TargetType` (`ALL`, `CATEGORY`, `PRODUCT`, `BRAND`) et `DiscountType` (`PERCENTAGE`, `FIXED_AMOUNT`)
- `discountValue` : Int (basis points pour %, centimes pour fixe)
- `floorPrice` : Int nullable (centimes HT)
- `priority` : Int, défaut 0
- Index sur `active` + `startDate` + `endDate` pour la requête de résolution
