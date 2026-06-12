# Story 02 (auth) — RBAC & protection du back-office /admin

**Date:** 2026-06-12 08:10
**Statut:** Terminé

## Contexte

Fermer /admin : seuls STAFF/ADMIN accèdent. Exécution du plan
`02-rbac-protection-back-office-plan.md`. Jalon M1 de l'epic auth atteint.

## Modifications

- [x] `apps/pharmacie-1/src/lib/auth-guard.ts` - requireStaff() + getCurrentUser()
- [x] Route group `app/admin/(protected)/` - git mv de page/categories/marques/\_lib
- [x] `app/admin/(protected)/layout.tsx` - layout gardé (requireStaff, sidebar SANS banderole, email+rôle)
- [x] `app/admin/layout.tsx` - SUPPRIMÉ (banderole « non sécurisée » retirée)
- [x] `app/admin/login/page.tsx` - placeholder (vrai formulaire = story 03)
- [x] `app/admin/forbidden/page.tsx` - page 403
- [x] `(protected)/categories/_actions.ts` + `marques/_actions.ts` - requireStaff() en tête de chaque action

## Notes

- Route group `(protected)` : URLs inchangées ; login + forbidden HORS garde (évite la
  boucle de redirection).
- Défense en profondeur : garde dans le layout + requireStaff() dans chaque Server Action.
- `session.user.role` casté en `Role` pour `isStaff`.
- Galère cache : après le `git mv`, `.next/types` périmé cassait `tsc` (TS6053) — résolu
  en repartant d'un `.next` propre (déplacé hors projet, pas de rm -rf).
- Smoke runtime : anonyme→307 /admin/login ; CUSTOMER→307 /admin/forbidden ; STAFF→200.
- Validation : 32 tests, type-check, lint, build verts.
- Reste epic : story 03 (UI login/logout), story 04 (seed admin + durcissement).

## Rollback

- `git revert`. Le route group peut être re-aplati (git mv inverse) si besoin.
