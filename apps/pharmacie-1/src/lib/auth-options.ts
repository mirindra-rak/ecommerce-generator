import { prisma } from "@pharmacie/core";
import { prismaAdapter } from "better-auth/adapters/prisma";

// Options Better Auth PARTAGÉES (sans plugin Next). Réutilisées par l'instance Next
// (lib/auth.ts, + nextCookies) et par le script de seed headless (scripts/seed-admin.ts).
// Secret/URL lus depuis l'env (BETTER_AUTH_SECRET, BETTER_AUTH_URL).
export const authOptions = {
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ["CUSTOMER", "STAFF", "ADMIN"],
        required: false,
        defaultValue: "CUSTOMER",
        input: false, // non modifiable par l'utilisateur lui-même
      },
    },
  },
  // Durcissement : anti-bruteforce sur la connexion. Les appels serveur (auth.api,
  // ex. le seed) contournent le rate-limit. Actif en prod par défaut ; activé aussi en dev.
  rateLimit: {
    enabled: true,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
};
