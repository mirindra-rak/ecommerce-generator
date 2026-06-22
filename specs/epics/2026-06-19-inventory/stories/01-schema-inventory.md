# Story 01 : Schéma Prisma — champs inventory + modèle StockMovement

**Epic parent** : [Inventory — Stock & disponibilité](../epic.md)

**Date** : 2026-06-19 · **Statut** 🟡 · **Estimation** : S

## Contexte

Le modèle `ProductVariant` ne possède qu'un champ `stock Int @default(0)`. Pour
construire un vrai module inventory, il faut enrichir ce modèle avec les champs
de gestion (quantité min. commande, emplacement, seuil alerte, comportement
rupture) et introduire un modèle `StockMovement` pour tracer chaque variation.

## User Story

**En tant que** développeur du moteur e-commerce,
**je veux** un schéma de données inventory complet avec traçabilité des mouvements,
**afin de** pouvoir construire le service de domaine et l'admin sur des fondations solides.

## Critères d'acceptation

### Scénario 1 : Nouveaux champs sur ProductVariant

- **Étant donné** le modèle `ProductVariant` existant
- **Quand** la migration est appliquée
- **Alors** les champs suivants existent :
  - `minOrderQty Int @default(1)` — quantité minimale de commande
  - `stockLocation String?` — emplacement physique (texte libre)
  - `lowStockThreshold Int?` — seuil d'alerte stock faible (null = pas d'alerte)
  - `lowStockAlert Boolean @default(false)` — active/désactive l'alerte email
  - `outOfStockBehavior OutOfStockBehavior @default(DEFAULT)` — politique de rupture

### Scénario 2 : Enum OutOfStockBehavior

- **Étant donné** le schéma Prisma
- **Quand** l'enum est définie
- **Alors** elle contient trois valeurs : `DENY`, `ALLOW`, `DEFAULT`
- **Et** le champ `ProductVariant.outOfStockBehavior` utilise cet enum

### Scénario 3 : Modèle StockMovement

- **Étant donné** le besoin de traçabilité
- **Quand** la migration est appliquée
- **Alors** le modèle `StockMovement` existe avec :
  - `id String @id @default(cuid())`
  - `variantId String` — FK vers `ProductVariant`
  - `delta Int` — variation relative (+/-), jamais 0
  - `stockAfter Int` — snapshot du stock après mouvement
  - `reason StockMovementReason` — enum du motif
  - `note String?` — commentaire libre optionnel
  - `createdAt DateTime @default(now())`
- **Et** un index existe sur `variantId`
- **Et** un index existe sur `createdAt` (pour requêtes historiques)

### Scénario 4 : Enum StockMovementReason

- **Étant donné** le modèle `StockMovement`
- **Quand** l'enum est définie
- **Alors** elle contient au minimum : `MANUAL_ADJUSTMENT`, `RECEPTION`, `SALE`, `RETURN`, `CORRECTION`

### Scénario 5 : Migration et client Prisma

- **Étant donné** les modifications du schéma
- **Quand** on lance `pnpm --filter @pharmacie/core db:migrate`
- **Alors** la migration s'applique sans erreur sur une base existante
- **Et** `db:generate` régénère le client Prisma sans erreur

## Non-objectifs

- Aucune logique métier (repository, service) — story 02.
- Pas de modification de l'admin UI — story 03.
- Pas de seed de données de test pour le stock.

## Contraintes

- Les nouveaux champs ont des valeurs par défaut compatibles avec les données
  existantes (pas de NOT NULL sans default sur une table peuplée).
- `StockMovement` est **append-only** par conception (immutable) — pas de
  `updatedAt`, pas de soft-delete.
- Nommage en anglais dans le schéma Prisma, cohérent avec les modèles existants.
