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

### Itération « vrai site » : images réelles + iconographie — 2026-06-12

Contexte : l'agent catalogue a entre-temps branché `category-grid.tsx`,
`featured-products.tsx`, `product-card.tsx`, `lib/catalog.ts` et ajouté `dynamic`
sur `page.tsx`. Ces fichiers sont **désormais son périmètre** → je ne les modifie
pas (édition directe = clobber silencieux, pas de garde-fou git). Je travaille
dans ma voie + ajout de sections.

Images : téléchargées, **visualisées une à une**, sélection des seules pertinentes
(Unsplash, licence libre). Stockées **en local** sous `public/images/` (contenu
vérifié, aucune dépendance réseau au runtime, pas de modif `next.config`). Servies
via `next/image`. À remplacer par les vrais visuels produits/marques.

- [x] `public/images/{hero,promo-visage,promo-naturel,conseil,loyalty}.jpg` — **nouveaux**
- [x] `_components/icons.tsx` - jeu d'icônes étendu (check, star, leaf, sparkles,
      gift, percent, clock, phone, mail, map-pin, chevron, croix pharmacie, réseaux)
- [x] `_components/payment-marks.tsx` - badges Visa/Mastercard/CB/PayPal/Bancontact — **nouveau**
- [x] `_components/hero.tsx` - réécrit avec image réelle + carte note + badge livraison
- [x] `_components/promo-banners.tsx` - 2 bannières image + overlay — **nouveau**
- [x] `_components/expertise.tsx` - bloc éditorial « conseil pharmacien » — **nouveau**
- [x] `_components/brand-strip.tsx` - bandeau marques (wordmarks) — **nouveau**
- [x] `_components/loyalty-banner.tsx` - bandeau fidélité (image sombre) — **nouveau**
- [x] `_components/newsletter.tsx` - capture e-mail (visuel) — **nouveau**
- [x] `_components/site-header.tsx` - logo croix de pharmacie
- [x] `_components/site-footer.tsx` - logo croix, réseaux sociaux, badges paiement
- [x] `page.tsx` - composition enrichie (préserve `dynamic` de l'agent catalogue)

Non lancé volontairement : second `next dev` (collision cache `.next/` avec l'agent
catalogue). Validation : `tsc --noEmit` + `eslint` = exit 0.

### Design system « officine éditoriale » — 2026-06-12

Retour utilisateur : les composants étaient du **markup natif one-off** (look
générique « site Claude »). Décision : bâtir un vrai design system dans
`@pharmacie/ui` avec un parti pris assumé (validé : serif Fraunces, encre navy,
accent vert, papier, filets hairline, angles nets, motif croix), puis recomposer
le storefront à partir de lui.

Fondations :

- [x] `apps/pharmacie-1/src/app/globals.css` - `@source` vers `packages/ui/src`
      (Tailwind v4 ignore node_modules → sinon classes du DS non générées)
- [x] `apps/pharmacie-1/src/app/layout.tsx` - polices `next/font` (Inter + Fraunces)
- [x] `packages/ui/src/styles/tokens.css` - tokens `--color-paper`, `--color-line`,
      `--font-display`, `--font-sans` (via variables next/font)
- [x] `apps/pharmacie-1/themes/default/theme.css` - encre navy, papier chaud, filet

Primitives (`packages/ui/src/components/` + `lib/cx.ts`, barrel `index.ts`) :

- [x] `Button` (+ `buttonClasses`), `Badge`, `Card`, `Container`, `Section`,
      `Heading`, `Eyebrow`, `IconButton`, `Input`, `Rule`, `Cross`, `ArrowRight`

Recomposition storefront (consomment les primitives, plus de markup ad hoc) :

- [x] `(storefront)/layout.tsx` (fond papier), `hero`, `site-header`,
      `reassurance-bar`, `promo-banners`, `expertise`, `brand-strip`,
      `loyalty-banner`, `newsletter`, `site-footer`

Hors périmètre (agent catalogue) : `category-grid`, `featured-products`,
`product-card` non touchés → restent sur l'ancien style (incohérence visuelle à
résoudre en coordination). Validation : tsc + eslint (UI + app) = exit 0.
Visuel non vérifié (pas de `next dev` lancé : collision cache `.next/`).

### Itération identité Vichy + slider + icônes Phosphor — 2026-06-12

- **Palette** : vert #078f33 dominant (primaire) / bleu #1e4691 secondaire /
  teal #51c0a6 tertiaire / blanc pur. Flip via tokens (`theme.css`), composants suivent.
- **Rayons tokenisés** : règle écrite dans `tokens.css` — tout encadré = `rounded-sm`,
  `rounded-full` réservé aux cercles. Strays (`rounded-md/full`, panneaux sharp) corrigés.
- **Hero = carrousel** : `hero.tsx` client (autoplay 6 s, pause survol/focus, flèches,
  puces-lignes, crossfade), 3 visuels larges téléchargés/vérifiés (`slide-1/2/3.jpg`).
- **Icônes → Phosphor** (`@phosphor-icons/react`, +dep dans `packages/ui`, `pnpm install`).
  Source unique dans le DS (`packages/ui/src/icons.tsx`, re-export sous nos noms) ;
  `ArrowRight` vient de Phosphor (ancienne flèche maison supprimée) ; `Cross` reste
  bespoke (marque). `app/.../icons.tsx` = shim de ré-export (noms conservés → aucun
  import cassé, ProductCard catalogue inclus). RSC-safe (`use client` présent).

Validation à chaque étape : `tsc --noEmit` + `eslint` (UI + app) = exit 0.

### Alignement pragmatique sur le spec de tokens (DTCG) — 2026-06-12

Décisions utilisateur : alignement **pragmatique** (pas full-adopt) + palette **Vichy**
(vert+bleu+teal, neutres navy — on garde, on n'adopte PAS le taupe/sage du spec).

Adopté du spec (dans `packages/ui/src/styles/tokens.css`) :

- **Échelle typo fluide** `clamp()` : override des `--text-*` Tailwind → toutes les
  classes `text-*` deviennent fluides globalement (zéro churn composant).
- **États fonctionnels** success/danger/warning/info (`-bg/-border/-solid/-text`) —
  absents jusqu'ici, requis e-commerce (stock, erreurs). `success` calé sur le vert Vichy.
- **Sémantique** complétée : `text-secondary`, `bg-subtle`, `on-brand`, `focus-ring`.
- **Rayons** alignés (sm4/md6/lg8/xl12). **Ombres** `--shadow-1..4`.
- Espacement déjà 4px (Tailwind) → conforme sans tokens redondants.

Écarts assumés (non adoptés) : pipeline Style Dictionary / `tokens.json` comme source,
dark mode, primitives 12-steps, neutres taupe chaud. Faciles à ajouter ensuite si voulu.

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
