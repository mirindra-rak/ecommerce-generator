# Plan : Admin CRUD Catalog Price Rules

**Ticket** : [04-admin-crud](./04-admin-crud.md) · **Statut** 🟡

## Résumé

Créer l'interface back-office complète (liste, création, édition, toggle activation, suppression) des Catalog Price Rules, en suivant les patterns admin existants (Server Actions + FormState + TanStack Table + i18n).

## Fichiers à créer ou modifier

### Créer

- `apps/pharmacie-1/src/app/admin/(protected)/promotions/page.tsx` — page liste des règles (Server Component, `force-dynamic`)
- `apps/pharmacie-1/src/app/admin/(protected)/promotions/new/page.tsx` — page création (Server Component, passe `createRuleAction` au formulaire)
- `apps/pharmacie-1/src/app/admin/(protected)/promotions/[id]/page.tsx` — page édition (Server Component, charge la règle existante)
- `apps/pharmacie-1/src/app/admin/(protected)/promotions/_actions.ts` — Server Actions : `createRuleAction`, `updateRuleAction`, `deleteRuleAction`, `toggleRuleAction`
- `apps/pharmacie-1/src/app/admin/(protected)/promotions/rule-form.tsx` — formulaire client (création + édition) avec sélecteur de cibles dynamique
- `apps/pharmacie-1/src/app/admin/(protected)/_components/promotions-table.tsx` — table client TanStack React Table (colonnes, recherche, pagination, toggle inline, actions)

### Modifier

- `apps/pharmacie-1/src/app/admin/(protected)/_components/admin-shell.tsx` — ajouter l'entrée "Promotions" dans la sidebar NAV + `getPageTitleKey`
- `apps/pharmacie-1/messages/fr.json` — ajouter la section `admin.promotions` (page, table, formulaire, erreurs)
- `apps/pharmacie-1/messages/en.json` — idem en anglais
- `packages/ui/src/icons.tsx` — exporter `PercentIcon` dans la section Admin (déjà présent dans les exports mais pas dans le bloc Admin)

## Étapes de développement

### 1. Entrée navigation sidebar

Ajouter `{ href: "/admin/promotions", labelKey: "nav.promotions", Icon: PercentIcon }` dans le tableau `NAV` de `admin-shell.tsx`. Ajouter le cas dans `getPageTitleKey`. Ajouter la clé `nav.promotions` dans les deux fichiers de messages.

Test : la sidebar affiche "Promotions" avec l'icône, le lien mène à `/admin/promotions`, le titre du topbar se met à jour.

### 2. Clés i18n admin promotions

Ajouter dans `fr.json` et `en.json` la section `admin.promotions` avec les sous-clés :

- `pageTitle`, `total`, `new.title`, `new.heading`
- `table.*` : colonnes (nom, statut, réduction, ciblage, priorité, dates), recherche, vide, confirmDelete
- `form.*` : sections (identité, réduction, ciblage, planification, affichage), labels de chaque champ, hints, placeholders
- `errors.*` : nameRequired, invalidDiscountValue, missingTargets, idMissing
- `status.*` : active, inactive, scheduled, expired

Test : pas d'erreur de clé manquante au rendu des pages.

### 3. Server Actions (`_actions.ts`)

Créer les 4 actions en suivant le pattern marques/catégories :

- `createRuleAction(_prev, formData)` → `requireStaff()`, extraction des champs, validation serveur (nom requis, discountValue 0-10000 pour pourcentage, targetIds requis si targetType ≠ ALL), appel `catalogPriceRuleRepository.create()`, `revalidatePath`, `redirect`
- `updateRuleAction(_prev, formData)` → idem avec `catalogPriceRuleRepository.update()`
- `deleteRuleAction(formData)` → `requireStaff()`, `catalogPriceRuleRepository.remove()`, `revalidatePath`, `redirect`
- `toggleRuleAction(formData)` → `requireStaff()`, charge la règle, inverse `active`, `catalogPriceRuleRepository.update()`, `revalidatePath` (pas de redirect, reste sur la liste)

Extraction des champs depuis FormData : `name` (string), `active` (checkbox), `startDate`/`endDate` (string → Date | null), `priority` (number), `targetType` (enum), `discountType` (enum), `discountValue` (number centimes/bps), `floorPrice` (number | null), `customerLabel` (string | null), `showStrikethrough` (checkbox), `targetIds` (via `formData.getAll("targetIds")`).

Test : créer une règle via action directe, vérifier en base qu'elle existe. Tester la validation (nom vide → erreur, pourcentage > 10000 → erreur, targetType CATEGORY sans targetIds → erreur).

### 4. Page liste (`page.tsx` + `promotions-table.tsx`)

**`page.tsx`** (Server Component) : charge `catalogPriceRuleRepository.findMany()`, mappe vers un type `RuleRow` sérialisable (dates → ISO strings, targets simplifiés), passe à `PromotionsTable`.

**`promotions-table.tsx`** (Client Component, pattern MarquesTable) :

- Colonnes : Nom, Statut (badge coloré), Type réduction, Valeur (formatée : "20%" ou "3,00 €"), Ciblage (badge : Tout / X catégorie(s) / X produit(s) / X marque(s)), Priorité, Actions (edit + delete + toggle)
- Statut dérivé côté client : `active && !planifié && !expiré → "active"`, `!active → "inactive"`, `startDate > now → "scheduled"`, `endDate < now → "expired"`
- Toggle : bouton switch inline appelant `toggleRuleAction` via mutation
- Recherche globale, tri, pagination (25 par page)

Test : page `/admin/promotions` affiche la liste, badges de statut corrects, toggle fonctionne, suppression avec confirm.

### 5. Formulaire règle (`rule-form.tsx`)

Client Component recevant `action` (create ou update) et optionnellement `rule` (données existantes pour édition).

Sections du formulaire (pattern `FormSection` de brand-form) :

1. **Identité** : nom (Input, required), active (checkbox), customerLabel (Input, optionnel)
2. **Réduction** : discountType (Select : PERCENTAGE / FIXED_AMOUNT), discountValue (Input number, avec suffixe dynamique "%" ou "€"), floorPrice (Input number, optionnel), showStrikethrough (checkbox)
3. **Ciblage** : targetType (Select : ALL / CATEGORY / PRODUCT / BRAND), targetIds (MultiSelect, conditionnel — masqué si ALL). Les options du MultiSelect sont chargées dynamiquement selon le targetType choisi.
4. **Planification** : startDate (input datetime-local), endDate (input datetime-local), priority (Input number, défaut 0)

Sélecteur de cibles dynamique :

- Les options (catégories, produits, marques) sont passées en props par la page parente (Server Component qui charge depuis les repositories catalog)
- Quand targetType change, le MultiSelect bascule entre les 3 listes d'options
- Les targetIds sélectionnés sont émis via `<input type="hidden" name="targetIds">` (comportement natif du MultiSelect)

Validation côté client : `required` sur nom, contrainte `min/max` sur discountValue selon le type.

Test : formulaire affiche les bons champs, le sélecteur de cibles apparaît/disparaît selon targetType, soumission crée la règle en base.

### 6. Pages création et édition

**`new/page.tsx`** : Server Component, charge les listes de catégories/produits/marques pour les options du sélecteur de cibles, rend `<RuleForm action={createRuleAction} categories={...} products={...} brands={...} />`.

**`[id]/page.tsx`** : Server Component, charge la règle via `catalogPriceRuleRepository.findById(id)` + les mêmes listes d'options, `notFound()` si inexistante, rend `<RuleForm action={updateRuleAction} rule={...} categories={...} products={...} brands={...} />`.

Test : `/admin/promotions/new` crée une règle, `/admin/promotions/<id>` charge et modifie une règle existante, redirect vers la liste après sauvegarde.

### 7. Vérification intégration complète

Parcours complet de bout en bout :

- Créer une règle percentage 20% sur catégorie "Visage", vérifier dans la liste (badge "active", ciblage "1 catégorie")
- Modifier la valeur à 30%, vérifier la mise à jour
- Désactiver via toggle, vérifier le badge "inactive"
- Supprimer, vérifier la disparition

Test : type-check (`pnpm type-check`), dev server sans erreur, parcours navigateur.

## Points d'attention

- **Sérialisation des dates** : les `Date` Prisma ne passent pas directement en props client. Les pages Server Component doivent convertir en ISO string, le formulaire reconvertit en `Date` pour la soumission.
- **MultiSelect options volumineuses** : si le catalogue a des centaines de produits, le chargement de la liste complète pour le sélecteur peut être lourd. En V1, on charge tout (acceptable pour une pharmacie, ~500-2000 produits max). 🚧 Si performance insuffisante, envisager un endpoint de recherche asynchrone plus tard.
- **Validation cohérente** : la validation serveur dans les actions est la source de vérité. La validation client (HTML5 `required`, `min`, `max`) est un confort UX, pas un remplacement.
- **Toggle inline** : `toggleRuleAction` utilise `revalidatePath` sans `redirect` pour que la table se rafraîchisse sur place. Vérifier que le `useMutation` + `invalidateQueries` fonctionne bien avec le revalidate côté serveur (pattern déjà validé dans MarquesTable).
- **Pas d'icône Promotions dans la sidebar actuellement** : `PercentIcon` est déjà exporté par `@pharmacie/ui` (ligne 22 de icons.tsx), donc pas besoin de modification du package UI.
