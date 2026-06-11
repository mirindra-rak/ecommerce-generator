# Image de production pour UN site (Silo). À builder depuis la racine du monorepo :
#   docker build -f apps/pharmacie-1/Dockerfile -t pharmacie-1 .
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# --- Dépendances (cache sur les manifests) ---
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages/core/package.json packages/core/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY apps/pharmacie-1/package.json apps/pharmacie-1/package.json
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @pharmacie/core db:generate
RUN pnpm --filter pharmacie-1 build

# --- Runtime (Next standalone) ---
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/apps/pharmacie-1/.next/standalone ./
COPY --from=build /app/apps/pharmacie-1/.next/static ./apps/pharmacie-1/.next/static
COPY --from=build /app/apps/pharmacie-1/public ./apps/pharmacie-1/public
EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/pharmacie-1/server.js"]
