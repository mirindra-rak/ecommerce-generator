# Plan : Éditeur multi-déclinaisons (back-office produit)

**Ticket** : [2026-06-12-editeur-multi-declinaisons-produit.md](2026-06-12-editeur-multi-declinaisons-produit.md) · **Statut** 🟡

## Résumé

Permettre d'éditer **plusieurs déclinaisons** par produit (étiquette `volume` + SKU/EAN/prix/
stock), via un éditeur de lignes adaptatif (1 → vue simple, ≥ 2 → tableau) et de nouveaux
services de domaine qui réconcilient l'ensemble des déclinaisons (création/maj/suppression).

## 🚧 tranchés

- **Édition dynamique** : liste de lignes gérée en état React côté client + **un seul submit**,
  sérialisée dans un champ caché `variants` (JSON). Le server action parse ce JSON.
- **En-tête d'étiquette** : « Déclinaison ».

## Fichiers à créer ou modifier

- `packages/core/src/modules/catalog/product.service.ts` — **modifié** : `CreateProductInput`/
  `UpdateProductInput` portent `variants: ProductVariantInput[]` (au lieu de `defaultVariant` /
  `variantId`) ; `ProductVariantInput` gagne `id?` et `volume?` ; `createProduct` crée le
  produit + toutes les déclinaisons ; `updateProduct` met à jour les scalaires + réconcilie les
  déclinaisons ; garde « ≥ 1 déclinaison » ; traduction P2002 inchangée.
- `packages/core/src/modules/catalog/product.repository.ts` — **modifié** : `reconcileVariants(
productId, variants)` (transaction : supprime les absentes, met à jour celles avec `id`, crée
  les nouvelles) ; `createWithDefaultVariant` adapté ou complété pour créer N déclinaisons.
- `apps/pharmacie-1/src/app/admin/(protected)/produits/_actions.ts` — **modifié** : lit
  `variants` (JSON) au lieu des champs uniques ; euros→centimes par ligne ; valide (≥ 1, SKU
  requis, prix > 0) ; appelle les services.
- `apps/pharmacie-1/src/app/admin/(protected)/produits/variants-editor.tsx` — **créé** : sous-
  composant client (état des lignes, rendu adaptatif, ajout/suppression, champ caché JSON).
- `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx` — **modifié** :
  remplace la section « Déclinaison par défaut » par `<VariantsEditor>` ; `ProductFormValue`
  porte `variants: VariantRow[]` au lieu des champs uniques.
- `apps/pharmacie-1/src/app/admin/(protected)/produits/{new,[id]}/page.tsx` — **modifié** :
  `new` démarre avec 1 ligne vide ; `[id]` mappe **toutes** les `product.variants` en lignes.

## Étapes de développement

1. **Types domaine** — `ProductVariantInput` (+`id?`, +`volume?`) ; `CreateProductInput.variants`
   et `UpdateProductInput.variants` en tableaux. Test : `pnpm --filter @pharmacie/core type-check`.
2. **Repository `reconcileVariants`** — transaction : `deleteMany` des ids absents, `update` des
   existants, `create` des nouveaux (rattachés au produit). Test (Vitest) : produit à 2
   déclinaisons → réconcilier vers (1 maj + 1 ajout + 1 suppr) donne le bon ensemble.
3. **Service `createProduct` multi** — crée produit + N déclinaisons (≥ 1). Test : création avec 2
   déclinaisons, chacune persistée ; rejet si liste vide.
4. **Service `updateProduct` multi** — met à jour scalaires + `reconcileVariants` ; garde ≥ 1 ;
   P2002 → `DuplicateProductFieldError`. Test : ajout/suppression/maj ; rejet dernière suppression ;
   rejet SKU/EAN dupliqué.
5. **Actions** — parse `variants` JSON (défensif), euros→centimes, validations, appel services.
   Test : type-check ; payload JSON malformé → erreur propre.
6. **`VariantsEditor` (client)** — état `rows[]` (`id?`, volume, sku, ean, priceEuros, stock) ;
   bouton « Ajouter une déclinaison » ; suppression par ligne (désactivée si 1 seule) ; champ
   caché `name="variants"` = JSON ; rendu **adaptatif** (1 ligne → disposition simple actuelle,
   ≥ 2 → tableau, en-tête « Déclinaison »). Réutilise `Input`/`Field`/`Button` DS. Test : rendu.
7. **Intégration `produit-form`** — `ProductFormValue.variants` ; insérer `<VariantsEditor>` dans
   la carte « Déclinaisons » ; supprimer les anciens champs uniques. Test : type-check app.
8. **Pages new/[id]** — `new` : 1 ligne vide ; `[id]` : `product.variants.map(...)` (étiquette =
   `volume`, prix = centimes/100). Test : type-check ; édition pré-remplit toutes les lignes.
9. **Vérification** — `pnpm --filter @pharmacie/core test`, `type-check`+`lint`+`prettier`, smoke
   `dev` : créer un produit à 2 déclinaisons (50/100 ml, prix distincts), éditer (changer un prix,
   ajouter une 3ᵉ, supprimer une), confirmer en base + rendu storefront (la PDP liste déjà les
   variantes via `getProductDetail`). Journaliser dans `tasks/`.

## Points d'attention

- **Non-régression produit simple** : un produit à 1 déclinaison s'édite via le même mécanisme
  mais rendu en disposition « simple » → comportement identique. Vérifier le scénario 5.
- **Unicité SKU/EAN globale** : contrainte `@unique` sur toute la table → P2002 traduit en erreur
  métier, **sans perte de saisie** (le JSON reste dans le formulaire au retour d'erreur).
- **Atomicité** : `reconcileVariants` en une transaction (sinon état partiel si une ligne échoue).
- **Produits seed avec axes** (`ProductOption`/`VariantOptionValue`) : l'Option A **ignore** les
  axes. Supprimer une déclinaison cascade ses `VariantOptionValue` (OK) ; une `ProductOption`
  peut devenir orpheline (cosmétique, non bloquant). Mitigation : ne pas gérer les axes en V1,
  documenter ; nettoyage des options orphelines = hors scope.
- **Invariant ≥ 1** : refuser une liste vide côté service ET désactiver la suppression de la
  dernière ligne côté UI.
- **Sérialisation JSON** : valider le parse côté action (try/catch) ; types numériques (prix,
  stock) re-vérifiés serveur, jamais de confiance au client.
