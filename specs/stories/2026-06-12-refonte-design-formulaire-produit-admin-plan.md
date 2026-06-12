# Plan : Refonte du design du formulaire produit (back-office)

**Ticket** : [2026-06-12-refonte-design-formulaire-produit-admin.md](2026-06-12-refonte-design-formulaire-produit-admin.md) · **Statut** 🟡

## Résumé

Refondre `produit-form.tsx` en sections-cartes lisibles et alignées au design system, en
créant au passage les primitives de formulaire manquantes (`Select`, `Textarea`, `Field`),
sans aucun changement fonctionnel (mêmes champs, mêmes `name`, mêmes server actions).

## Fichiers à créer ou modifier

- `packages/ui/src/components/select.tsx` — **créé** : primitive `Select` (select natif stylé
  comme `Input` : filet `border-line`, fond `surface`, focus `brand-500`).
- `packages/ui/src/components/textarea.tsx` — **créé** : primitive `Textarea` (même habillage,
  multi-lignes).
- `packages/ui/src/components/field.tsx` — **créé** : wrapper `Field` (label lié via `htmlFor`,
  aide contextuelle optionnelle, slot enfant pour le contrôle, message d'erreur optionnel).
- `packages/ui/src/index.ts` — **modifié** : exporter `Select`, `Textarea`, `Field` (+ types).
- `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx` — **modifié** : refonte
  en 4 `Card` (Identité, Déclinaison par défaut, Attributs descriptifs, Filtres) + grilles
  responsives + barre d'actions ; remplace `fieldClass`/`labelClass` ad hoc par les primitives.
- `apps/pharmacie-1/src/app/admin/(protected)/produits/{new,[id]}/page.tsx` — **modifié si besoin**
  uniquement : conteneur/espacement ; props et données inchangées.

## Étapes de développement

1. **Primitive `Select`** — select natif habillé comme `Input`, accepte `className` +
   `SelectHTMLAttributes`. Test : `pnpm --filter @pharmacie/ui type-check` ; rendu d'un select
   avec options, focus visible aux tokens.
2. **Primitive `Textarea`** — idem en `<textarea>` (`rows` configurable). Test : type-check.
3. **Primitive `Field`** — `{ label, htmlFor, hint?, error?, children }` : label en `text-sm`
   tokens, aide `text-muted`, erreur `text-danger`. Test : type-check ; le `htmlFor` cible bien
   l'`id` du contrôle.
4. **Exports DS** — ajouter `Select`/`Textarea`/`Field` (+ types) à `index.ts`. Test :
   import depuis `@pharmacie/ui` sans erreur (`type-check` app).
5. **Refonte — section Identité** — `Card` titrée englobant nom, actif, type, marque, catégorie,
   description, via `Field` + `Input`/`Select`/`Textarea`. Conserver `name="name|active|productType|
brandId|categoryId|description"`. Test : `type-check` app ; champs présents, mêmes `name`.
6. **Refonte — section Déclinaison par défaut** — `Card` titrée, grille 2 colonnes (sm/lg) pour
   SKU, EAN, prix (€), stock. `name` inchangés (`sku|ean|price|stock`). Test : rendu grille.
7. **Refonte — section Attributs descriptifs** — `Card` titrée (INCI via `Input`, précautions via
   `Textarea`). `name="inci|precautions"`. Test : type-check.
8. **Refonte — section Filtres / Caractéristiques** — `Card` titrée, cases à cocher groupées par
   facette (inchangées fonctionnellement, `name="facetValueIds"`), habillage tokens. Test : les
   facettes pré-cochées en édition restent cochées.
9. **Barre d'actions** — `Button` DS « Enregistrer » (état « Enregistrement… » via `pending`),
   lien « Annuler », bloc d'erreur `state.error` mis en évidence (token `danger`). Test : visuel.
10. **Vérification iso-fonctionnelle** — `pnpm --filter @pharmacie/core test` (inchangé),
    `type-check` + `lint` + `prettier`, puis smoke `pnpm --filter pharmacie-1 dev` :
    créer un produit, éditer (prix, facettes), confirmer persistance identique et rendu en
    sections + responsive (2 colonnes desktop, 1 colonne mobile).

## Points d'attention

- **Iso-fonctionnel strict** : ne changer aucun attribut `name`, ni la signature des props de
  `ProductForm`, ni les server actions/services — sinon régression de la soumission.
- **Client Component** : `produit-form.tsx` reste `"use client"` (`useActionState`). Les
  primitives DS sont présentationnelles (pas d'état) → compatibles ; ne pas y ajouter de hooks.
- **Checkbox** : pas de primitive `Checkbox` au DS. 🚧 Décision : conserver des `<input
type="checkbox">` natifs habillés aux tokens (périmètre limité) plutôt que créer une 5e
  primitive ; à acter.
- **`Select` valeur par défaut** : conserver `defaultValue` (formulaire non contrôlé) pour
  marque/catégorie/type ; ne pas passer en contrôlé.
- **Réutilisabilité** : `Select`/`Textarea`/`Field` seront réutilisables par les formulaires
  catégories/marques (hors scope ici, mais ne pas coupler au produit).
- 🚧 **Layout** : hypothèse retenue = cartes empilées pleine largeur avec grilles internes
  (pas de colonne latérale « Publication »). Conforme à la story.
