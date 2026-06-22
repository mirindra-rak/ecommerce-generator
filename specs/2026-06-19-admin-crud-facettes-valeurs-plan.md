# Plan : Admin CRUD Facettes & Valeurs

**Ticket** : [admin-crud-facettes-valeurs](./2026-06-19-admin-crud-facettes-valeurs.md) · **Statut** 🟡

## Résumé

Ajouter une page `/admin/facettes` permettant au pharmacien de gérer en CRUD les axes de filtrage (facettes) et leurs valeurs, avec réordonnement et gestion inline des valeurs.

## Fichiers à créer ou modifier

### packages/core (domaine)

- `packages/core/src/modules/catalog/facet.repository.ts` — **modifié** : ajouter les méthodes d'écriture (create, update, delete, reorder pour Facet et FacetValue), compteurs produits par facette
- `packages/core/src/modules/catalog/facet.service.ts` — **créé** : service de domaine (slug auto, unicité code, calcul position, orchestration)
- `packages/core/src/modules/catalog/facet.service.test.ts` — **créé** : tests d'intégration du service
- `packages/core/src/modules/catalog/index.ts` — **modifié** : exporter le service

### apps/pharmacie-1 (admin front)

- `apps/pharmacie-1/src/app/admin/(protected)/facettes/page.tsx` — **créé** : page listing des facettes
- `apps/pharmacie-1/src/app/admin/(protected)/facettes/new/page.tsx` — **créé** : page création facette
- `apps/pharmacie-1/src/app/admin/(protected)/facettes/[id]/page.tsx` — **créé** : page édition facette + gestion inline des valeurs
- `apps/pharmacie-1/src/app/admin/(protected)/facettes/facet-form.tsx` — **créé** : formulaire facette (nom + code affiché en read-only après création)
- `apps/pharmacie-1/src/app/admin/(protected)/facettes/values-editor.tsx` — **créé** : éditeur inline des valeurs (tableau avec ajout/rename/reorder/suppression)
- `apps/pharmacie-1/src/app/admin/(protected)/facettes/_actions.ts` — **créé** : server actions (CRUD facette + CRUD valeur + reorder)
- `apps/pharmacie-1/src/app/admin/(protected)/_components/facettes-table.tsx` — **créé** : table client-side avec recherche (même pattern que marques-table)
- `apps/pharmacie-1/src/app/admin/(protected)/_components/admin-shell.tsx` — **modifié** : ajouter entrée « Facettes » dans le NAV + `getPageTitleKey`

### Traductions

- `apps/pharmacie-1/messages/fr.json` — **modifié** : clés `admin.nav.facets`, `admin.facets.*`
- `apps/pharmacie-1/messages/en.json` — **modifié** : idem en anglais

### Icônes

- `packages/ui/src/icons.tsx` — **modifié** : ajouter `FadersIcon` (Phosphor `Faders`) pour le menu sidebar

## Étapes de développement

### 1. Repository — méthodes d'écriture facette

Enrichir `facetRepository` avec : `findById`, `create`, `update`, `delete`, `reorderFacets`. Ajouter `countProductsByFacet` (nombre de produits liés à chaque facette, pour l'affichage listing).
**Test** : test d'intégration — créer une facette, la retrouver par id, la renommer, la supprimer.

### 2. Repository — méthodes d'écriture valeurs

Ajouter dans `facetRepository` : `createValue`, `updateValue`, `deleteValue`, `reorderValues`.
**Test** : test d'intégration — ajouter une valeur, renommer, réordonner, supprimer. Vérifier la contrainte d'unicité `[facetId, code]`.

### 3. Service de domaine

Créer `facet.service.ts` : `createFacet(name)` → slugify pour le code, position auto (max + 1), erreur si code dupliqué. `updateFacet(id, name)` → rename seul (code immutable). `deleteFacet(id)`. `reorderFacets(ids[])`. Même chose pour les valeurs : `createFacetValue(facetId, label)`, `updateFacetValue(id, label)`, `deleteFacetValue(id)`, `reorderFacetValues(facetId, ids[])`.
**Test** : unicité code vérifiée, code auto-slugifié, position auto-incrémentée.

### 4. Icône + navigation sidebar

Ajouter `FadersIcon` dans `icons.tsx`. Ajouter l'entrée `{ href: "/admin/facettes", labelKey: "nav.facets", Icon: FadersIcon }` dans le `NAV` de `admin-shell.tsx`. Ajouter le cas dans `getPageTitleKey`.
**Test** : visuel — le lien apparaît dans la sidebar entre Marques et Paramètres.

### 5. Page listing `/admin/facettes`

Page serveur chargeant toutes les facettes avec valeurs + compteurs produits. Composant `FacettesTable` (recherche client-side, colonnes : nom, code, nb valeurs, nb produits, actions). Bouton « + Nouvelle facette ». Action supprimer avec confirmation.
**Test** : la page affiche les facettes seedées, la recherche filtre, le bouton supprimer fonctionne.

### 6. Formulaire création `/admin/facettes/new`

Formulaire simple : champ « Nom ». Le code est affiché en preview (slugifié en temps réel depuis le nom, non éditable). Server action `createFacetAction`. Hook `useUnsavedChanges`.
**Test** : créer « Forme galénique » → code = `forme-galenique`, redirige vers le listing.

### 7. Page édition + éditeur de valeurs `/admin/facettes/[id]`

Formulaire : nom modifiable, code affiché en read-only. Section « Valeurs » avec `ValuesEditor` : tableau inline affichant chaque valeur (label éditable, code en read-only, boutons ↑/↓ pour réordonner, bouton supprimer). Bouton « + Ajouter une valeur » en bas. Toute modification (rename, reorder, add, delete valeur) est soumise via server actions dédiées. Hook `useUnsavedChanges` sur le formulaire facette (pas sur l'éditeur de valeurs qui a ses propres actions).
**Test** : renommer la facette, ajouter une valeur, réordonner, supprimer une valeur — vérifier la persistance.

### 8. Traductions FR/EN

Ajouter toutes les clés : `admin.nav.facets`, `admin.facets.pageTitle`, `admin.facets.total`, `admin.facets.new.*`, `admin.facets.edit.*`, `admin.facets.table.*`, `admin.facets.form.*`, `admin.facets.values.*`, `admin.facets.errors.*`.
**Test** : switcher FR/EN dans l'admin, toutes les chaînes s'affichent.

### 9. Vérification cascade suppression

Vérifier que supprimer une facette nettoie bien les `ProductFacetValue` (cascade via `FacetValue` → `ProductFacetValue`). Vérifier que supprimer une valeur seule nettoie aussi ses liaisons produit.
**Test** : supprimer une facette liée à des produits → pas d'orphelins en base.

### 10. Revalidation des pages storefront

Les server actions de facettes doivent appeler `revalidatePath` sur les pages catégorie (sidebar de filtres) en plus de `/admin/facettes`.
**Test** : ajouter une valeur de facette → visible dans les filtres boutique sans redéploiement.

## Points d'attention

- **Code immutable** : le code (facette et valeur) sert de clé dans les URLs de filtrage (`?nature=collutoire`). S'il changeait, les liens bookmarkés/indexés casseraient. Le code est donc affiché en read-only après création dans le formulaire.
- **Cascade suppression** : `onDelete: Cascade` est déjà configuré sur `FacetValue → Facet` et `ProductFacetValue → FacetValue`. La suppression est safe mais irréversible — d'où la confirmation obligatoire.
- **Réordonnement** : boutons ↑/↓ plutôt que drag & drop pour la V1 (accessible clavier, pas de lib externe). Chaque clic appelle une server action qui swap les positions.
- **Pas de formulaire « lourd »** pour les valeurs : les actions sur les valeurs (ajout, rename, reorder, delete) sont des server actions individuelles, pas un submit global du formulaire. Cela évite la complexité d'un état client complexe et la perte de données.
- 🚧 Le `slugify` existant (`packages/core/src/utils/slugify.ts`) doit être réutilisé pour générer les codes. Vérifier qu'il gère bien les accents et caractères spéciaux pharmacie (ex : « Indication / Contre-indication » → `indication-contre-indication`).
