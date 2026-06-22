# Epic : Pricing — Prix, TVA & affichage TTC (lot 4.2)

**Date** : 2026-06-19 · **Statut** 🟢 · **Estimation globale** : M/L (~4-6 jours)

## Contexte & vision

Le projet stocke déjà des **prix HT en centimes** sur les déclinaisons et un taux de
TVA au niveau produit, mais sans **noyau métier de pricing** ni **référentiel fiscal**
dédié. Le résultat est fragile : le storefront affiche encore du HT, le back-office ne
pilote pas explicitement les règles de TVA, et les futurs modules `cart`, `order`,
`promotions` et `returns` n'ont pas encore de contrat métier commun pour manipuler les
montants.

Cet epic pose le **socle pricing** de l'application :

- un **module de domaine `pricing`** pour calculer HT / TVA / TTC ;
- un **référentiel `TaxRate`** seedé et réutilisable ;
- un **rattachement explicite des produits** à une règle de TVA ;
- un **affichage TTC cohérent** côté storefront ;
- une **base stable** pour les totaux panier / commande à venir.

Contrainte structurante : modèle **Silo** (1 base = 1 pharmacie, aucun `tenant_id`) et
**Repository pattern** obligatoire (`packages/core/src/modules/pricing`).

## Objectifs

- Introduire un **référentiel de taux de TVA** (`TaxRate`) plutôt qu'un entier isolé
  disséminé dans le domaine produit.
- Construire un **noyau pricing déterministe** :
  - calcul du montant de TVA ;
  - calcul du TTC ;
  - règles d'arrondi centralisées ;
  - validation des taux supportés.
- Relier chaque **produit** à une règle de TVA explicite et seedée.
- Exposer dans le **back-office produit** le choix du taux de TVA via une source de
  vérité centralisée.
- Afficher des **prix TTC** côté storefront (listing + fiche produit), avec la logique
  métier située dans `core`, pas dans les composants.
- Préparer un contrat réutilisable pour les futurs modules `cart`, `order`,
  `promotions`, `payment`, `returns`.

## Non-objectifs

- **Codes promo, remises, prix barrés, campagnes commerciales** → module `promotions`
  (lot 4.6).
- **Totaux panier / checkout / commande** → modules `cart` et `order`.
- **Facturation / avoirs PDF** → lot 4.12 / 4.8.
- **Moteur fiscal international avancé** (règles cross-border, exonérations complexes,
  versioning réglementaire fin, calcul par adresse de livraison).
- **Multi-devise** : le projet reste en euro, en centimes.
- **Tarification B2B / HT visible pour le client** : l'expérience storefront visée ici
  est B2C, donc TTC.

## Parcours global

1. **Admin** crée ou édite un produit, choisit son **taux de TVA** depuis une liste
   contrôlée issue du référentiel `TaxRate`.
2. Le **domaine pricing** calcule un breakdown monétaire fiable à partir du prix HT de
   la déclinaison et du taux de TVA associé au produit.
3. Le **storefront** consomme ce breakdown et affiche un **prix TTC** cohérent sur les
   cartes produit et la fiche produit.
4. Les futurs modules transactionnels réutiliseront le même contrat métier pour figer
   les montants en panier, commande, facture et remboursement.

## Stories

| #   | Titre                                                 | Priorité | Est. | Dépend de |
| --- | ----------------------------------------------------- | -------- | ---- | --------- |
| 01  | Référentiel TVA — schéma Prisma, seed & migration     | P0       | S    | —         |
| 02  | Noyau `pricing` — calcul HT / TVA / TTC + tests       | P0       | S    | 01        |
| 03  | Intégration produit — rattachement `TaxRate`          | P0       | M    | 01, 02    |
| 04  | Back-office produit — choix du taux de TVA            | P1       | S    | 03        |
| 05  | Storefront — affichage TTC listing + fiche produit    | P1       | S    | 02, 03    |
| 06  | Préparation des contrats transactionnels (cart/order) | P2       | M    | 02, 03    |

## Contraintes

- **Repository pattern** : l'accès au référentiel TVA passe par un repository dédié ;
  aucun appel Prisma direct hors repository.
- **Monnaie** : tous les montants métier sont stockés et calculés en **entiers**
  (centimes), jamais en flottants comme source de vérité.
- **TVA** : le taux est porté en **basis points** (`2000 = 20 %`, `550 = 5,5 %`).
- **Arrondi** : la règle d'arrondi doit être **unique, documentée et centralisée**
  dans `pricing`, réutilisée partout.
- **Silo** : aucun modèle multi-tenant ou règle fiscale mutualisée entre bases.
- **Back-office** : l'administration est déjà internationalisée via `next-intl` ; les
  libellés pricing doivent suivre la même convention.
- **Storefront** : la logique de calcul ne doit pas vivre dans les composants React,
  uniquement dans `core` / la couche d'accès données.

## Jalons

1. **M1 — Référentiel + noyau** : stories 01 + 02 → le domaine sait calculer des
   montants fiables à partir d'une règle fiscale explicite.
2. **M2 — Produit + admin** : stories 03 + 04 → le back-office pilote enfin la TVA
   via une source de vérité dédiée.
3. **M3 — Storefront TTC** : story 05 → le catalogue client affiche des prix TTC
   cohérents.
4. **M4 — Contrat transactionnel** : story 06 → les futurs modules panier / commande
   peuvent consommer le breakdown sans redéfinir la logique de calcul.

## Références

- Schéma actuel : `packages/core/prisma/schema.prisma`
- Données seedées : `packages/core/prisma/seed.ts` et `packages/core/prisma/seed-data/catalog.json`
- Produit / catalogue : `packages/core/src/modules/catalog/*`
- Couche storefront : `apps/pharmacie-1/src/lib/catalog.ts`
- Back-office produit : `apps/pharmacie-1/src/app/admin/(protected)/produits/*`
