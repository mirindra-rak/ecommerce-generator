# Epic : Cart — Panier d'achat (lot 4.4)

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation globale** : L (~4-6 jours)

## Contexte & vision

Le storefront affiche déjà des boutons « Ajouter au panier » (fiche produit, carte
produit) et un compteur panier dans le header, mais tout est inerte. Le module `cart`
dans `packages/core` est un stub qui réexporte `PriceBreakdown` de `pricing`.

Cet epic construit le **panier d'achat** complet :

- un **modèle de données** `Cart` + `CartItem` en base (Prisma) ;
- un **service de domaine** avec ajout, suppression, modification de quantité, calcul
  des totaux via le noyau `pricing`, et vérification de disponibilité via `inventory` ;
- une **persistance par session** : panier anonyme (cookie de session) et panier
  connecté (lié au `User`), avec fusion à la connexion ;
- le **storefront** : page panier, boutons « ajouter au panier » fonctionnels,
  compteur dynamique dans le header.

## Objectifs

- Introduire les modèles Prisma `Cart` et `CartItem` avec les relations nécessaires.
- Construire le repository et le service de domaine `cart` dans `packages/core` :
  - `addItem(cartId, variantId, qty)` — avec contrôle `isAvailable` (inventory)
  - `updateItemQty(cartId, variantId, qty)` — avec contrôle stock
  - `removeItem(cartId, variantId)`
  - `getCart(cartId)` — retourne le panier avec lignes enrichies (produit, variant,
    `PriceBreakdown` par ligne, totaux)
  - `clearCart(cartId)`
- Gérer l'**identité du panier** : panier anonyme lié à un token de session (cookie),
  panier connecté lié à un `userId`. Fusion du panier anonyme dans le panier connecté
  à la connexion.
- Figer le `PriceBreakdown` par ligne de panier (snapshot du prix au moment de
  l'ajout), recalculable à la demande.
- Câbler le **storefront** : page `/panier`, boutons « ajouter au panier » sur les
  cartes et fiches produit, compteur dans le header, feedback utilisateur.

## Non-objectifs

- **Checkout / commande** : module `order` séparé.
- **Codes promo / remises** : module `promotions` séparé.
- **Panier persisté en localStorage** : tout est en base, pas de mode offline.
- **Réservation de stock** (lock pendant X minutes) : hors scope V1.
- **Panier multi-adresse / multi-livraison**.
- **Prix barré / comparaison dans le panier**.

## Parcours global

1. **Visiteur** parcourt le catalogue, clique « Ajouter au panier » sur une fiche
   produit → un panier anonyme est créé (cookie), la ligne est ajoutée, le compteur
   header se met à jour.
2. **Visiteur** ouvre la page `/panier` → voit ses lignes (produit, variante, quantité,
   prix TTC unitaire, sous-total), peut modifier les quantités ou supprimer une ligne.
   Les totaux HT / TVA / TTC sont affichés en bas.
3. **Visiteur** se connecte → son panier anonyme est fusionné dans son panier
   connecté (les lignes s'additionnent si même variant, sinon ajoutées).
4. **Visiteur** tente d'ajouter un produit en rupture → message d'erreur, la ligne
   n'est pas ajoutée (contrôle `isAvailable` de `inventory`).

## Stories

| #   | Titre                                                 | Priorité | Est. | Dépend de |
| --- | ----------------------------------------------------- | -------- | ---- | --------- |
| 01  | Schéma Prisma — modèles Cart + CartItem               | P0       | S    | —         |
| 02  | Repository & service de domaine cart                  | P0       | L    | 01        |
| 03  | Gestion de session panier (cookie anonyme + fusion)   | P0       | M    | 02        |
| 04  | Storefront — boutons « ajouter au panier » + compteur | P1       | M    | 02, 03    |
| 05  | Storefront — page panier (lignes, quantités, totaux)  | P1       | M    | 02, 03    |

## Contraintes

- **Repository pattern** : tout accès données via `cartRepository`.
- **Montants en centimes** : les prix sont stockés et calculés en entiers.
- **PriceBreakdown figé** : chaque `CartItem` stocke le snapshot HT/TVA/TTC au moment
  de l'ajout. Le service peut recalculer à la demande (prix produit changé).
- **Contrôle inventory** : `addItem` et `updateItemQty` appellent `isAvailable()` du
  module `inventory` avant d'accepter la modification.
- **Cookie de session** : un token anonyme identifie le panier tant que le visiteur
  n'est pas connecté. Le cookie est `HttpOnly`, `SameSite=Lax`, durée 30 jours.
- **Silo** : aucun `tenant_id`, un panier = une base = une pharmacie.
- **i18n** : les labels panier suivent la convention `next-intl` existante (FR + EN).
- **SEO** : la page panier est `noindex` (pas de contenu indexable).

## Jalons

1. **M1 — Core** (stories 01-02) : le moteur cart est fonctionnel, testable.
2. **M2 — Session** (story 03) : le panier survit entre les pages et gère la fusion
   anonyme → connecté.
3. **M3 — UI** (stories 04-05) : le storefront est câblé, le panier est utilisable.

## Références

- Module cart stub : `packages/core/src/modules/cart/index.ts`
- Noyau pricing : `packages/core/src/modules/pricing/pricing.service.ts`
- Module inventory : `packages/core/src/modules/inventory/inventory.service.ts`
- Boutons « ajouter au panier » (inertes) : `apps/pharmacie-1/src/app/[locale]/(storefront)/produit/[slug]/page.tsx`, `_components/product-card.tsx`
- Compteur panier (hardcodé) : `_components/site-header.tsx`
- Session Better Auth : `apps/pharmacie-1/src/lib/auth.ts`
