# pharmacie-generator

Plateforme e-commerce **parapharmacie** sur-mesure (Next.js + PostgreSQL + Prisma),
en modèle **Silo** : 1 déploiement = 1 pharmacie. Réutilisable pour d'autres
pharmacies par re-déploiement (config + thème).

## Démarrage

```bash
pnpm install                                   # dépendances
docker compose up -d                           # PostgreSQL local
cp apps/pharmacie-1/.env.example apps/pharmacie-1/.env
pnpm --filter @pharmacie/core db:generate      # client Prisma
pnpm --filter @pharmacie/core db:migrate       # schéma
pnpm --filter @pharmacie/core db:seed          # données de démo (optionnel)
pnpm dev                                        # http://localhost:4321
```

## Structure

- `apps/pharmacie-1` — l'application d'une pharmacie (storefront + back-office)
- `packages/core` — moteur commerce, domaine, repositories, schéma Prisma
- `packages/ui` — design system thémable (design tokens)

Voir [`ARCHITECTURE.md`](./ARCHITECTURE.md) et [`CLAUDE.md`](./CLAUDE.md).
