# Plan : SKU optionnel sur les déclinaisons

**Ticket** : [2026-06-12-sku-optionnel-declinaison.md](2026-06-12-sku-optionnel-declinaison.md) · **Statut** ✅ Terminé

> ✅ **Repris et terminé** (2026-06-12) : le refactor M2M parallèle a atterri (dépôt vert),
> le SKU optionnel a été appliqué par-dessus. Voir `tasks/2026-06-12_17h10_sku-optionnel.md`.

## Résumé

Rendre `ProductVariant.sku` nullable (`String? @unique`) et propager l'optionnalité du domaine
jusqu'à l'UI, en conservant l'unicité sur les valeurs renseignées et le prix obligatoire.

## Fichiers à créer ou modifier

- `packages/core/prisma/schema.prisma` — **modifié** : `sku String? @unique` sur
  `ProductVariant`.
- `packages/core/prisma/migrations/<ts>_sku_optionnel/migration.sql` — **créé** : `ALTER COLUMN
"sku" DROP NOT NULL` (généré via `prisma migrate diff`, appliqué via `migrate deploy`). Pas de
  perte de données ; l'index unique est conservé.
- `packages/core/src/modules/catalog/product.repository.ts` — **modifié** : `VariantWriteInput.sku`
  optionnel (`string | null`) ; `toVariantData` → `sku: variant.sku ?? null`.
- `packages/core/src/modules/catalog/product.service.ts` — **modifié** : `ProductVariantInput.sku`
  optionnel.
- `apps/pharmacie-1/src/app/admin/(protected)/produits/_actions.ts` — **modifié** : retirer la
  validation « SKU requis » ; SKU vide → `null` (le prix reste validé).
- `apps/pharmacie-1/src/app/admin/(protected)/produits/variants-editor.tsx` — **modifié** :
  retirer l'attribut `required` du champ SKU.
- `apps/pharmacie-1/src/lib/catalog.ts` — **modifié** : `ProductDetailVM.variants[].sku: string |
null`.
- `apps/pharmacie-1/src/app/(storefront)/produit/[slug]/page.tsx` — **modifié** : la jonction
  `variants.map(v => v.sku).join(" · ")` filtre les `null` (et affiche « — » si vide).

## Étapes de développement

1. **Migration schéma** — `sku String? @unique` ; générer le SQL avec `prisma migrate diff
--from-schema-datasource ... --to-schema-datamodel ... --script`, écrire la migration,
   `migrate deploy`, `db:generate`. Test : migration appliquée, client régénéré (`type-check`
   core OK).
2. **Domaine** — rendre `VariantWriteInput.sku` et `ProductVariantInput.sku` optionnels ;
   `toVariantData` gère `null`. Test (Vitest) : créer une déclinaison **sans SKU** persiste
   `sku = null` ; **deux** déclinaisons sans SKU coexistent (pas de conflit d'unicité) ; un SKU
   renseigné dupliqué reste rejeté (`DuplicateProductFieldError`).
3. **Server action** — `readVariants` : SKU vide → `null`, suppression du `return { error: "SKU
requis" }`. Test : `type-check` app ; (le prix reste rejeté si absent/≤ 0).
4. **UI** — retirer `required` sur l'`Input` SKU du `VariantsEditor`. Test : `type-check` + `lint`.
5. **Storefront** — `ProductDetailVM.variants[].sku` en `string | null` ; la PDP filtre les SKU
   nuls dans l'affichage. Test : `type-check` app ; la page produit rend sans erreur quand un SKU
   est nul.
6. **Vérification** — `pnpm --filter @pharmacie/core test`, `type-check` + `lint` + `prettier`
   partout, smoke `dev` (créer une déclinaison sans SKU via l'admin / vérifier la PDP).
   Journaliser dans `tasks/`.

## Points d'attention

- **Unicité conservée** : PostgreSQL traite chaque `NULL` comme distinct dans un index unique →
  plusieurs déclinaisons sans SKU sont permises, l'unicité ne s'applique qu'aux valeurs
  renseignées. Aucun changement d'index nécessaire (le `@unique` reste).
- **Édition — vider un SKU** : `reconcileVariants` met déjà à jour via `toVariantData` → un SKU
  effacé (`""` → `null`) est persisté tel quel ; vérifier le scénario 3.
- **Affichage admin** : la table produits et la page `[id]` n'affichent pas le SKU en clé ;
  rien à adapter au-delà des types. Vérifier au `type-check` qu'aucun consommateur ne suppose
  `sku` non nul (repérés : `lib/catalog.ts` et la PDP, traités ci-dessus).
- **Migration non interactive** : comme pour `move_ean_to_variant`, `migrate dev` exige un TTY →
  passer par `migrate diff` + `migrate deploy`.
