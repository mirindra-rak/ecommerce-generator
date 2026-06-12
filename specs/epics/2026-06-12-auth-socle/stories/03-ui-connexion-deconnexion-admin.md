# Story : UI connexion / déconnexion admin

**Epic parent** : [Socle d'authentification](../epic.md)
**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation** M

## Contexte

Donner au staff un moyen de se connecter et se déconnecter du back-office, avec une UI
soignée (primitives `@pharmacie/ui`) et des messages d'erreur sûrs.

## User Story

**En tant que** membre de l'équipe, **je veux** une page de connexion et un bouton de
déconnexion, **afin d'**accéder au back-office en toute sécurité.

## Critères d'acceptation

### Scénario 1 : Page de connexion

- **Étant donné** la page `/admin/login`
- **Quand** je l'ouvre
- **Alors** je vois un formulaire email + mot de passe (composants `@pharmacie/ui`)

### Scénario 2 : Connexion réussie

- **Étant donné** des identifiants valides d'un compte `STAFF`/`ADMIN`
- **Quand** je soumets le formulaire
- **Alors** une session est créée et je suis redirigé vers `/admin`

### Scénario 3 : Connexion échouée (non énumérante)

- **Étant donné** un email inconnu **ou** un mot de passe erroné
- **Quand** je soumets
- **Alors** un message générique « identifiants invalides » s'affiche (sans révéler si
  l'email existe)
- **Et** aucune session n'est créée

### Scénario 4 : Déconnexion

- **Étant donné** un membre du staff connecté
- **Quand** il clique sur « Se déconnecter »
- **Alors** la session est détruite et il est redirigé hors du back-office

### Scénario 5 : Déjà connecté

- **Étant donné** un utilisateur déjà connecté avec un rôle suffisant
- **Quand** il ouvre `/admin/login`
- **Alors** il est redirigé vers `/admin` (pas de double connexion)

## Non-objectifs

- Inscription, « mot de passe oublié », vérification email (epic ultérieur / ESP).
- Connexion sociale, 2FA.
- Page de connexion **client** (storefront) — distincte, plus tard.

## Contraintes

- UI via primitives `@pharmacie/ui` (`Input`, `Button`, `Card`…), thémable par tokens.
- Soumission via Server Action ou client Better Auth ; pending state + erreurs gérés.
- Pas d'énumération d'utilisateurs ; pas de fuite de détail technique dans l'UI.

## Questions ouvertes

- 🚧 Le bouton de déconnexion se place où ? Hypothèse : dans la sidebar/topbar du
  layout admin, avec le nom/role de l'utilisateur connecté.
