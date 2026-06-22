# Plan : Saisie bidirectionnelle HT ↔ TTC dans l'éditeur de déclinaisons

**Ticket** : [saisie-prix-ttc-declinaisons](./2026-06-22-saisie-prix-ttc-declinaisons.md) · **Statut** 🟡

## Résumé

Ajouter un champ « Prix TTC (€) » synchronisé avec le champ « Prix HT (€) » dans
l'éditeur de déclinaisons, piloté par le taux de TVA sélectionné sur le produit.

## Fichiers à créer ou modifier

- `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx` — modifié :
  enrichir `taxRateOptions` pour inclure `rateBps`, tracker le taux sélectionné en
  état React, passer `rateBps` à `VariantsEditor`
- `apps/pharmacie-1/src/app/admin/(protected)/produits/variants-editor.tsx` — modifié :
  ajouter prop `rateBps`, champ TTC par ligne, logique de sync bidirectionnelle
- `apps/pharmacie-1/src/app/admin/(protected)/produits/new/page.tsx` — modifié :
  inclure `rateBps` dans les `taxRateOptions`
- `apps/pharmacie-1/src/app/admin/(protected)/produits/[id]/page.tsx` — modifié :
  inclure `rateBps` dans les `taxRateOptions`
- `apps/pharmacie-1/messages/fr.json` — modifié : ajout clés `priceInclTax`,
  `priceInclTaxPlaceholder`
- `apps/pharmacie-1/messages/en.json` — modifié : idem en anglais

## Étapes de développement

1. **Enrichir le type `Option` avec `rateBps`** — Ajouter un champ `rateBps: number`
   au type `Option` dans `produit-form.tsx`. Mettre à jour les deux pages serveur
   (`new/page.tsx`, `[id]/page.tsx`) pour inclure `taxRate.rateBps` dans chaque option.
   Test : le build TypeScript passe, les pages chargent sans erreur.

2. **Tracker le `rateBps` sélectionné dans `ProductForm`** — Le `Select` pour
   `taxRateId` est actuellement uncontrolled (`defaultValue`). Le convertir en
   controlled pour pouvoir dériver le `rateBps` du taux actif à chaque changement.
   Passer `rateBps` en prop à `VariantsEditor`.
   Test : changer le taux de TVA dans le formulaire → la valeur `rateBps` descendue
   dans `VariantsEditor` se met à jour (vérifiable via React DevTools ou console
   temporaire).

3. **Ajouter le champ TTC dans `VariantsEditor`** — Nouvelle prop `rateBps: number`.
   Ajouter un champ `priceInclTax` (string) à `VariantRow`. Sur chaque ligne,
   afficher les deux inputs côte à côte : « Prix HT (€) » et « Prix TTC (€) ».
   La sync bidirectionnelle se fait dans les handlers `onChange` :
   - HT change → TTC = `(htEuros * (10000 + rateBps) / 10000).toFixed(2)`
   - TTC change → HT = `(ttcEuros * 10000 / (10000 + rateBps)).toFixed(2)`
   - Conversion en euros (pas centimes) côté UI, arrondi au centime (`toFixed(2)`).
   - Champ vide → l'autre est vide aussi.
     Test : saisir 12.50 HT avec TVA 20% → TTC affiche 15.00. Saisir 15.00 TTC →
     HT affiche 12.50.

4. **Recalculer le TTC quand le taux de TVA change** — Utiliser un `useEffect` dans
   `VariantsEditor` déclenché par le changement de `rateBps` : recalculer le TTC
   de chaque ligne à partir du HT courant (le HT reste la source de vérité lors
   d'un changement de taux). Ignorer les lignes dont le HT est vide.
   Test : saisir HT 10.00 avec TVA 20% (TTC 12.00), puis changer à 5.5% → TTC
   passe à 10.55, HT reste 10.00.

5. **Pré-remplir le TTC à l'ouverture d'un produit existant** — Dans `[id]/page.tsx`,
   le `price` est déjà converti en euros. Ajouter le calcul du TTC initial dans le
   même mapping, en utilisant le `rateBps` du produit.
   Test : ouvrir un produit existant → les deux champs HT et TTC sont remplis
   correctement.

6. **Ajouter les traductions i18n** — Ajouter dans les fichiers `messages/fr.json` et
   `messages/en.json` les clés `admin.products.variants.priceInclTax` et
   `admin.products.variants.priceInclTaxPlaceholder`.
   Test : basculer l'admin en EN → le label passe à « Price incl. tax (€) ».

7. **Test navigateur** — Lancer le dev server, ouvrir le formulaire produit. Vérifier
   les 6 scénarios d'acceptation manuellement (HT→TTC, TTC→HT, changement TVA,
   arrondi, chargement existant, champ vide).

## Points d'attention

- **Pas de boucle de sync** : quand le handler HT met à jour le TTC (ou inversement),
  ne pas re-déclencher le handler de l'autre champ. Utiliser le `update()` existant
  qui patche le state React sans déclencher d'`onChange` sur l'input.
- **Arrondi centimique** : la conversion TTC→HT puis HT→TTC peut avoir un écart d'1
  centime sur certaines valeurs (spec l'accepte). L'arrondi se fait avec `toFixed(2)`
  sur les euros, cohérent avec le `Math.round` du noyau pricing sur les centimes.
- **Le TTC n'est pas sérialisé** : le champ caché `variants` (JSON) ne contient que
  `price` (HT). Le TTC est un champ dérivé purement visuel, jamais envoyé au serveur.
- **Select controlled** : le passage du `Select` taxRate en controlled nécessite de
  vérifier que le composant `@pharmacie/ui` le supporte (props `value` + `onChange`).
  🚧 Si le `Select` ne supporte pas le mode controlled, ajouter un `onChange` sur le
  `<select>` natif sous-jacent ou wrapper avec un ref.
