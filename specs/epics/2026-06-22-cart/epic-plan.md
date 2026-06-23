# Plan : Cart — Panier d'achat (lot 4.4)

**Ticket** : [epic.md](./epic.md) · **Statut** 🟡

## Résumé

Construire le module panier complet : schema Prisma, service de domaine, gestion de
session anonyme/connecté, et UI storefront (boutons ajouter, compteur, page panier).

## Fichiers à créer ou modifier

### Story 01 — Schema Prisma

- `packages/core/prisma/schema.prisma` — modifié : modèles `Cart` + `CartItem`
- `packages/core/prisma/migrations/<timestamp>_cart/migration.sql` — créé par `db:migrate`

### Story 02 — Repository & service

- `packages/core/src/modules/cart/cart.types.ts` — créé : types domaine
- `packages/core/src/modules/cart/cart.repository.ts` — créé : accès données
- `packages/core/src/modules/cart/cart.service.ts` — créé : logique métier
- `packages/core/src/modules/cart/cart.service.test.ts` — créé : tests unitaires
- `packages/core/src/modules/cart/cart-errors.ts` — créé : erreurs domaine
- `packages/core/src/modules/cart/index.ts` — modifié : exports

### Story 03 — Session panier

- `apps/pharmacie-1/src/lib/cart-session.ts` — créé : résolution du panier depuis cookies + auth
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_actions/cart-actions.ts` — créé : server actions (addToCart, updateQty, removeItem)

### Story 04 — Boutons + compteur

- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/add-to-cart-button.tsx` — créé : bouton client avec server action
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/product-card.tsx` — modifié : câbler le bouton panier
- `apps/pharmacie-1/src/app/[locale]/(storefront)/produit/[slug]/page.tsx` — modifié : câbler le bouton ajouter
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/site-header.tsx` — modifié : compteur dynamique
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/cart-badge.tsx` — créé : composant compteur
- `apps/pharmacie-1/src/lib/catalog.ts` — modifié : ajouter variantId au ProductDetailVM
- `apps/pharmacie-1/messages/fr.json` — modifié : clés panier
- `apps/pharmacie-1/messages/en.json` — modifié : clés panier

### Story 05 — Page panier

- `apps/pharmacie-1/src/app/[locale]/(storefront)/panier/page.tsx` — créé : page panier
- `apps/pharmacie-1/src/lib/cart.ts` — créé : couche données panier (view-models)
- `apps/pharmacie-1/messages/fr.json` — modifié : clés page panier
- `apps/pharmacie-1/messages/en.json` — modifié : clés page panier

## Étapes de développement

### Story 01 — Schema Prisma

1. **Ajouter les modèles Cart + CartItem au schema** — `Cart` (id cuid, sessionToken
   string? unique, userId string? FK User, timestamps) + `CartItem` (id cuid, cartId FK,
   variantId FK ProductVariant, quantity Int, priceExclTax Int, taxRateBps Int,
   priceInclTax Int, timestamps, @@unique([cartId, variantId])).
   Test : `pnpm --filter @pharmacie/core db:migrate` sans erreur.

2. **Générer le client Prisma** — `pnpm --filter @pharmacie/core db:generate`.
   Test : type-check passe.

### Story 02 — Repository & service

3. **Définir les types domaine** — `CartItem`, `CartWithItems`, `CartTotals`,
   `CartLineVM` dans `cart.types.ts`.
   Test : type-check.

4. **Définir les erreurs domaine** — `CartNotFoundError`, `ItemNotAvailableError`
   dans `cart-errors.ts`.
   Test : type-check.

5. **Implémenter le repository** — `findById`, `findBySessionToken`, `findByUserId`,
   `create`, `upsertItem`, `updateItemQty`, `removeItem`, `clearItems`,
   `deleteCart`, `mergeAnonymousIntoUser`.
   Test : type-check.

6. **Implémenter le service** — `addItem` (vérif inventory + snapshot pricing),
   `updateItemQty` (vérif stock), `removeItem`, `getCart` (enrichissement + totaux),
   `clearCart`, `createCart`, `mergeOnLogin`.
   Test : tests unitaires avec mock repository + pricing + inventory.

7. **Exporter le module** — Mettre à jour `index.ts`.
   Test : type-check.

### Story 03 — Session panier

8. **Créer le helper de session** — `cart-session.ts` : `getOrCreateCart()`
   lit le cookie `cart_session` + `getSession()`. Si connecté → `findByUserId`,
   sinon → `findBySessionToken`. Création lazy. Fusion si cookie anonyme +
   user connecté (appelle `mergeOnLogin`).
   Test : type-check + test manuel.

9. **Créer les server actions** — `addToCartAction(variantId, qty)`,
   `updateCartItemAction(variantId, qty)`, `removeCartItemAction(variantId)`.
   Chacune appelle `getOrCreateCart()` puis le service cart, puis `revalidatePath`.
   Test : type-check.

### Story 04 — Boutons + compteur

10. **Enrichir ProductDetailVM et ProductCardVM** — Ajouter `defaultVariantId` au
    `ProductCardVM` et `variantId` aux variants de `ProductDetailVM` pour que les
    boutons sachent quel variant ajouter.
    Test : type-check, pages storefront se chargent.

11. **Créer AddToCartButton** — Composant client `"use client"` qui appelle la
    server action via `useActionState`. Affiche un spinner pendant l'ajout, message
    d'erreur si rupture, confirmation si succès.
    Test : le composant se rend sans erreur.

12. **Câbler les boutons existants** — Remplacer les `<button>` inertes dans
    `product-card.tsx` et `produit/[slug]/page.tsx` par `AddToCartButton`.
    Test : cliquer → server action exécutée.

13. **Créer CartBadge** — Composant qui lit le nombre d'articles du panier côté
    serveur et l'affiche. Remplacer le `0` hardcodé dans `site-header.tsx`.
    Test : ajouter un article → le badge se met à jour.

14. **Ajouter les traductions i18n** — Clés pour les messages d'ajout, erreur
    rupture, compteur, dans `fr.json` et `en.json`.
    Test : basculer en EN.

### Story 05 — Page panier

15. **Créer la couche données panier** — `cart.ts` dans `src/lib/` : `getCartVM()`
    retourne les lignes enrichies (image, nom produit, nom variant, prix unitaire
    TTC, sous-total, totaux globaux) en view-model sérialisable.
    Test : type-check.

16. **Créer la page panier** — Route `/panier/page.tsx` : affiche les lignes,
    sélecteurs de quantité (server actions), boutons supprimer, totaux, message
    panier vide avec lien catalogue. Metadata `noindex`.
    Test : navigateur — panier vide → message, panier rempli → lignes + totaux.

17. **Ajouter les traductions i18n page panier** — Clés pour titre, colonnes,
    panier vide, totaux, bouton supprimer.
    Test : basculer en EN.

18. **Vérification finale** — type-check + lint + tests.

## Points d'attention

- **Fusion des paniers** : quand un visiteur anonyme se connecte, les lignes du
  panier anonyme s'additionnent (même variant → somme des qty). Le panier anonyme
  est supprimé après fusion. La fusion est déclenchée dans `getOrCreateCart()`.
- **Snapshot de prix** : le `PriceBreakdown` est figé à l'ajout. Pas de recalcul
  auto si le prix produit change (choix produit V1).
- **Cookie `cart_session`** : token aléatoire (cuid), `HttpOnly`, `SameSite=Lax`,
  30 jours. Distinct du cookie Better Auth.
- **`revalidatePath`** : après chaque mutation panier, revalider la layout
  storefront pour mettre à jour le badge.
- **ProductCardVM** : le `defaultVariantId` doit être le premier variant actif
  (par position ou id). La carte n'a pas de sélecteur de variant.
