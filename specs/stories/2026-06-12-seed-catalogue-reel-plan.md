# Plan : Seed catalogue réel (laparaducoin) + enrichissement modèle Product

**Ticket** : [2026-06-12-seed-catalogue-reel.md](2026-06-12-seed-catalogue-reel.md) · **Statut** ✅ Exécuté

## Résumé

Enrichir `Product` (TVA, SEO, description courte, `externalId`) via migration, générer un
dataset curé committé depuis les exports laparaducoin, puis faire lire ce JSON par `seed.ts`.

## Fichiers à créer ou modifier

- `packages/core/prisma/schema.prisma` — **modifié** : `Product` += `vatRate Int @default(2000)`,
  `metaTitle String?`, `metaDescription String?`, `shortDescription String?`,
  `externalId Int? @unique` ; `Brand` += `externalId Int? @unique` ; `Category` +=
  `externalId Int? @unique`.
- `packages/core/prisma/migrations/<ts>_enrich_product_seed_fields/` — **créé** (migrate dev).
- `packages/core/scripts/generate-catalog-seed.ts` — **créé** : outil one-off (tsx) qui lit
  les exports laparaducoin et écrit `seed-data/catalog.json`. Non exécuté en CI.
- `packages/core/prisma/seed-data/catalog.json` — **créé & committé** : `{ categories,
brands, products }` autonome.
- `packages/core/package.json` — **modifié** : script `db:seed:generate` (lance le générateur).
- `packages/core/prisma/seed.ts` — **modifié** : remplace les listes catalogue codées en
  dur (`BRANDS`/`CATEGORIES`/`SUBCATEGORIES`/`PRODUCTS`) par la lecture de `catalog.json`.
  Conserve la purge `TRUNCATE … CASCADE` et les `FACETS` (sans liaison produit↔facette).
- `packages/core/src/modules/catalog/seed-dataset.test.ts` — **créé** : test d'intégrité
  du JSON committé (invariants Scénarios 3 & 5).
- `tasks/AAAA-MM-JJ_HHhmm_seed-catalogue-reel.md` — **créé** : journal de tâche.

## Étapes de développement

1. **Migration d'enrichissement** — ajouter les champs au `schema.prisma`
   (`vatRate Int @default(2000)` requis ; `metaTitle`/`metaDescription`/`shortDescription`
   nullables ; `externalId Int? @unique` sur `Product`, `Brand`, `Category`). Lancer
   `pnpm --filter @pharmacie/core db:migrate --name enrich-product-seed-fields` puis
   `db:generate`. Test : `type-check` vert, migration présente, colonnes visibles (studio).

2. **Script de génération** — `scripts/generate-catalog-seed.ts` :
   - Résout les exports via chemin relatif à `__dirname` (`../../../laparaducoin/data`,
     surchargable par argv/env). 🚧 si le repo voisin est absent → message d'erreur clair.
   - Construit l'index catégories par `id` ; identifie les **univers** (level_depth 2,
     `id_parent` = 2/Accueil) en **excluant** les ids utilitaires (Racine, Accueil,
     « Produits en attente », PRODUITS VEDETTES, NOUVEAUX, MEILLEURES VENTES) ; retient
     les **sous-catégories** level_depth 3 actives. Slugs via `buildUniqueSlug`.
   - Fonction « ancêtre seedé le plus proche » : remonte `id_parent` jusqu'à un id de
     l'ensemble seedé (niveau 3 puis niveau 2) ; renvoie `null` si on retombe sur un
     univers exclu → le produit est écarté.
   - Sélection ~100 produits : actifs, avec marque, `price` > 0, catégorie rattachable ;
     répartition proportionnelle par univers ; tri **stable** par `id` (déterministe).
   - Marques : `manufacturer_name` des produits retenus, dédupliquées, slug unique.
   - Mapping produit : `vatRate` = `Math.round(source.vatRate * 10000)` (points de base :
     0,055 → 550) ; `priceExclTax` = `Math.round(parseFloat(price) * 100)` ;
     `sku` = `reference` (fallback `LPC-<id>`, et fallback si doublon) ; `ean` = `ean13`
     si non vide **et** unique, sinon omis ; `productType` déduit de l'univers ;
     `shortDescription`/`metaTitle`/`metaDescription`/`description` repris tels quels ;
     `stock` fixe (30) ; `externalId` = `id`.
   - Écrit `seed-data/catalog.json` (références internes par `externalId`).
     Test : exécuter le script → `categories`/`brands`/`products` cohérents (~100 produits,
     tous univers représentés), spot-check d'un produit.

3. **Test d'intégrité du dataset** — `seed-dataset.test.ts` importe `catalog.json` et
   vérifie : aucun `sku`/`ean` en double ; `priceExclTax` entier > 0 ; `vatRate` ∈
   {210, 550, 1000, 2000} ; tout `categoryExternalId`/`brandExternalId` existe dans le
   dataset ; tout enfant a un `parentExternalId` présent. Test : `vitest` vert.

4. **Réécriture de `seed.ts`** — importer `catalog.json` ; créer marques (avec
   `externalId`), puis catégories **univers d'abord** (map `externalId`→id) puis
   sous-catégories (connect parent par `externalId`), puis produits (connect marque +
   catégorie par `externalId`, créer la variante). Garder la purge et les `FACETS` ;
   retirer la boucle de liaison `productFacetValue` (plus de `facetValueCodes`). Ajuster
   l'objet `counts`. Test : `db:seed` s'exécute, counts ≈ attendus, mega menu affiche les
   univers réels + sous-catégories.

5. **Vérifications** — `pnpm type-check`, `pnpm lint`, `pnpm --filter @pharmacie/core test`,
   `pnpm --filter @pharmacie/core db:seed`. Test : tout vert, pas de `any`, seed OK.

6. **Journal de tâche** — créer `tasks/…_seed-catalogue-reel.md` (contexte, modifs, rollback).

## Points d'attention

- **Incohérence story Scénario 5** : les points de base corrects sont **{210, 550, 1000,
  2000}** (550 = 5,5 %, 2000 = 20 %), pas {21,55,100,200}. Le plan retient les bps ;
  corriger la story au passage.
- **Générateur non reproductible en CI** : il lit le repo voisin `laparaducoin` (absent du
  dépôt). C'est précisément pourquoi on **committe** `catalog.json` ; le script reste un
  outil dev ponctuel. Le test d'intégrité (étape 3) protège le dataset en CI.
- **Catégorie default profonde ou utilitaire** : certains produits pointent vers une
  catégorie virtuelle (PRODUITS VEDETTES…) ; la remontée d'ancêtres doit aboutir à un
  univers réel, sinon le produit est écarté (et un autre le remplace pour viser ~100).
- **Collisions de slug** : catégories homonymes sous des univers différents + produits
  homonymes → `buildUniqueSlug` (suffixe), `externalId` garde le lien stable.
- **Unicité `ean`/`sku`** : ~33 % de produits sans `ean13` (→ `null`/omis) ; références
  potentiellement dupliquées → fallback `LPC-<id>`. Le test d'intégrité verrouille.
- **`price` HT** : hypothèse confirmée que `product.price` PrestaShop est HT → centimes
  directs ; écarter `NaN`/0.
- **Taille du JSON** : descriptions HTML ⇒ poids non négligeable ; ~100 produits reste
  raisonnable à committer (quelques centaines de Ko).
- **Facettes orphelines** : on garde les `FACETS` de démo sans liaison → les filtres de
  catégorie remonteront vides pour les produits importés (cf. non-objectif). 🚧 à brancher
  plus tard (dérivation de facettes depuis la source).
- 🚧 **`productType`** : mapping univers→type à confirmer (BEAUTÉ/HYGIÈNE → COSMETIC ;
  SANTÉ → DEVICE ; NATUREL & BIO → SUPPLEMENT ; sinon OTHER).
