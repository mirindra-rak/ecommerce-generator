# Home page storefront (vitrine pharmacie-1)

**Date:** 2026-06-11 18:50
**Statut:** Terminé

## Contexte

Travail mené **en parallèle** de l'epic Catalogue (lot 4.1), pris en charge par un
autre agent. Objectif : livrer la home page vitrine sans entrer en collision avec
son périmètre.

Garde-fous appliqués :

- **Aucune** modification de `schema.prisma` ni des fichiers de `modules/catalog/`
  (propriété de l'agent catalogue, story 01).
- **Aucune** commande d'état partagé (`pnpm install`, `db:migrate`, `db:generate`,
  build/commit).
- **Pas** de modification de `packages/ui/` (zone où le catalogue ajoutera ses
  `ProductCard`, galerie…) : tous les composants sont **colocalisés** sous
  `app/(storefront)/_components/`.
- **Pas** de modification des tokens (`tokens.css`, `theme.css`, `globals.css`).
- **Zéro dépendance ajoutée** : icônes en SVG inline.
- Contenu **statique** : aucune dépendance aux services catalog (en mutation).

Direction de design : inspirée d'une réf fournie (Cocooncenter) — composition
parapharmacie (bandeau promo, recherche centrale, nav + pills, hero offre,
réassurance à cochets, sélection produits). Marque **bleue** conservée (token
configuré), Inter conservé (design system). Passage en orange éventuel = 1 ligne
dans `themes/default/theme.css`.

## Modifications

- [x] `app/(storefront)/layout.tsx` - layout vitrine (header + footer partagés) — **nouveau**
- [x] `app/(storefront)/page.tsx` - composition de la home (hero/réassurance/catégories/sélection)
- [x] `app/(storefront)/_components/icons.tsx` - jeu d'icônes SVG inline — **nouveau**
- [x] `app/(storefront)/_components/site-header.tsx` - en-tête + nav catégories + pills — **nouveau**
- [x] `app/(storefront)/_components/hero.tsx` - hero + bloc offre + CTA — **nouveau**
- [x] `app/(storefront)/_components/reassurance-bar.tsx` - 4 arguments de confiance — **nouveau**
- [x] `app/(storefront)/_components/category-grid.tsx` - grille univers parapharmacie — **nouveau**
- [x] `app/(storefront)/_components/featured-products.tsx` - sélection produits (placeholder) — **nouveau**
- [x] `app/(storefront)/_components/site-footer.tsx` - footer + mentions légales (site.config) — **nouveau**

### Palette « Pastille Vichy » (bleu marine + vert) — 2026-06-12

- [x] `packages/ui/src/styles/tokens.css` - ajout du namespace de tokens `accent-*`
      (défauts) au design system
- [x] `apps/pharmacie-1/themes/default/theme.css` - `brand-*` → bleu marine Vichy,
      `accent-*` → vert Vichy
- [x] Câblage du vert en accent (tokens, pas de fork) : réassurance (icônes),
      badges promo, bloc offre + pill « Offre du moment », pill « Bons plans »,
      flacon central du hero

## Notes

- `type-check` (tsc --noEmit) et `eslint` : exit 0 sur le périmètre storefront.
- Liens catégories/produits en placeholder (`/categorie/<slug>`, `/produit/<slug>`) :
  404 attendu jusqu'à l'arrivée des routes du lot catalog.
- Prix en **centimes** (entiers) dans `featured-products.tsx`, formatés via
  `Intl.NumberFormat` (locale/devise depuis `site.config`).
- Coutures d'intégration data signalées en commentaire dans `category-grid.tsx`
  et `featured-products.tsx` (à brancher sur les repositories catalog une fois mergé).
- Création de `(storefront)/layout.tsx` : fichier inexistant auparavant. Léger risque
  de conflit add/add si les stories 05/06 (M3) créent aussi ce layout — peu probable
  car l'agent catalogue est sur M1 (données).

## Rollback

```bash
git checkout -- "apps/pharmacie-1/src/app/(storefront)/page.tsx"   # restaure le stub
rm -rf "apps/pharmacie-1/src/app/(storefront)/_components"
rm -f  "apps/pharmacie-1/src/app/(storefront)/layout.tsx"
```
