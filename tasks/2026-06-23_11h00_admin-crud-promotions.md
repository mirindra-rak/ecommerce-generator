# Admin CRUD Catalog Price Rules

**Date:** 2026-06-23 11:00
**Statut:** Terminé

## Contexte

Le module promotions (Catalog Price Rules) dispose du core complet (schema Prisma, repository, service, tests) mais pas d'interface admin. Cette tâche ajoute le CRUD back-office.

## Modifications

- [x] `apps/pharmacie-1/src/app/admin/(protected)/_components/admin-shell.tsx` — ajout entrée Promotions dans la sidebar + topbar
- [x] `apps/pharmacie-1/messages/fr.json` — section `admin.promotions` (60+ clés)
- [x] `apps/pharmacie-1/messages/en.json` — idem en anglais
- [x] `apps/pharmacie-1/src/app/admin/(protected)/promotions/_actions.ts` — Server Actions : create, update, delete, toggle
- [x] `apps/pharmacie-1/src/app/admin/(protected)/promotions/page.tsx` — page liste
- [x] `apps/pharmacie-1/src/app/admin/(protected)/_components/promotions-table.tsx` — table TanStack (recherche, tri, pagination, toggle, badges statut/ciblage)
- [x] `apps/pharmacie-1/src/app/admin/(protected)/promotions/rule-form.tsx` — formulaire (identité, réduction, ciblage dynamique, planification)
- [x] `apps/pharmacie-1/src/app/admin/(protected)/promotions/new/page.tsx` — page création
- [x] `apps/pharmacie-1/src/app/admin/(protected)/promotions/[id]/page.tsx` — page édition

## Notes

- Le sélecteur de cibles (MultiSelect) bascule dynamiquement selon le targetType (catégories, produits, marques)
- Validation serveur : nom requis, discountValue 0-10000 pour pourcentage, targetIds requis si targetType ≠ ALL
- 2 erreurs TS pré-existantes dans search-overlay (non liées) — 0 erreur ajoutée
- Bug corrigé en début de session : `cookieStore.delete()` dans `getCartId()` appelé depuis un Server Component (cart-session.ts)

## Rollback

Supprimer les fichiers créés sous `promotions/` et `_components/promotions-table.tsx`. Reverter les modifications dans `admin-shell.tsx`, `fr.json`, `en.json`.
