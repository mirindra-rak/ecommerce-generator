# Plan : Attributs produit flexibles (jsonb + attribute-sets)

**Ticket** : [2026-06-12-attributs-produit-flexibles](./2026-06-12-attributs-produit-flexibles.md) · **Statut** ✅ Terminé (jsonb + Zod, fiche produit lit du jsonb, 39 tests)

## Résumé

Ouvrir le schéma produit (`attributes` jsonb + `productType` String) et valider/lire les
attributs descriptifs par un registre d'attribute-sets Zod, en dogfoodant sur la
parapharmacie (`inci`/`precautions` migrent dans `attributes`).

## Surface d'impact (grep)

`productType`/`ProductType` et `inci`/`precautions` : `schema.prisma`, `prisma/seed.ts`,
`product.repository.test.ts`, `apps/.../produit/[slug]/page.tsx`, `apps/.../lib/catalog.ts`.
Tous à adapter (cf. étapes).

## Fichiers à créer ou modifier

- `packages/core/package.json` — **modifié** : dépendance `zod`.
- `packages/core/prisma/schema.prisma` — **modifié** : `Product.attributes Json
@default("{}")` ; `productType String @default("OTHER")` ; **supprimer** `enum
ProductType`, colonnes `inci`, `precautions` ; **garder** `ean` (unique) + commerce.
- `packages/core/prisma/migrations/**` — **créé** : migration (destructive, cf. risques).
- `packages/core/prisma/seed.ts` — **modifié** : `inci`/`precautions` → `attributes` ;
  `productType` en chaîne (retirer l'import enum Prisma).
- `packages/core/src/modules/catalog/product-attributes.ts` — **créé** : `type
ProductType` (union) + `PRODUCT_TYPES` ; schémas Zod par type ; registre +
  `getAttributeSchema` (défaut permissif) ; `validateAttributes` (throw) ;
  `parseAttributes` (lecture typée).
- `packages/core/src/modules/catalog/catalog-errors.ts` — **modifié** : ajouter
  `InvalidProductAttributesError`.
- `packages/core/src/modules/catalog/index.ts` — **modifié** : exporter le nouveau module.
- `packages/core/src/modules/catalog/product-attributes.test.ts` — **créé** : validation.
- `packages/core/src/modules/catalog/product.repository.test.ts` — **modifié** : fixture
  (`inci` → `attributes`, `productType` chaîne).
- `apps/pharmacie-1/src/lib/catalog.ts` — **modifié** : `getProductDetail` lit
  `inci`/`precautions` via `parseAttributes(product.productType, product.attributes)`.
- `apps/pharmacie-1/src/app/(storefront)/produit/[slug]/page.tsx` — **inchangé** si le VM
  conserve `inci`/`precautions` (à vérifier au build).

## Étapes de développement

1. **Dépendance Zod** — ajouter `zod` à `@pharmacie/core` ; `pnpm install`. Test : import OK.
2. **Schéma** — `Product` : `attributes Json @default("{}")`, `productType String
@default("OTHER")` ; supprimer enum + `inci`/`precautions`. Test : `prisma validate`.
3. **Migration** — `db:migrate --name product_flexible_attributes` ; régénérer le client.
   Test : tables à jour ; ⚠️ migration destructive (cf. risques).
4. **Type + constantes** — `product-attributes.ts` : `ProductType` union
   (`COSMETIC|SUPPLEMENT|DEVICE|OTHER`) + `PRODUCT_TYPES` (pattern `Role`). Test : `type-check`.
5. **Attribute-sets Zod** — schémas par type (parapharmacie : `inci?`, `precautions?`) +
   registre + `getAttributeSchema(type)` → schéma connu, sinon **schéma permissif**
   (`z.object({}).passthrough()`). Test unitaire : récupération par type connu/inconnu.
6. **Validation à l'écriture** — `validateAttributes(type, attrs)` parse via Zod, lève
   `InvalidProductAttributesError` si invalide. Test : valides OK ; invalides → erreur.
7. **Lecture typée** — `parseAttributes(type, attrs)` (`unknown` → objet typé via
   `safeParse`, jamais d'`any`). Test : attrs parapharmacie correctement typés.
8. **Exports** — `index.ts` expose `ProductType`, `PRODUCT_TYPES`, `getAttributeSchema`,
   `validateAttributes`, `parseAttributes`, `InvalidProductAttributesError`. Test : `type-check`.
9. **Seed** — déplacer `inci`/`precautions` dans `attributes`, `productType` en chaîne ;
   lancer `db:seed`. Test : seed OK, produits créés avec `attributes`.
10. **Fixtures de test** — `product.repository.test.ts` : `inci` → `attributes: { inci }`,
    `productType` chaîne. Test : suite repository toujours verte.
11. **App — fiche produit** — `lib/catalog.ts` : `getProductDetail` lit `inci`/`precautions`
    depuis `parseAttributes`; vérifier que `page.tsx` reste inchangé (VM identique). Test :
    `type-check` + build.
12. **Qualité + smoke** — `pnpm test` + `type-check` + `lint` + `build` ; smoke runtime :
    `GET /produit/creme-hydratante-visage` affiche toujours INCI + précautions (lus du jsonb).

## Points d'attention

- **Migration destructive** : on supprime `inci`/`precautions`/l'enum → **perte de données**
  sur ces colonnes. Acceptable ici (uniquement données dev/seed). En prod réel, il faudrait
  un script de **copie colonnes → `attributes`** AVANT le drop. À documenter dans la tâche.
- **Cast enum → String** : Prisma peut générer une migration nécessitant un `USING
"productType"::text`. 🚧 Vérifier le SQL généré ; ajuster à la main si l'altération échoue
  (sinon : drop colonne enum + add colonne String, acceptable car re-seed).
- **`attributes` typé `Prisma.JsonValue`** : `parseAttributes` prend `unknown` et passe par
  Zod → **aucun `any`** propagé (règle ESLint). Caster l'entrée en `unknown`, pas en `any`.
- **Pas de product write-service encore** : l'admin produits (CRUD) n'existe pas. La
  validation est **prête + testée** et sera branchée dans le futur `createProduct`. Le seed
  insère des données connues valides (peut bypasser la validation). Acté.
- **Schéma permissif par défaut** : un `productType` inconnu ne doit jamais faire planter la
  lecture (`passthrough`) — sinon régression d'affichage. Bien tester ce cas.
- **Défauts** : `productType "OTHER"` + `attributes "{}"` pour que les créations sans
  attributs (tests catégorie, produits minimaux) passent sans rien fournir.
- **Zod v3 vs v4** : prendre la dernière stable ; `z.object/.strict/.passthrough/.safeParse`
  identiques. 🚧 vérifier au codage.
- **Hors-sujet mais bloquant pour le smoke auth** : le port dev est passé à **4000** alors
  que `BETTER_AUTH_URL=4321` (incohérent). Sans impact sur le smoke fiche produit (pas
  d'auth), mais à corriger séparément.
- **Index GIN sur `attributes`** : non requis ici (pas de requête par attribut tant que
  `search`/lot 4.4 n'est pas là).
