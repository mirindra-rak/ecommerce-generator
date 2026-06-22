# Epic : Catalog Price Rules (Promotions catalogue)

**Date** 2026-06-22 · **Statut** 🟡 Draft · **Estimation** M (3-5 jours dev)

## Contexte & Vision

La pharmacie en ligne dispose d'un catalogue complet (produits, catégories, marques, facettes), d'un moteur de prix TTC (TVA en basis points) et d'un panier fonctionnel. Il manque la brique promotionnelle pour afficher des prix réduits sur le catalogue : prix barrés sur le listing et la fiche produit, promos saisonnières, offres par catégorie ou marque.

L'objectif est de livrer un **moteur de Catalog Price Rules** : l'admin crée des règles de réduction, le storefront affiche automatiquement le prix barré et le prix réduit sur les produits éligibles.

## Objectifs

- Permettre à l'admin de créer des règles de prix catalogue avec ciblage (tout le catalogue, catégorie(s), produit(s), marque(s))
- Supporter deux types de réduction : pourcentage et montant fixe (centimes)
- Afficher le prix barré et le prix réduit sur le listing et la fiche produit
- Respecter les dates de validité et la priorité entre règles
- Protéger les marges avec un prix plancher optionnel

## Non-objectifs

- **Cart Price Rules / codes promo** — V2 (epic séparé)
- Cumul de plusieurs règles sur un même produit (V1 = la règle de plus haute priorité gagne)
- Conditions combinées (AND/OR complexes entre catégorie + marque + attribut)
- Segments clients (prix différents selon le profil)
- Promotions BOGO / bundle / quantité minimum
- Notifications / emails automatiques sur les promos

## Inputs d'une Catalog Price Rule

| Champ             | Type     | Obligatoire  | Notes                                                      |
| ----------------- | -------- | ------------ | ---------------------------------------------------------- |
| name              | string   | ✅           | Nom interne (admin)                                        |
| active            | boolean  | ✅           | Défaut `true`                                              |
| startDate         | datetime | ❌           | Null = immédiat                                            |
| endDate           | datetime | ❌           | Null = pas d'expiration                                    |
| priority          | int      | ✅           | Plus élevé = prioritaire. Défaut 0                         |
| targetType        | enum     | ✅           | `ALL` · `CATEGORY` · `PRODUCT` · `BRAND`                   |
| targetIds         | string[] | selon target | IDs des catégories/produits/marques ciblés (vide si `ALL`) |
| discountType      | enum     | ✅           | `PERCENTAGE` · `FIXED_AMOUNT`                              |
| discountValue     | int      | ✅           | Pourcentage (0-10000 bps) ou montant fixe (centimes HT)    |
| floorPrice        | int      | ❌           | Prix plancher HT en centimes (ne pas descendre en dessous) |
| customerLabel     | string   | ❌           | Label affiché côté storefront (ex: "Promo été")            |
| showStrikethrough | boolean  | ✅           | Afficher le prix barré. Défaut `true`                      |

## Parcours global

### Admin

1. L'admin accède à la section Promotions dans le back-office
2. Il crée une règle : nom, type/valeur de réduction, ciblage, dates, priorité
3. Il peut activer/désactiver, modifier, supprimer une règle
4. Il voit la liste des règles avec leur statut (active, planifiée, expirée)

### Storefront

1. Le moteur résout le prix affiché de chaque produit : prix original vs prix après règle applicable
2. Sur le listing et la fiche produit, si une règle s'applique : prix barré + prix réduit + label optionnel
3. Les structured data (SEO) reflètent le prix réduit et l'offre

## Stories

| #   | Titre                                                       | Priorité | Estimation | Dépend de |
| --- | ----------------------------------------------------------- | -------- | ---------- | --------- |
| 01  | Schéma Prisma, types & repository                           | P0       | S          | —         |
| 02  | Service de domaine — résolution du prix catalogue           | P0       | M          | 01        |
| 03  | Intégration storefront — prix barré listing & fiche produit | P0       | M          | 02        |
| 04  | Admin CRUD Catalog Price Rules                              | P1       | M          | 01        |
| 05  | SEO — structured data prix réduit                           | P2       | S          | 03        |

## Contraintes

- **Monnaie en centimes entiers** (Int), pourcentages en basis points (0-10000), cohérent avec le pricing existant
- **Réduction appliquée sur HT** : la TVA est recalculée après remise via `calculatePriceBreakdown`
- **Une seule règle par produit** en V1 : la plus prioritaire gagne (pas de cumul)
- **Repository pattern** obligatoire
- **Architecture Silo** : pas de tenant_id
- **Performance** : la résolution de prix ne doit pas faire 1 requête par produit sur le listing (batch ou cache)

## Jalons

1. **Fondation** (stories 01-02) : schéma + moteur de résolution testés unitairement
2. **Visible** (story 03) : prix barrés affichés sur le storefront
3. **Gérable** (story 04) : l'admin peut créer et gérer les règles
4. **SEO** (story 05) : structured data à jour
