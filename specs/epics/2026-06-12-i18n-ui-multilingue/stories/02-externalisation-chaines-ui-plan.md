# Plan : Externalisation des chaînes UI storefront (FR/EN)

**Ticket** : [02-externalisation-chaines-ui](./02-externalisation-chaines-ui.md) · **Statut** 🟡

## Résumé

Extraire tous les libellés d'interface du storefront vers `messages/{fr,en}.json` (namespaces
par composant), brancher chaque composant sur next-intl (`useTranslations` / `getTranslations`),
et garantir parité + typage des clés — sans toucher au contenu issu de la base. **En passant**,
remplacer les placeholders qui mockaient des données désormais seedées (marques) par les
données réelles via repository.

## Retrait des placeholders (seed-backés uniquement)

Le seed couvre 46 catégories / 72 marques / 98 produits. `category-grid`, `featured-products`,
`mega-menu`/`header` lisent **déjà** le vrai catalogue. Seul **`brand-strip`** mocke encore des
données seedées (8 marques en dur vs 72 en base) → le câbler sur `brandRepository.findMany()`.
Retirer aussi le badge debug `image : {coverImageKey}` (page catégorie).

**Hors scope (NON seed-backé, ne pas toucher ici)** : slides `hero` (éditorial/CMS, lot 4.16),
liens `footer` vers pages non créées, aperçus image catégorie/produit (lot upload d'images).

## Décisions techniques (verrouillées)

- **API par composant** : `getTranslations` (async) pour les composants/pages **async**
  (`site-header`, `category-grid`, `featured-products`, `categorie/[slug]`, `produit/[slug]`
  - tous les `generateMetadata`) ; `useTranslations` partout ailleurs (sync server + client).
- **Tableaux `const`** (SLIDES, ITEMS, COLUMNS…) : conserver la **structure** (Icon, href,
  image, couleur) dans le code ; n'externaliser que le **texte**, via une clé stable par item.
- **`brand-strip` data-driven** : passe en composant **async** lisant les vraies marques
  (`brandRepository.findMany()` via un nouveau VM `getBrands` dans `lib/catalog`). Les noms de
  marques deviennent donc du **contenu DB** (non traduit) ; ne restent à traduire que les 2
  accroches (« Vos marques préférées », « Toutes les marques »). Async → `getTranslations`.
- **Non-traduisible (liste blanche)** : noms de marques (DB désormais, `SOCIALS`), `payment-marks`
  (Visa/Mastercard/CB/PayPal/Bancontact), `siteConfig.brand.*`. `siteConfig.locale.legalMentions`
  **reste servi depuis la config** (FR, conformité parapharmacie) — hors traduction en V1.
- **Contenu base** (noms/descriptions produits & catégories, `facet.name`/valeurs) : **non
  traduit** (hors scope epic).
- **Montants/devise** (« 49 € », `priceLabel`) : restent des **chaînes de message** ou du
  contenu ; pas de formatage par locale en V1 (relève de pricing/V2).

## Fichiers à créer ou modifier

**Messages & garde-fous**

- `apps/pharmacie-1/messages/fr.json` — namespaces complets (FR, source de vérité) _(modifié)_
- `apps/pharmacie-1/messages/en.json` — miroir EN, mêmes clés _(modifié)_
- `apps/pharmacie-1/global.d.ts` — augmentation `next-intl` (`AppConfig.Messages`/`Locale`) → clés typées _(créé)_
- `apps/pharmacie-1/src/i18n/messages.test.ts` — test de **parité de clés** FR/EN (vitest) _(créé)_

**Composants (branchement traductions)**

- `_components/site-header.tsx` — `getTranslations` (bandeau, recherche, aria comptes/menu) _(modifié)_
- `_components/reassurance-bar.tsx` — `useTranslations` (4 items title/subtitle) _(modifié)_
- `_components/site-footer.tsx` — labels colonnes/liens + copyright/paiement (hrefs & noms réseaux conservés) _(modifié)_
- `_components/brand-strip.tsx` — **async**, marques réelles via `getBrands` + 2 accroches traduites (suppression du tableau `BRANDS` en dur) _(modifié)_
- `apps/pharmacie-1/src/lib/catalog.ts` — ajout VM `getBrands()` (mappe `brandRepository.findMany()` → `{ name, slug }[]`) _(modifié)_
- `_components/hero.tsx` — `useTranslations` (slides eyebrow/title/text/cta, stats, « Voir le catalogue », aria) _(modifié)_
- `_components/mega-menu.tsx` — `useTranslations` (« Tous les produits », « Bons plans », « Premium », « Tout {category} », aria) _(modifié)_
- `_components/promo-banners.tsx` · `_components/category-grid.tsx` · `_components/featured-products.tsx` · `_components/expertise.tsx` · `_components/loyalty-banner.tsx` · `_components/newsletter.tsx` — sections home _(modifiés)_
- `_components/product-card.tsx` — libellés UI éventuels (« dès », etc.) _(modifié)_
- `_components/category-filters.tsx` — `useTranslations` (« Filtres », « Réinitialiser les filtres ») _(modifié)_

**Pages**

- `categorie/[slug]/page.tsx` — `getTranslations` : « Accueil », **pluriel** produits, message vide, metadata _(modifié)_
- `produit/[slug]/page.tsx` — `getTranslations` : `PRODUCT_TYPE_LABEL`, « dès/HT », « Ajouter au panier », « Références », « Composition (INCI) », « Précautions d'emploi », metadata _(modifié)_

**Inchangé (liste blanche)** : `_components/payment-marks.tsx`, `_components/icons.tsx`.

## Étapes de développement

1. **Catalogues de messages** — définir tous les namespaces dans `fr.json` (source) puis miroir
   `en.json` : `common`, `header`, `reassurance`, `footer`, `brandStrip`, `hero`, `megaMenu`,
   `promo`, `categoryGrid`, `featuredProducts`, `expertise`, `loyalty`, `newsletter`,
   `productCard`, `categoryFilters`, `categoryPage`, `productPage`. Test : JSON valides.
2. **Clés typées** — `global.d.ts` augmentant `next-intl` (Messages = typeof fr.json, Locale).
   Test : `type-check` ; une clé inconnue dans un `t()` provoque une erreur TS.
3. **Test de parité** — `messages.test.ts` aplatit les deux JSON et compare les ensembles de
   clés. Test : vert quand identiques, rouge si une clé manque d'un côté.
4. **Header + réassurance** — brancher `site-header` (`getTranslations`) et `reassurance-bar`
   (`useTranslations`, items par clé stable). Test : `/en` affiche bandeau/aria en anglais.
5. **Footer + brand-strip** — footer : externaliser labels de liens/colonnes (hrefs & réseaux
   conservés). brand-strip : ajouter `getBrands()` dans `lib/catalog`, passer le composant en
   async lisant les vraies marques, supprimer le tableau `BRANDS`, traduire les 2 accroches.
   Test : colonnes traduites en `/en` ; le strip affiche des marques **issues du seed** (ex.
   A-DERMA, AVENE, BIODERMA…), plus aucune liste codée en dur.
6. **Hero + mega-menu** (client) — `useTranslations`, slides et nav par clés. Test : carrousel
   et menu en anglais sur `/en`, aria traduits.
7. **Sections home restantes** — promo-banners, category-grid, featured-products, expertise,
   loyalty-banner, newsletter, product-card. Test : page d'accueil `/en` sans texte FR résiduel.
8. **Filtres + page catégorie** — `category-filters` (« Filtres »/« Réinitialiser ») ; page
   catégorie avec **pluriel ICU** pour le compteur produits et message d'état vide ; **retirer le
   badge debug** `image : {coverImageKey}`. Test : `/en/categorie/<slug>` — « N products »,
   « No products match… », plus de badge debug.
9. **Page produit** — types produit (enum), libellés prix/CTA/détails, metadata. Test :
   `/en/produit/<slug>` — type, « Add to cart », sections détails en anglais.
10. **Validation transverse** — `pnpm lint`, `type-check`, `build`, `test` (parité) ; recherche
    de chaînes FR résiduelles hors liste blanche. Test : pipeline vert + revue grep.

## Points d'attention

- **Async vs sync** : se tromper d'API casse le rendu. Règle ferme — composant `async` →
  `getTranslations` ; sinon `useTranslations`. Liste async : `site-header`, `category-grid`,
  `featured-products`, les 2 pages dynamiques, et tout `generateMetadata`.
- **Tableaux au scope module** : un `t()` ne peut pas vivre dans un `const` hors composant ;
  déplacer le mapping texte **dans** le corps du composant (garder la structure statique dehors).
- **Doublon de contenu** : « Livraison offerte dès 49 € » apparaît dans le bandeau header **et**
  `reassurance-bar`. Mitigation : clé partagée `common.freeShipping` réutilisée aux deux endroits.
- **Pluriels** : compteur produits (page catégorie) + éventuels « N produits ». Utiliser la
  syntaxe ICU `{count, plural, …}`, pas une concaténation `produit + s`.
- **Critère « zéro chaîne en dur »** : impossible à prouver à 100 % automatiquement (les noms
  propres restent). Définir la **liste blanche** ci-dessus et vérifier par grep ciblé + revue.
- **Doublon de clés storefront/admin** : `common.*` factorisable, mais l'admin (story 05) a son
  propre périmètre — ne pas sur-anticiper ici, garder `common` minimal et storefront-centré.
- **brand-strip — cardinalité** : 72 marques ne tiennent pas dans le bandeau (grille de ~8).
  `getBrands()` prend une **limite** (ex. 12–16) ; ordre par défaut alphabétique faute de flag
  « mise en avant » en base. La typographie per-marque (`className`) du mock disparaît → rendu
  uniforme (acceptable). 🚧 Critère de sélection des marques affichées à confirmer (alpha vs
  aléatoire vs futur flag `featured`).

## Questions techniques à trancher avant de coder

- 🚧 **Qualité de la copy EN** : qui valide les traductions ? Par défaut, EN = traduction
  raisonnable « officine éditoriale » posée par le dev, **à faire relire** (placeholder assumé).
- 🚧 **Granularité des namespaces** : un namespace par composant (retenu) vs regroupement par
  page. Retenu : **par composant** (colocalisation mentale, réutilisation via `common`).
