# Epic : Catalogue (lot 4.1)

**Date** : 2026-06-11 · **Statut** 🟡 · **Estimation globale** : L (~plusieurs jours)

## Contexte & vision

Le catalogue est la fondation du moteur e-commerce : il modélise et expose les
**produits de parapharmacie** (cosmétiques, santé, bien-être, compléments). Il
alimente tous les modules en aval (panier, recherche, promotions, commande). On
construit ici le **modèle de données**, les **repositories**, la **logique de
domaine**, l'**administration** (back-office) et l'**affichage storefront** (listing

- fiche produit).

Contrainte structurante : modèle **Silo** (1 base = 1 pharmacie, **aucun `tenant_id`**)
et **Repository pattern** obligatoire (`packages/core/src/modules/catalog`).

## Objectifs

- Modéliser produits, **variantes multi-axes** (ex. Contenance, Teinte), catégories
  (arborescence), marques et médias.
- Porter les **attributs parapharmacie** : EAN/code-barres, contenance, composition
  (INCI), type de produit (cosmétique / complément / dispositif…), précautions d'emploi.
- Stocker les médias en **objet compatible S3 (MinIO auto-hébergé)** ; la base ne
  conserve que clés/URLs + métadonnées (alt, ordre).
- Offrir au back-office un CRUD complet (produits/variantes/médias, catégories/marques).
- Exposer au storefront un **listing de catégorie** et une **fiche produit**.

## Non-objectifs

- **Recherche, filtres & facettes** → module `search` (lot 4.4). Le listing ici se
  limite à un tri + pagination simples.
- **Prix & TVA détaillés** (calcul TTC, règles FR) → module `pricing` (lot 4.2). Le
  catalogue stocke le **prix HT en centimes** sur la variante, sans logique de taxe.
- **Stock temps réel / réservations** → module `inventory` (lot 4.3). On expose un
  champ `stock` brut, sans logique de disponibilité avancée.
- **Avis produits** → module `reviews` (lot 4.13).
- **Migration des données PrestaShop** → lot 10 (le modèle doit toutefois rester
  importable : c'est pourquoi l'EAN est prévu).
- **Upload UI riche / retouche d'image** : la story admin couvre l'upload simple.

## Parcours global

1. **Admin** crée marques et catégories (arborescence), puis des produits avec leurs
   variantes, attributs réglementaires et médias.
2. Le **storefront** liste les produits d'une catégorie (tri + pagination), et affiche
   une **fiche produit** avec sélecteur de variantes, galerie média et informations
   réglementaires.

## Stories

| #   | Titre                                               | Priorité | Est. | Dépend de |
| --- | --------------------------------------------------- | -------- | ---- | --------- |
| 01  | Modèle de données catalogue + repositories          | P0       | M    | —         |
| 02  | Logique de domaine catalogue (services)             | P0       | S    | 01        |
| 03  | Admin — produits, variantes & médias (CRUD)         | P1       | L    | 01, 02    |
| 04  | Admin — catégories (arborescence) & marques         | P1       | M    | 01        |
| 05  | Storefront — listing de catégorie (tri, pagination) | P2       | M    | 01, 02    |
| 06  | Storefront — fiche produit (variantes, médias)      | P2       | M    | 01, 02    |

## Contraintes

- **Stack** : Next.js (App Router) + PostgreSQL + Prisma ; monorepo, `core` en TS brut.
- **Architecture** : tout accès données via Repository ; logique métier en services de
  domaine ; aucun `tenant_id`.
- **Monnaie** : prix stockés en **entiers (centimes)**, jamais en flottants.
- **SEO** : `slug` unique et stable par produit/catégorie/marque (réutilisé par les
  redirections 301 du lot 10.5).
- **Conformité** : champs réglementaires parapharmacie présents mais non bloquants
  fonctionnellement à ce stade (volet conformité = lot 9.3).

## Jalons

- **M1 — Socle données** : stories 01 + 02 (le reste du moteur peut alors démarrer).
- **M2 — Administration** : stories 03 + 04 (saisie du catalogue possible).
- **M3 — Vitrine** : stories 05 + 06 (catalogue visible côté client).

## Références

- Schéma Prisma d'amorce : `packages/core/prisma/schema.prisma`
- Décisions : `ARCHITECTURE.md` (ADR-001 Silo, ADR-003 Prisma)
- Maquettes HD à venir : lots 2.4 (listing) et 2.5 (fiche produit) — critères visuels
  à préciser à ce moment.
