# Plan : Epic Inventory — Stock & disponibilité (lot 4.3)

**Ticket** : [epic.md](./epic.md) · **Statut** 🟡

## Résumé

Construire le module inventory complet : enrichir le schéma Prisma, implémenter repository + service de domaine avec ajustements relatifs et traçabilité, ajouter un onglet Stocks dans l'admin produit, et brancher les alertes email au franchissement du seuil.

## Fichiers à créer ou modifier

### Story 01 — Schéma Prisma

- `packages/core/prisma/schema.prisma` — modifié : ajout enum `OutOfStockBehavior`, enum `StockMovementReason`, champs inventory sur `ProductVariant`, modèle `StockMovement`

### Story 02 — Repository & service

- `packages/core/src/modules/inventory/inventory.types.ts` — créé : types d'entrée/sortie du module (AdjustInput, InventorySettings, MovementHistory, AvailabilityResult)
- `packages/core/src/modules/inventory/inventory.repository.ts` — créé : accès données (getVariantStock, getMovements, createMovement, updateInventorySettings)
- `packages/core/src/modules/inventory/inventory.service.ts` — créé : logique métier (adjust, isAvailable, getMovementHistory, updateSettings)
- `packages/core/src/modules/inventory/inventory.service.test.ts` — créé : tests unitaires du service
- `packages/core/src/modules/inventory/index.ts` — modifié : exports publics du module

### Story 03 — Admin UI

- `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx` — modifié : ajout section Stocks (FormSection) avec sous-composant par variant
- `apps/pharmacie-1/src/app/admin/(protected)/produits/stock-editor.tsx` — créé : composant client pour l'ajustement relatif et la config inventory par variant
- `apps/pharmacie-1/src/app/admin/(protected)/produits/_actions.ts` — modifié : ajout server actions `adjustStockAction` et `updateInventorySettingsAction`
- `apps/pharmacie-1/src/app/admin/(protected)/produits/[id]/page.tsx` — modifié : charger les données inventory (stock, settings, mouvements récents) pour le formulaire
- `apps/pharmacie-1/src/app/admin/(protected)/produits/variants-editor.tsx` — modifié : retirer le champ stock (déplacé vers l'onglet Stocks)
- `apps/pharmacie-1/messages/fr.json` — modifié : clés `admin.products.stock.*`
- `apps/pharmacie-1/messages/en.json` — modifié : clés `admin.products.stock.*`

### Story 04 — Alertes email

- `packages/core/src/modules/inventory/inventory.types.ts` — modifié : interface `LowStockNotifier` (port injectable)
- `packages/core/src/modules/inventory/inventory.service.ts` — modifié : détection franchissement seuil dans `adjust()`, appel au notifier
- `packages/core/src/modules/inventory/inventory.service.test.ts` — modifié : tests du déclenchement d'alerte (mock du notifier)
- `packages/core/src/modules/inventory/email-notifier.ts` — créé : implémentation concrète du port `LowStockNotifier` (🚧 module email stub — implémentation minimale avec `console.warn` ou Nodemailer direct si dispo)

## Étapes de développement

### Story 01 — Schéma Prisma

**1. Ajouter les enums Prisma**
Ajouter `OutOfStockBehavior` (`DENY`, `ALLOW`, `DEFAULT`) et `StockMovementReason` (`MANUAL_ADJUSTMENT`, `RECEPTION`, `SALE`, `RETURN`, `CORRECTION`) dans `schema.prisma`.
Test : `pnpm --filter @pharmacie/core db:generate` passe sans erreur.

**2. Enrichir ProductVariant avec les champs inventory**
Ajouter sur `ProductVariant` : `minOrderQty Int @default(1)`, `stockLocation String?`, `lowStockThreshold Int?`, `lowStockAlert Boolean @default(false)`, `outOfStockBehavior OutOfStockBehavior @default(DEFAULT)`. Tous les champs ont des defaults compatibles avec les données existantes.
Test : `db:generate` passe, aucun conflit avec les variantes existantes.

**3. Ajouter le modèle StockMovement**
Créer le modèle avec `id`, `variantId` (FK ProductVariant), `delta Int`, `stockAfter Int`, `reason StockMovementReason`, `note String?`, `createdAt DateTime @default(now())`. Index sur `variantId` et sur `createdAt`. Relation `variant ProductVariant @relation(...)` + champ `stockMovements StockMovement[]` inverse sur ProductVariant.
Test : `db:generate` passe.

**4. Générer et appliquer la migration**
Lancer `pnpm --filter @pharmacie/core db:migrate` avec un nom descriptif.
Test : migration appliquée, `db:generate` OK, `pnpm type-check` passe.

### Story 02 — Repository & service

**5. Créer les types du module inventory**
Fichier `inventory.types.ts` avec les interfaces : `AdjustStockInput` (`variantId`, `delta`, `reason`, `note?`), `InventorySettingsInput` (`minOrderQty?`, `stockLocation?`, `lowStockThreshold?`, `lowStockAlert?`, `outOfStockBehavior?`), `VariantStock` (variant stock + settings), `MovementHistoryPage` (items + total).
Test : `pnpm type-check` passe.

**6. Créer le repository inventory**
Fichier `inventory.repository.ts`, pattern identique à `productRepository` (objet exporté). Méthodes : `getVariantStock(variantId)` → stock + champs inventory, `getMovements(variantId, { page, perPage })` → mouvements paginés, `createMovement(data, tx?)` → insère StockMovement + update ProductVariant.stock atomiquement (transaction Prisma), `updateSettings(variantId, settings)` → update champs inventory du variant.
Test : `pnpm type-check` passe.

**7. Créer le service inventory — adjust()**
Fichier `inventory.service.ts`. Fonction `adjust(input: AdjustStockInput)` : valide delta ≠ 0, lit le stock actuel via repository, calcule `stockAfter`, appelle `repository.createMovement()` en transaction. Retourne le mouvement créé.
Test : test unitaire — adjust +10 sur stock 50 → stock 60, mouvement créé avec `stockAfter: 60`.

**8. Service — isAvailable()**
Fonction `isAvailable(variantId, qty)` : lit le variant (stock, minOrderQty, outOfStockBehavior). Retourne `false` si `qty < minOrderQty`. Si stock >= qty → `true`. Sinon : DENY → `false`, ALLOW → `true`, DEFAULT → `false` (🚧 en attendant config site-level).
Test : tests unitaires couvrant les 4 cas (suffisant, DENY, ALLOW, DEFAULT).

**9. Service — getMovementHistory()**
Fonction `getMovementHistory(variantId, { page, perPage })` : délègue au repository avec pagination.
Test : test unitaire — appel retourne page correcte.

**10. Service — updateSettings()**
Fonction `updateSettings(variantId, settings)` : valide (minOrderQty >= 1, lowStockThreshold >= 0 si défini), délègue au repository.
Test : test unitaire — mise à jour des settings, validation minOrderQty < 1 rejetée.

**11. Exporter le module inventory**
Mettre à jour `index.ts` : exporter repository, service, types. Convention identique à `catalog/index.ts`.
Test : `import { inventoryService } from "@pharmacie/core/modules/inventory"` compile.

### Story 03 — Admin UI

**12. Retirer le champ stock du variant editor**
Dans `variants-editor.tsx`, supprimer le `<Field label={t("stock")}>` et le champ `stock` du state/serialized. Le stock initial reste dans `VariantRow` pour compatibilité lecture, mais n'est plus éditable ici. Dans `_actions.ts`, `readVariants()` n'exige plus de stock valide (le champ n'est plus envoyé par le formulaire — le stock est géré via l'onglet Stocks).
Test : le formulaire produit compile et fonctionne sans champ stock dans le variant editor.

**13. Créer le composant StockEditor**
Fichier `stock-editor.tsx` (composant client). Props : liste de variants avec leur stock + settings + mouvements récents. Pour chaque variant : stock actuel (lecture seule), champ d'ajustement relatif (+/-) avec bouton valider, champs config (minOrderQty, stockLocation, lowStockThreshold toggle + seuil, outOfStockBehavior radio/select). Section historique : table des N derniers mouvements (date, delta signé, stock après, motif, note).
Test : le composant rend sans erreur avec des données mock.

**14. Ajouter les server actions inventory**
Dans `_actions.ts`, ajouter `adjustStockAction(formData)` : lit `variantId` + `delta` + `note`, appelle `inventoryService.adjust()`, `revalidatePath`. Ajouter `updateInventorySettingsAction(formData)` : lit les settings, appelle `inventoryService.updateSettings()`, `revalidatePath`.
Test : les actions compilent, type-check passe.

**15. Intégrer la section Stocks dans le formulaire produit**
Dans `produit-form.tsx`, ajouter une `FormSection` « Stocks » après la section Variantes. Rendre le `StockEditor` avec les données chargées. Dans `[id]/page.tsx`, charger les données inventory de chaque variant (stock, settings, mouvements récents) et les passer au formulaire. Note : la section Stocks n'apparaît qu'en **édition** (pas en création — pas de variant persisté encore).
Test : ouvrir un produit existant dans l'admin, l'onglet Stocks est visible avec le stock actuel de chaque variant.

**16. Ajouter les clés i18n**
Ajouter les clés `admin.products.stock.*` dans `messages/fr.json` et `messages/en.json` : labels (stock, ajustement, quantité min., emplacement, alerte, seuil, rupture), options (refuser, accepter, défaut), historique (date, delta, motif, note), motifs de mouvement (MANUAL_ADJUSTMENT, RECEPTION, etc.).
Test : l'onglet Stocks s'affiche correctement en FR et EN.

**17. Test manuel end-to-end**
Lancer le dev server, ouvrir un produit, onglet Stocks. Ajuster le stock d'un variant (+5), vérifier que le stock se met à jour et le mouvement apparaît dans l'historique. Modifier les settings (minOrderQty, emplacement, alerte, rupture), recharger, vérifier la persistance.
Test : golden path fonctionnel dans le navigateur.

### Story 04 — Alertes email

**18. Définir le port LowStockNotifier**
Dans `inventory.types.ts`, ajouter l'interface `LowStockNotifier` : `notify(variant: { id, sku, productName }, stock: number, threshold: number): Promise<void>`. Le service inventory reçoit un notifier optionnel.
Test : `pnpm type-check` passe.

**19. Intégrer la détection de franchissement dans adjust()**
Dans `adjust()`, après la mise à jour du stock : si `lowStockAlert === true` et le stock **avant** était >= seuil et le stock **après** est < seuil → appeler `notifier.notify()`. Le franchissement est détecté par comparaison avant/après, pas par le stock absolu.
Test : test unitaire — stock 12 → adjust -5 → stock 7, seuil 10 → notifier appelé. Stock 5 → adjust -2 → stock 3, seuil 10 → notifier PAS appelé (déjà sous le seuil). Alert désactivée → notifier PAS appelé.

**20. Implémenter le notifier email concret**
Fichier `email-notifier.ts`. 🚧 Le module `email` est un stub — implémenter une version minimale : si `process.env.ALERT_EMAIL_TO` est défini, utiliser Nodemailer (ou `console.warn` en dev) pour envoyer l'alerte. L'implémentation concrète sera remplacée quand le module `email` sera construit.
Test : le notifier compile, l'alerte est loguée en dev.

**21. Brancher le notifier dans le wiring applicatif**
Exporter depuis `inventory/index.ts` une factory ou un service pré-câblé avec le notifier email. Les server actions de l'admin utilisent ce service câblé.
Test : ajustement de stock sous le seuil dans l'admin → alerte visible dans les logs dev.

## Points d'attention

- **Transaction atomique** : `createMovement` doit updater `ProductVariant.stock` et insérer `StockMovement` dans la même transaction Prisma (`$transaction`). Un échec partiel (mouvement créé sans update du stock) serait catastrophique.
- **Retrait du stock du variant editor** (étape 12) : le champ `stock` dans `VariantRow` et `readVariants()` est aujourd'hui utilisé pour la **création** de produit (stock initial). Option : garder le champ stock dans le variant editor uniquement en création (pour le stock initial), et le masquer en édition (géré via l'onglet Stocks). Alternative : toujours initialiser à 0 et ajuster après création.
- **Pas de composant Tabs dans @pharmacie/ui** : l'admin utilise des `FormSection` empilées verticalement (pas d'onglets au sens strict). La section Stocks sera une `FormSection` supplémentaire, cohérente avec le pattern existant (Identity, Images, Variants, Attributes, Facets, **Stocks**).
- **Server actions séparées pour le stock** : l'ajustement de stock et la mise à jour des settings sont des actions indépendantes du save principal du produit. Le `StockEditor` aura ses propres formulaires/boutons de validation, pas liés au bouton « Enregistrer » global du produit.
- 🚧 **Module email** : le module `email` est un stub vide. L'alerte email (story 04) sera implémentée avec un port injectable + implémentation minimale (Nodemailer direct ou `console.warn`). À remplacer quand le module email sera construit.
- 🚧 **Politique DEFAULT** : `isAvailable()` avec `outOfStockBehavior = DEFAULT` retourne `false` pour l'instant. Un mécanisme de configuration site-level sera nécessaire à terme (probablement via `site.config.ts` ou un setting en base).
