# Story : Seed catalogue réel (laparaducoin) + enrichissement modèle Product

**Date** 2026-06-12 · **Statut** 🟡 · **Estimation** L

## Contexte

Le seed actuel est un jeu de démonstration écrit à la main (6 univers, 8 produits). On
veut un catalogue **réaliste** issu du projet voisin `laparaducoin` (export PrestaShop :
`data/categories-prestashop.json`, `data/catalogue-prestashop.json`). L'audit d'adéquation
a révélé des champs source sans équivalent dans `Product` (TVA, SEO, description courte,
identifiant d'origine). On enrichit donc le modèle **puis** on importe un échantillon curé.

## User Story

**En tant que** développeur du projet,
**je veux** un seed alimenté par un catalogue réel et un modèle Produit fidèle à la source,
**afin de** travailler le storefront (listings, fiches, filtres, TTC) sur des données crédibles.

## Critères d'acceptation

### Scénario 1 : Enrichissement du modèle Product

- **Étant donné** le schéma Prisma actuel
- **Quand** la migration est appliquée
- **Alors** `Product` porte `vatRate Int` (TVA en points de base, ex. 550 = 5,5 %),
  `metaTitle String?`, `metaDescription String?`, `shortDescription String?`,
  `externalId Int?`
- **Et** `Brand` et `Category` portent aussi `externalId Int?` (unique), pour le ré-import
- **Et** `db:generate` + `type-check` passent (client régénéré, code existant non cassé)

### Scénario 2 : Génération du dataset curé

- **Étant donné** les exports laparaducoin présents dans `../laparaducoin/data/`
- **Quand** on exécute le script de génération
- **Alors** un fichier **committé** `packages/core/prisma/seed-data/catalog.json` est produit,
  contenant `{ categories, brands, products }` sérialisables et **autonomes** (le seed
  n'a plus besoin du repo laparaducoin ensuite)
- **Et** `categories` = univers (niveau 2) + sous-catégories (niveau 3) **actifs**, en
  excluant les catégories utilitaires (« Racine », « Accueil », « Produits en attente »,
  « PRODUITS VEDETTES », « NOUVEAUX PRODUITS », « MEILLEURES VENTES »)
- **Et** chaque catégorie/marque/produit conserve son `externalId` (id PrestaShop)
- **Et** `brands` = `manufacturer_name` dédupliqués (slug unique)
- **Et** `products` ≈ 100, **actifs**, répartis sur les univers, chacun avec : `name`,
  `slug` unique, `description`, `shortDescription`, `metaTitle`, `metaDescription`,
  `vatRate`, `brand` (référence), `category` (référence), et **une** variante
  (`sku` = `reference` avec fallback `LPC-<id>`, `ean` si présent sinon absent,
  `priceExclTax` = `price` × 100 arrondi en centimes)

### Scénario 3 : Rattachement des catégories profondes

- **Étant donné** un produit dont `id_category_default` pointe vers une catégorie de
  niveau 4 ou 5 (non seedée)
- **Quand** le dataset est généré
- **Alors** le produit est rattaché à l'ancêtre **seedé le plus proche** (sous-catégorie
  niveau 3, sinon univers niveau 2)
- **Et** aucun produit du dataset ne référence une catégorie absente du dataset

### Scénario 4 : Seed idempotent depuis le dataset

- **Étant donné** `catalog.json` committé
- **Quand** on lance `pnpm --filter @pharmacie/core db:seed`
- **Alors** `seed.ts` lit le JSON (plus de listes catalogue codées en dur) et recrée
  catégories (arbre parent→enfant), marques et produits + variantes
- **Et** relancer le seed redonne le même état (purge puis recréation, comme aujourd'hui)
- **Et** le mega menu affiche les univers réels et leurs sous-catégories

### Scénario 5 : Intégrité des données importées

- **Étant donné** le dataset généré
- **Quand** le seed s'exécute
- **Alors** aucun `sku` ni `ean` en double (contraintes `@unique` respectées)
- **Et** tout `priceExclTax` est un entier > 0
- **Et** tout `vatRate` ∈ {210, 550, 1000, 2000} (points de base des taux FR : 2,1 % / 5,5 % / 10 % / 20 %)

## Non-objectifs

- **Images produit** : `id_default_image` non mappé vers `storageKey` → aucun média seedé.
- **Variantes/options réelles** : la source est plate (1 produit = 1 prix) → 1 variante.
- **Facettes/filtres** sur les produits importés : pas de liaison `ProductFacetValue`
  générée (les facettes de démo restent, sans rattachement). 🚧 à affiner plus tard.
- **Module `pricing`** : on stocke `vatRate` ; le calcul HT→TTC reste hors scope ici.
- **Catalogue complet** (~7200) : on se limite à ~100 produits pour démarrer.
- **Synchronisation continue** avec laparaducoin : `externalId` prépare le ré-import,
  mais aucun mécanisme de sync n'est livré.

## Contraintes

- Stack : Prisma + PostgreSQL, TypeScript strict (`any` interdit), monorepo pnpm.
- Monnaie : **entiers en centimes**, jamais de flottant ; TVA en **points de base** (Int).
- Repository pattern : le seed peut utiliser Prisma directement (script d'amorçage), mais
  le code applicatif passe toujours par les repositories.
- Modèle **Silo** : aucune notion de tenant.
- Le dataset curé est **committé** et léger ; les exports laparaducoin bruts ne le sont pas.
- Script de génération exécutable hors CI (lit un chemin relatif vers `../laparaducoin`).

## Questions ouvertes

- 🚧 **Sélection des ~100 produits** : répartition proportionnelle par univers + tri stable
  (ex. par `externalId`) pour un dataset déterministe. Hypothèse retenue : N par univers
  proportionnel au catalogue, en ne gardant que les produits actifs, avec marque, prix > 0
  et catégorie rattachable.
- 🚧 **`productType`** : déduit de l'univers (BEAUTÉ/HYGIÈNE → COSMETIC ; SANTÉ → DEVICE ;
  NATUREL & BIO → SUPPLEMENT ; sinon OTHER). À confirmer ; `attributes` reste `{}`.
- 🚧 **`vatRate` requis ou nullable** : la source le fournit pour tous les produits →
  hypothèse `Int` requis avec défaut `2000` (20 %) pour le code existant/non importé.
- 🚧 **Stock initial** des variantes (absent de la source) : valeur fixe par défaut
  (ex. 30) ou nulle. Hypothèse : valeur fixe pour des listings non vides.
- 🚧 **`description` HTML** : conservée telle quelle (rendu échappé côté storefront,
  cohérent avec le traitement des descriptions de catégorie).

## Références

- Sources : `../laparaducoin/data/categories-prestashop.json`,
  `../laparaducoin/data/catalogue-prestashop.json` (clé `products`)
- Cible : `packages/core/prisma/schema.prisma`, `packages/core/prisma/seed.ts`,
  nouveau `packages/core/prisma/seed-data/catalog.json` (+ script de génération)
- Audit d'adéquation : conversation du 2026-06-12 (4 taux TVA, champs SEO/short manquants)
