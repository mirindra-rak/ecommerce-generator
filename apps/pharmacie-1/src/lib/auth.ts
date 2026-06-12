import { prisma } from "@pharmacie/core";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";

// Instance Better Auth (couplée Next). Réutilise le singleton Prisma de @pharmacie/core.
// Le secret et l'URL de base sont lus depuis l'environnement (BETTER_AUTH_SECRET,
// BETTER_AUTH_URL). Vérification d'email désactivée (pas d'ESP — cf. epic).
export const auth = betterAuth({
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
  // Doit rester en dernier : permet aux Server Actions de poser les cookies.
  plugins: [nextCookies()],
});

/** Session courante côté serveur (RSC / Server Action), ou null si non connecté. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
