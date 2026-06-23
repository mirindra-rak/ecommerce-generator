# Story : Schéma Prisma — modèles Cart + CartItem

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : S (~0.5 jour)
**Epic parent** : [Cart](../epic.md)

## Contexte

Le panier n'a pas de modèle en base. On crée les tables `Cart` et `CartItem` avec les
relations vers `User`, `ProductVariant` et le snapshot de prix.

## User Story

**En tant que** développeur,
**je veux** un schéma Prisma pour le panier et ses lignes,
**afin de** persister les paniers anonymes et connectés avec leurs prix figés.

## Critères d'acceptation

### Scénario 1 : Modèle Cart

- **Étant donné** le schéma Prisma
- **Alors** le modèle `Cart` possède : `id` (cuid), `sessionToken` (string?, unique),
  `userId` (string?, FK User), `createdAt`, `updatedAt`
- **Et** un cart a soit un `sessionToken` (anonyme), soit un `userId` (connecté),
  soit les deux (transition)

### Scénario 2 : Modèle CartItem

- **Étant donné** le schéma Prisma
- **Alors** le modèle `CartItem` possède : `id` (cuid), `cartId` (FK Cart),
  `variantId` (FK ProductVariant), `quantity` (Int), `priceExclTax` (Int, centimes),
  `taxRateBps` (Int), `priceInclTax` (Int, centimes), `createdAt`, `updatedAt`
- **Et** une contrainte d'unicité `(cartId, variantId)` empêche les doublons

### Scénario 3 : Migration

- **Quand** on lance `pnpm --filter @pharmacie/core db:migrate`
- **Alors** la migration s'applique sans erreur sur la base de dev

## Non-objectifs

- Pas de seed de paniers de test.
- Pas de logique métier (story 02).

## Contraintes

- Convention cuid pour les id, cohérent avec le reste du schema.
- Les montants sont en centimes (Int), jamais en float.
- `taxRateBps` stocké sur la ligne = snapshot du taux au moment de l'ajout.
