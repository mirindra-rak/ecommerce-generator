# Story 04 — Admin catégories & marques

**Date:** 2026-06-12 01:00
**Statut:** Terminé

## Contexte

Back-office pour gérer l'arborescence de catégories et les marques, afin de ne plus
dépendre du seed. Exécution du plan `04-admin-categories-marques-plan.md`.

## Modifications

- [x] `core/.../catalog/catalog-errors.ts` - ReparentCycleError, CategoryNotEmptyError
- [x] `core/.../catalog/category.service.ts` - canReparent + create/update/delete (anti-cycle, traduction FK)
- [x] `core/.../catalog/brand.service.ts` - create/update/delete (slug auto unique)
- [x] `core/.../utils/slugify.ts` - buildUniqueSlug
- [x] `core/.../catalog/index.ts` - exports services + erreurs
- [x] Tests core : category.service (5), brand.service (2), buildUniqueSlug (2) → 29 total
- [x] `app/admin/layout.tsx` - layout + sidebar + banderole « non sécurisée »
- [x] `app/admin/page.tsx` - dashboard (compteurs)
- [x] `app/admin/categories/{page,_actions,category-form,new,[id]}` - CRUD + arbre + anti-cycle
- [x] `app/admin/marques/{page,_actions,brand-form,new,[id]}` - CRUD
- [x] `app/admin/_lib/form-state.ts` - type FormState (useActionState)

## Notes

- Mutations via Server Actions → services de domaine `core` (jamais Prisma direct).
- Accès admin NON protégé (banderole) : auth = socle admin lot 5.1.
- Slug auto-généré uniquement (pas d'édition manuelle) — décision actée.
- Anti-cycle côté domaine (`canReparent` + `findDescendants`) ; suppression protégée
  garantie par `onDelete: Restrict` puis traduite en `CategoryNotEmptyError`.
- Écart vs plan : `SlugConflictError` retirée (inutile, slug rendu unique par
  construction via buildUniqueSlug).
- Détail app : `Category` typé par inférence (pas d'import direct `@prisma/client`,
  dépendance de core).
- Vérifié au runtime (curl) : /admin, /admin/categories (arbre seedé), /admin/marques,
  formulaires — tous 200. Validation : 29 tests, type-check, lint, build verts.

## Rollback

- `git revert` du commit. Aucune migration (réutilise le schéma story 01).
