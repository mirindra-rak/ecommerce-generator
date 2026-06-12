# Story 03 (auth) — UI connexion / déconnexion admin

**Date:** 2026-06-12 09:00
**Statut:** Terminé

## Contexte

Vrai formulaire de connexion + déconnexion. Exécution du plan
`03-ui-connexion-deconnexion-admin-plan.md`. **Clôt l'epic auth (jalon M2).**

## Modifications

- [x] `app/admin/login/login-form.tsx` - formulaire client (authClient.signIn.email, pending, erreur générique)
- [x] `app/admin/login/page.tsx` - page server : redirige /admin si déjà connecté staff
- [x] `app/admin/(protected)/logout-button.tsx` - bouton client (authClient.signOut → /admin/login)
- [x] `app/admin/(protected)/layout.tsx` - intègre LogoutButton

## Notes

- Connexion côté client (authClient.signIn.email) ; succès → router.push("/admin") + router.refresh().
- Authentifie ≠ autorise : un CUSTOMER connecté est renvoyé vers /admin/forbidden par le RBAC.
- Erreur non énumérante : tout échec → « Identifiants invalides. » (jamais error.message).
- Primitives @pharmacie/ui (Card/Input/Button/Heading) — convention design-system-first.
- Smoke runtime : /admin/login anonyme → 200 + champs email/mdp ; cookie admin sur
  /admin/login → 307 /admin ; sign-out → 200 + get-session null.
- Observation sécurité : Better Auth applique une protection CSRF (Origin) + exige
  Content-Type JSON sur les endpoints sensibles → les 415/403 en curl nu étaient des
  artefacts (authClient envoie les bons en-têtes en navigateur).
- Validation : 32 tests, type-check, lint, build verts.
- Interactions JS (submit erreur, logout) : couvertes par le smoke API + e2e Playwright
  ultérieur (lot 11.7).

## Rollback

- `git revert`. Restaure le placeholder /admin/login si besoin.
