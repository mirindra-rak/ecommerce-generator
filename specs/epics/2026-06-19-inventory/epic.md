# Epic : Inventory — Stock & disponibilité (lot 4.3)

**Date** : 2026-06-19 · **Statut** 🟡 · **Estimation globale** : L (~4-6 jours)

## Contexte & vision

Le module `inventory` gère le **stock physique, sa traçabilité et les règles de
disponibilité** pour le moteur e-commerce multi-vertical. Aujourd'hui le stock est
un simple entier (`ProductVariant.stock`) sans historique, sans alertes ni règles
de rupture. On construit ici un vrai service d'inventaire avec :

- **Mouvements de stock audités** (qui, quand, combien, pourquoi) ;
- **Champs de gestion** standards (quantité min. de commande, emplacement physique) ;
- **Alertes de stock faible** (seuil par variant, notification email) ;
- **Politique de rupture configurable** (refuser / accepter / défaut site).

Le module doit rester **généraliste** : pharmacie, alimentaire, mode, B2B — tout
vertical qui gère du stock physique.

Contrainte structurante : modèle **Silo** (1 base = 1 pharmacie, aucun `tenant_id`)
et **Repository pattern** obligatoire (`packages/core/src/modules/inventory`).

## Objectifs

- Enrichir `ProductVariant` avec les champs d'inventaire (quantité min. commande,
  emplacement, seuil alerte, comportement rupture).
- Introduire un modèle `StockMovement` pour tracer chaque variation de stock
  (ajustement manuel, réception, vente, annulation…).
- Construire le repository et le service de domaine `inventory` avec des opérations
  **relatives** (adjust +/- N) plutôt que des SET absolus.
- Fournir un contrôle de disponibilité (`isAvailable(variantId, qty)`) utilisable
  par le futur module `cart`.
- Offrir dans l'admin une **vue stock dédiée** (onglet « Stocks » dans le formulaire
  produit) avec ajustement par variant, historique des mouvements, et configuration
  des alertes/rupture.
- Déclencher une notification (email) quand le stock passe sous le seuil d'alerte.

## Non-objectifs

- **Multi-entrepôt / multi-localisation** : le stock est mono-site. Le champ
  « emplacement » est un texte libre (rayon, étagère), pas un entrepôt modélisé.
- **Réservation / allocation temps réel** (stock réservé pendant le panier) →
  sera traité avec le module `cart` / `order`.
- **Import/export CSV de stock en masse** → lot ultérieur.
- **Synchronisation ERP / flux externe** → lot ultérieur.
- **Gestion de lots / dates d'expiration** → lot ultérieur (pertinent pour pharma
  et alimentaire, mais hors scope MVP).

## Parcours global

1. **Admin** ouvre un produit, onglet « Stocks ». Il voit le stock actuel de chaque
   variant et peut l'ajuster via un champ relatif (+/-). Chaque ajustement crée un
   `StockMovement` avec motif et horodatage.
2. **Admin** configure par variant : quantité min. de commande, emplacement,
   seuil d'alerte stock faible, comportement en rupture.
3. **Système** : quand un ajustement fait passer le stock sous le seuil, une alerte
   email est envoyée (si activée pour ce variant).
4. **Storefront / Cart** (consommateur futur) : appelle `isAvailable()` pour
   vérifier la disponibilité avant ajout au panier, en tenant compte de la politique
   de rupture du variant.

## Stories

| #   | Titre                                                   | Priorité | Est. | Dépend de |
| --- | ------------------------------------------------------- | -------- | ---- | --------- |
| 01  | Schéma Prisma — champs inventory + modèle StockMovement | P0       | S    | —         |
| 02  | Repository & service de domaine inventory               | P0       | M    | 01        |
| 03  | Admin — onglet Stocks (ajustement, config, historique)  | P1       | L    | 01, 02    |
| 04  | Alertes stock faible (email)                            | P2       | S    | 02        |

## Contraintes

- **Repository pattern** : aucun appel Prisma direct hors du repository.
- **Mouvements relatifs** : le service expose `adjust(variantId, delta, reason)`,
  jamais un setter absolu du stock.
- **Enum `OutOfStockBehavior`** (`DENY | ALLOW | DEFAULT`) stocké en base.
- **Audit** : chaque `StockMovement` est immutable (pas d'UPDATE/DELETE).
- **i18n** : l'admin est déjà multilingue (next-intl) — les labels inventory
  doivent suivre la même convention (`messages/fr.json`, `messages/en.json`).
- **SEO / perf** : pas d'impact storefront direct dans cet epic (le storefront
  consomme `isAvailable()` ; le rendu reste côté `catalog`).

## Jalons

1. **Schema + core** (stories 01-02) : le moteur inventory est fonctionnel en
   back-end, testable unitairement.
2. **Admin UI** (story 03) : l'opérateur peut gérer ses stocks depuis le back-office.
3. **Alertes** (story 04) : notification proactive de stock faible.

## Références

- Écran de référence : gestion stock PrestaShop (capture d'écran fournie par l'utilisateur).
