# Plan : Epic Pricing — Prix, TVA & affichage TTC (lot 4.2)

**Ticket** : [epic.md](./epic.md) · **Statut** 🟢

## Résumé

Construire le socle pricing du projet : introduire un référentiel `TaxRate`, centraliser le calcul HT / TVA / TTC dans `packages/core/src/modules/pricing`, rattacher explicitement chaque produit à une règle fiscale, exposer ce choix dans le back-office produit, puis afficher des prix TTC cohérents côté storefront.

## Fichiers à créer ou modifier

### Story 01 — Référentiel TVA

- `packages/core/prisma/schema.prisma` — **modifié** : ajouter le modèle `TaxRate`, remplacer `Product.vatRate` par une relation explicite `taxRate`
- `packages/core/prisma/migrations/*/migration.sql` — **créé** : créer `TaxRate`, migrer les produits existants, supprimer `vatRate`
- `packages/core/prisma/seed.ts` — **modifié** : seeder le référentiel TVA puis raccorder les produits seedés
- `packages/core/prisma/seed-data/catalog.json` — **conservé** : la donnée source peut continuer à porter `vatRate` comme donnée d’import transitoire
- `packages/core/src/test/db.ts` — **modifié** : inclure `TaxRate` dans le reset de la base de test

### Story 02 — Noyau pricing

- `packages/core/src/modules/pricing/index.ts` — **modifié** : exports publics du module
- `packages/core/src/modules/pricing/tax-rate.repository.ts` — **créé** : repository du référentiel fiscal
- `packages/core/src/modules/pricing/pricing.service.ts` — **créé** : calculs purs HT / TVA / TTC et fourchettes de prix
- `packages/core/src/modules/pricing/pricing-errors.ts` — **créé** : erreurs métier (`InvalidTaxRateError`, etc.)
- `packages/core/src/modules/pricing/tax-rate.constants.ts` — **créé** : référentiel seedé canonique et taux par défaut
- `packages/core/src/modules/pricing/*.test.ts` — **créé** : couverture du moteur de calcul et du repository

### Story 03 — Intégration produit

- `packages/core/src/modules/catalog/product.repository.ts` — **modifié** : charger `taxRate` dans les includes lecture
- `packages/core/src/modules/catalog/product.service.ts` — **modifié** : exiger / résoudre `taxRateId` à la création et à la mise à jour
- `packages/core/src/modules/catalog/index.ts` — **modifié** : exposer les contrats mis à jour
- `packages/core/src/modules/catalog/*.test.ts` — **modifié** : couvrir le rattachement produit ↔ `TaxRate`

### Story 04 — Back-office produit

- `apps/pharmacie-1/src/app/admin/(protected)/produits/new/page.tsx` — **modifié** : charger les options `TaxRate`
- `apps/pharmacie-1/src/app/admin/(protected)/produits/[id]/page.tsx` — **modifié** : hydrater la sélection TVA du produit
- `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx` — **modifié** : ajouter le champ `TaxRate`
- `apps/pharmacie-1/src/app/admin/(protected)/produits/_actions.ts` — **modifié** : lire `taxRateId` depuis le formulaire et le transmettre au domaine
- `apps/pharmacie-1/messages/fr.json` — **modifié** : labels admin TVA / TTC
- `apps/pharmacie-1/messages/en.json` — **modifié** : labels admin VAT / prices

### Story 05 — Storefront TTC

- `apps/pharmacie-1/src/lib/catalog.ts` — **modifié** : calculer les view models de prix à partir du module `pricing`
- `apps/pharmacie-1/src/lib/category-listing.ts` — **modifié** : trier sur le prix affiché TTC, pas sur le HT brut
- `apps/pharmacie-1/src/lib/category-listing.test.ts` — **modifié** : refléter le tri TTC
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/product-card.tsx` — **modifié** : afficher un prix TTC
- `apps/pharmacie-1/src/app/[locale]/(storefront)/produit/[slug]/page.tsx` — **modifié** : afficher le détail TTC et la ventilation utile

### Story 06 — Contrats transactionnels

- `packages/core/src/modules/pricing/pricing.service.ts` — **modifié** : exposer un contrat `PriceBreakdown` réutilisable
- `packages/core/src/modules/cart/index.ts` — **éventuellement modifié** : documenter le futur point d’intégration
- `packages/core/src/modules/order/index.ts` — **éventuellement modifié** : documenter le futur point d’intégration
- `ARCHITECTURE.md` — **éventuellement modifié** : expliciter que les montants transactionnels consomment `pricing`

## Étapes de développement

### Story 01 — Référentiel TVA

**1. Ajouter le modèle Prisma `TaxRate`**
Créer un référentiel fiscal avec `id`, `code`, `name`, `rateBps`, `active`, `position`, timestamps. Remplacer l’entier `Product.vatRate` par `taxRateId` + relation `taxRate`.
**Test** : `pnpm --filter @pharmacie/core db:generate` passe.

**2. Générer la migration de conversion**
Créer la migration SQL qui insère les taux supportés, mappe les produits existants vers `TaxRate`, puis supprime `vatRate`.
**Test** : migration applicable sur une base contenant déjà des produits.

**3. Adapter le seed**
Seeder `TaxRate` avant les produits, puis connecter chaque produit seedé à la règle correspondante.
**Test** : `pnpm --filter @pharmacie/core db:seed` produit un catalogue cohérent.

### Story 02 — Noyau pricing

**4. Créer le repository `TaxRate`**
Exposer `findMany`, `findActive`, `findById`, `findByCode`, `findDefault`.
**Test** : test repository sur base de test.

**5. Implémenter les calculs purs**
Créer `calculateTaxAmount`, `calculatePriceBreakdown`, `calculatePriceRange`. Tous les montants restent en centimes entiers, sans flottants comme source de vérité.
**Test** : tests unitaires sur plusieurs taux (`0`, `210`, `550`, `1000`, `2000`).

**6. Centraliser la politique d’arrondi**
Utiliser une règle unique d’arrondi dans `pricing` pour la TVA, documentée et réutilisée partout.
**Test** : cas limites sur les centimes validés par tests.

**7. Définir les erreurs métier**
Ajouter les erreurs canoniques du module (`InvalidMoneyAmountError`, `InvalidTaxRateError`, `TaxRateNotFoundError`).
**Test** : validation des erreurs dans les cas invalides.

### Story 03 — Intégration produit

**8. Charger `taxRate` dans les lectures produit**
Inclure `taxRate` dans les requêtes `ProductCard`, `ProductWithRelations` et listing admin.
**Test** : les repositories retournent bien le référentiel fiscal associé.

**9. Mettre à jour les contrats d’écriture produit**
Ajouter `taxRateId` aux inputs métier de création et mise à jour. Résoudre le taux par défaut via `taxRateRepository`, sans appel Prisma direct hors repository.
**Test** : `createProduct` et `updateProduct` rejettent un `taxRateId` invalide.

**10. Étendre les tests catalogue**
Mettre à jour les tests existants pour vérifier le rattachement explicite à `TaxRate`.
**Test** : la suite `product.service.test.ts` et `product.repository.test.ts` passe.

### Story 04 — Back-office produit

**11. Charger les options TVA dans les pages admin**
Les pages `new` et `[id]` récupèrent `taxRateRepository.findActive()` et passent une liste d’options au formulaire.
**Test** : le formulaire de produit reçoit des options cohérentes.

**12. Ajouter le champ TVA au formulaire**
Introduire un `Select` pour le taux de TVA dans `ProductForm`, avec valeur par défaut explicite.
**Test** : création et édition affichent la bonne sélection.

**13. Lire `taxRateId` côté server action**
Adapter `_actions.ts` pour inclure `taxRateId` dans `readBase()`, puis transmettre cette donnée au domaine.
**Test** : l’action crée et met à jour correctement un produit avec sa règle fiscale.

**14. Ajouter les traductions**
Ajouter les labels admin nécessaires pour TVA, TTC, HT si affiché à titre informatif.
**Test** : rendu correct en FR et EN.

### Story 05 — Storefront TTC

**15. Faire calculer les prix par `pricing`**
Dans `apps/pharmacie-1/src/lib/catalog.ts`, construire les `ProductCardVM` et `ProductDetailVM` à partir de `calculatePriceBreakdown` / `calculatePriceRange`.
**Test** : les VMs exposent des prix TTC cohérents.

**16. Basculer les composants storefront en TTC**
Mettre à jour `product-card.tsx` et `produit/[slug]/page.tsx` pour afficher du TTC, avec suffixe cohérent.
**Test** : home, listing catégorie et fiche produit affichent le TTC.

**17. Aligner le tri de listing**
Le tri par prix du listing doit utiliser le prix affiché au client, donc le TTC.
**Test** : `category-listing.test.ts` couvre le tri TTC ascendant / descendant.

### Story 06 — Contrats transactionnels

**18. Exposer un contrat `PriceBreakdown` stable**
Formaliser le payload réutilisable pour `cart`, `order`, `returns`, `payment`.
**Test** : le type est exporté publiquement depuis `@pharmacie/core/modules/pricing`.

**19. Documenter l’intégration future**
Ajouter une note d’architecture minimale pour éviter que les futurs modules recalculent eux-mêmes la TVA.
**Test** : documentation alignée sur le domaine.

## Points d’attention

- **Workflow** : cette epic doit maintenant repasser par la phase `plan` avant toute poursuite du code.
- **Migration de données** : la conversion `vatRate -> taxRateId` doit échouer explicitement si un taux historique ne correspond à aucune règle seedée.
- **Tri storefront** : une fois le storefront affiché en TTC, trier encore sur le HT créerait une incohérence fonctionnelle.
- **Seed dataset** : `catalog.json` peut conserver `vatRate` comme donnée d’import, mais ce champ ne doit plus exister dans le modèle Prisma final.
- **Contrat transactionnel** : les modules `cart` et `order` ne doivent jamais recalculer les montants avec leur propre logique.
- **Règle Silo** : aucun modèle multi-tenant ni logique fiscale mutualisée au-delà de la base courante.
