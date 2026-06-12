# Story : Provisioning du compte admin + durcissement

**Epic parent** : [Socle d'authentification](../epic.md)
**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation** S

## Contexte

Sans inscription, il faut un moyen de créer le **premier compte admin**, et appliquer un
durcissement de sécurité de base (OWASP) sur la connexion.

## User Story

**En tant qu'**exploitant, **je veux** provisionner un compte admin et durcir la
connexion, **afin de** démarrer en sécurité sans inscription ouverte.

## Critères d'acceptation

### Scénario 1 : Seed du compte admin

- **Étant donné** des variables d'env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- **Quand** j'exécute le seed admin
- **Alors** un utilisateur `ADMIN` est créé avec ce mot de passe (haché)
- **Et** relancer le seed n'échoue pas et ne crée pas de doublon (idempotent)

### Scénario 2 : Connexion du compte seedé

- **Étant donné** le compte admin seedé
- **Quand** je me connecte avec ses identifiants
- **Alors** j'accède au back-office

### Scénario 3 : Rate-limit sur la connexion

- **Étant donné** plusieurs tentatives de connexion échouées rapprochées
- **Quand** le seuil est dépassé
- **Alors** les tentatives suivantes sont temporairement bloquées (anti-bruteforce)

### Scénario 4 : Cookies & secret sûrs

- **Étant donné** une session établie
- **Quand** j'inspecte le cookie de session
- **Alors** il est `httpOnly`, `sameSite` et `secure` en production
- **Et** le secret de session provient d'une variable d'env (jamais committé)

## Non-objectifs

- UI de gestion des comptes staff (création/désactivation via admin) — ultérieur.
- Politique de mot de passe avancée, expiration, rotation.
- Audit log détaillé des connexions (à prévoir avec la conformité, lot 9).

## Contraintes

- Seed idempotent (upsert par email) ; documenté dans le README / `.env.example`.
- Rate-limit fourni par Better Auth ou middleware ; valeurs raisonnables (ex. 5/min).
- Conformité OWASP (lot 9.4) : pas de secret en dur, messages non énumérants.

## Questions ouvertes

- 🚧 Le rate-limit natif de Better Auth suffit-il, ou faut-il un store (Redis) ? Hypothèse :
  natif/en mémoire suffisant pour un déploiement Silo mono-instance ; Redis si multi-instance.
- 🚧 Rotation du mot de passe admin seedé : via re-seed ou future UI ? Hypothèse : re-seed
  pour l'instant.
