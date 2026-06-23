# Plan : Schema FTS — migration, index GIN, colonne tsvector

**Ticket** : [01-schema-fts](./01-schema-fts.md) · **Statut** ✅

## Résumé

Ajouter une colonne `tsvector` sur `Product`, un index GIN, et une fonction SQL de
(re)calcul du vecteur de recherche agrégé (nom, marque, SKU/EAN, descriptions, attributs
JSONB) avec poids différenciés — le tout via une migration Prisma en SQL brut.

## Fichiers à créer ou modifier

- `packages/core/prisma/migrations/<timestamp>_search_vector/migration.sql` — **créé** :
  migration SQL brut (colonne, fonction, index, backfill)
- `packages/core/prisma/schema.prisma` — **modifié** : ajout du champ
  `searchVector` (`Unsupported("tsvector")`) sur le model `Product` pour que
  `prisma db pull` / `prisma format` restent cohérents
- `packages/core/src/modules/search/index.ts` — **modifié** : remplacer l'export vide
  par le barrel du module (réexporte le futur repository/service — préparation story 02)
- `packages/core/src/modules/search/search.repository.ts` — **créé** : expose
  uniquement `refreshSearchVector(productId)` pour cette story (le query/rank arrive en
  story 02)
- `packages/core/src/modules/catalog/product.service.ts` — **modifié** : appeler
  `refreshSearchVector` après `createProduct` et `updateProduct`
- `packages/core/src/modules/search/search.repository.test.ts` — **créé** : tests
  d'intégration de la fonction SQL et du refresh
- `packages/core/src/test/db.ts` — **modifié** : ajouter la table `Product` (déjà
  présente dans le TRUNCATE) — pas de changement si le vecteur est une colonne de
  `Product`, mais vérifier que le TRUNCATE n'échoue pas

## Étapes de développement

### 1. Créer la migration SQL brut

Créer le fichier migration via `prisma migrate dev --create-only --name search_vector`,
puis remplacer le SQL généré par du SQL brut contenant :

- `ALTER TABLE "Product" ADD COLUMN "search_vector" tsvector`
- Fonction SQL `refresh_product_search_vector(product_id TEXT)` qui :
  - Récupère `name`, `description`, `"shortDescription"` du produit
  - Joint `Brand.name` via `"brandId"`
  - Agrège les `sku` et `ean` des `ProductVariant` liées
  - Extrait les valeurs (pas les clés) du champ JSONB `attributes`
  - Assemble le tsvector avec poids : `setweight(to_tsvector('french', ...), 'A')` pour
    nom + marque, `setweight(to_tsvector('simple', ...), 'A')` pour SKU/EAN,
    `setweight('B')` pour shortDescription, `setweight('C')` pour description + attributs
  - `UPDATE "Product" SET "search_vector" = ... WHERE id = product_id`
- `CREATE INDEX` GIN sur `"Product"."search_vector"`
- Backfill : appel de la fonction pour chaque produit existant
  (`SELECT refresh_product_search_vector(id) FROM "Product"`)

Test : `pnpm --filter @pharmacie/core db:migrate` passe sans erreur. La colonne et
l'index existent (`\d "Product"` dans psql).

### 2. Déclarer le champ Unsupported dans le schema Prisma

Ajouter `searchVector Unsupported("tsvector")?` sur le model `Product` dans
`schema.prisma`, sans valeur par défaut (la colonne est remplie par la fonction SQL).
Lancer `pnpm --filter @pharmacie/core db:generate` pour régénérer le client.

Test : `prisma validate` passe. `prisma format` ne supprime pas le champ.

### 3. Implémenter `refreshSearchVector` dans le search repository

Créer `search.repository.ts` dans `packages/core/src/modules/search/` avec une
fonction `refreshSearchVector(productId: string)` qui exécute
`prisma.$executeRaw` appelant la fonction SQL `refresh_product_search_vector`.

Test : le fichier compile (`pnpm type-check`).

### 4. Brancher le refresh dans le product service

Dans `product.service.ts`, après les appels `createProduct` et `updateProduct` (après
`setFacetValues`), appeler `refreshSearchVector(product.id)`. L'import vient de
`../search` (le barrel du module).

Test : `pnpm type-check` passe, les tests existants du catalogue passent toujours.

### 5. Écrire les tests d'intégration

Créer `search.repository.test.ts` avec :

- **Test 1** : créer un produit via le service catalogue → vérifier que `search_vector`
  n'est pas null (query raw `SELECT search_vector FROM "Product" WHERE id = $1`).
- **Test 2** : vérifier les poids — le nom du produit apparaît en poids A
  (`ts_debug('french', ...)` ou vérifier le contenu du tsvector stringifié).
- **Test 3** : modifier le nom du produit → le vecteur est mis à jour.
- **Test 4** : un produit avec marque → `brand.name` est dans le vecteur (poids A).
- **Test 5** : un produit avec variantes (SKU, EAN) → les codes sont dans le vecteur.
- **Test 6** : un produit avec attributs JSONB → les valeurs sont dans le vecteur.

Test : `pnpm --filter @pharmacie/core test -- search` passe.

### 6. Mettre à jour le barrel index.ts

Remplacer `export {}` dans `search/index.ts` par les réexports du repository
(`refreshSearchVector`).

Test : l'import `from "../search"` dans `product.service.ts` résout correctement.

## Points d'attention

- **`Unsupported("tsvector")` et Prisma** : Prisma ne génère pas de type TS pour ce
  champ. C'est attendu — on ne lit/écrit jamais `searchVector` via le client Prisma,
  uniquement via `$queryRaw` / `$executeRaw`. Vérifier que les `include` existants
  (`productInclude`, `cardInclude`) ne cassent pas (le champ Unsupported est exclu par
  défaut des select).
- **Fonction SQL vs trigger** : la spec retient l'appel explicite (pas de trigger).
  Conséquence : si un produit est modifié hors du service (ex. migration manuelle,
  script de seed), le vecteur ne sera pas à jour. Le backfill dans la migration couvre
  le cas initial ; un script `reindex-all` pourra être ajouté plus tard si besoin.
- **Jointures cross-table dans la fonction SQL** : la fonction doit joindre `Brand` et
  agréger `ProductVariant`. Utiliser `COALESCE` pour les valeurs nullable
  (`brand.name`, `shortDescription`, etc.) afin d'éviter que `NULL` annule le
  `to_tsvector`.
- **Attributs JSONB** : extraire les valeurs avec
  `jsonb_each_text(attributes)` → concaténer les `value`. Les clés (noms d'attributs
  internes) ne sont pas indexées.
- **Performance du backfill** : pour quelques milliers de produits, un
  `SELECT refresh_product_search_vector(id) FROM "Product"` suffit. Si le volume
  grossit, envisager un batch.
- 🚧 **Dictionnaire `french` et EAN/SKU** : le vecteur mélange deux dictionnaires
  (`french` pour le texte, `simple` pour les codes). C'est possible en assemblant
  plusieurs `setweight(to_tsvector(...))` — le tsquery devra aussi utiliser le bon
  dictionnaire côté recherche (story 02).
